-- CoolSchool PostgreSQL Schema for Supabase
-- Run in Supabase SQL Editor

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  grade TEXT NOT NULL DEFAULT '',
  bio TEXT,
  avatar_url TEXT,
  elo_rating INTEGER NOT NULL DEFAULT 1000,
  total_wins INTEGER NOT NULL DEFAULT 0,
  total_losses INTEGER NOT NULL DEFAULT 0,
  streak_count INTEGER NOT NULL DEFAULT 0,
  fire_score NUMERIC(10, 2) NOT NULL DEFAULT 0,
  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_elo ON public.profiles(elo_rating DESC) WHERE NOT is_banned;
CREATE INDEX IF NOT EXISTS idx_profiles_fire ON public.profiles(fire_score DESC) WHERE NOT is_banned;
CREATE INDEX IF NOT EXISTS idx_profiles_wins ON public.profiles(total_wins DESC) WHERE NOT is_banned;
CREATE INDEX IF NOT EXISTS idx_profiles_streak ON public.profiles(streak_count DESC) WHERE NOT is_banned;
CREATE INDEX IF NOT EXISTS idx_profiles_name ON public.profiles(first_name, last_name) WHERE NOT is_banned;
CREATE INDEX IF NOT EXISTS idx_profiles_grade ON public.profiles(grade) WHERE NOT is_banned;

-- ============================================================
-- ADMINS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'moderator' CHECK (role IN ('moderator', 'admin', 'super_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admins_user ON public.admins(user_id);

-- ============================================================
-- VOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  winner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  loser_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  winner_elo_before INTEGER NOT NULL,
  loser_elo_before INTEGER NOT NULL,
  winner_elo_after INTEGER NOT NULL,
  loser_elo_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT votes_different_players CHECK (winner_id <> loser_id),
  CONSTRAINT votes_not_self CHECK (voter_id <> winner_id AND voter_id <> loser_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_voter ON public.votes(voter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_winner ON public.votes(winner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_loser ON public.votes(loser_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_created ON public.votes(created_at DESC);

-- Prevent duplicate rapid votes on same pair
CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_unique_pair_recent
  ON public.votes(voter_id, winner_id, loser_id, (created_at::date));

-- ============================================================
-- RATING HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rating_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  elo_rating INTEGER NOT NULL,
  delta INTEGER NOT NULL,
  vote_id UUID REFERENCES public.votes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rating_history_profile ON public.rating_history(profile_id, created_at DESC);

-- ============================================================
-- REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status, created_at DESC);

-- ============================================================
-- USER SESSIONS (activity tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ip_hash TEXT,
  user_agent TEXT,
  last_vote_at TIMESTAMPTZ,
  vote_count_window INTEGER NOT NULL DEFAULT 0,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON public.user_sessions(user_id);

-- ============================================================
-- ACTIVITY FEED
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('vote_win', 'vote_loss', 'streak', 'milestone', 'joined')),
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_feed_created ON public.activity_feed(created_at DESC);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Fire score decay function (call via cron or edge function)
CREATE OR REPLACE FUNCTION public.decay_fire_scores()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET fire_score = GREATEST(0, fire_score * 0.85)
  WHERE fire_score > 0 AND NOT is_banned;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, grade, bio)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Student'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'grade', ''),
    COALESCE(NEW.raw_user_meta_data->>'bio', NULL)
  );
  INSERT INTO public.activity_feed (profile_id, type, message)
  VALUES (NEW.id, 'joined', 'joined CoolSchool');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Process vote atomically
CREATE OR REPLACE FUNCTION public.process_vote(
  p_voter_id UUID,
  p_winner_id UUID,
  p_loser_id UUID,
  p_winner_elo_before INTEGER,
  p_loser_elo_before INTEGER,
  p_winner_elo_after INTEGER,
  p_loser_elo_after INTEGER,
  p_winner_delta INTEGER,
  p_loser_delta INTEGER,
  p_winner_streak INTEGER,
  p_loser_streak INTEGER,
  p_winner_fire_boost NUMERIC,
  p_loser_fire_decay NUMERIC
)
RETURNS UUID AS $$
DECLARE
  v_vote_id UUID;
BEGIN
  IF p_voter_id = p_winner_id OR p_voter_id = p_loser_id THEN
    RAISE EXCEPTION 'Cannot vote on yourself';
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE id IN (p_winner_id, p_loser_id) AND is_banned) THEN
    RAISE EXCEPTION 'Player is banned';
  END IF;

  INSERT INTO public.votes (
    voter_id, winner_id, loser_id,
    winner_elo_before, loser_elo_before,
    winner_elo_after, loser_elo_after
  ) VALUES (
    p_voter_id, p_winner_id, p_loser_id,
    p_winner_elo_before, p_loser_elo_before,
    p_winner_elo_after, p_loser_elo_after
  ) RETURNING id INTO v_vote_id;

  UPDATE public.profiles SET
    elo_rating = p_winner_elo_after,
    total_wins = total_wins + 1,
    streak_count = p_winner_streak,
    fire_score = fire_score + p_winner_fire_boost,
    updated_at = NOW()
  WHERE id = p_winner_id;

  UPDATE public.profiles SET
    elo_rating = p_loser_elo_after,
    total_losses = total_losses + 1,
    streak_count = p_loser_streak,
    fire_score = GREATEST(0, fire_score - p_loser_fire_decay),
    updated_at = NOW()
  WHERE id = p_loser_id;

  INSERT INTO public.rating_history (profile_id, elo_rating, delta, vote_id)
  VALUES
    (p_winner_id, p_winner_elo_after, p_winner_delta, v_vote_id),
    (p_loser_id, p_loser_elo_after, p_loser_delta, v_vote_id);

  INSERT INTO public.activity_feed (profile_id, type, message, metadata)
  VALUES
    (p_winner_id, 'vote_win', 'won a matchup', jsonb_build_object('vote_id', v_vote_id, 'delta', p_winner_delta)),
    (p_loser_id, 'vote_loss', 'lost a matchup', jsonb_build_object('vote_id', v_vote_id, 'delta', p_loser_delta));

  IF p_winner_streak >= 5 AND p_winner_streak % 5 = 0 THEN
    INSERT INTO public.activity_feed (profile_id, type, message, metadata)
    VALUES (p_winner_id, 'streak', format('🔥 %s win streak!', p_winner_streak),
      jsonb_build_object('streak', p_winner_streak));
  END IF;

  RETURN v_vote_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Random vote pair
CREATE OR REPLACE FUNCTION public.get_vote_pair(p_exclude_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID, email TEXT, first_name TEXT, last_name TEXT, grade TEXT, bio TEXT,
  avatar_url TEXT, elo_rating INTEGER, total_wins INTEGER, total_losses INTEGER,
  streak_count INTEGER, fire_score NUMERIC, is_banned BOOLEAN, is_online BOOLEAN,
  last_seen_at TIMESTAMPTZ, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
  slot TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH candidates AS (
    SELECT p.*, ROW_NUMBER() OVER (ORDER BY RANDOM()) AS rn
    FROM public.profiles p
    WHERE NOT p.is_banned
      AND (p_exclude_id IS NULL OR p.id <> p_exclude_id)
      AND p.avatar_url IS NOT NULL
    LIMIT 20
  ),
  picked AS (
    SELECT * FROM candidates ORDER BY rn LIMIT 2
  )
  SELECT
    p.id, p.email, p.first_name, p.last_name, p.grade, p.bio,
    p.avatar_url, p.elo_rating, p.total_wins, p.total_losses,
    p.streak_count, p.fire_score, p.is_banned, p.is_online,
    p.last_seen_at, p.created_at, p.updated_at,
    CASE WHEN p.rn = 1 THEN 'left' ELSE 'right' END AS slot
  FROM (
    SELECT c.*, ROW_NUMBER() OVER () AS rn FROM picked c
  ) p;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Leaderboard function
CREATE OR REPLACE FUNCTION public.get_leaderboard(
  p_type TEXT DEFAULT 'rating',
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  rank BIGINT,
  id UUID, first_name TEXT, last_name TEXT, avatar_url TEXT,
  elo_rating INTEGER, total_wins INTEGER, streak_count INTEGER,
  fire_score NUMERIC, grade TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (
      ORDER BY
        CASE p_type
          WHEN 'trending' THEN p.fire_score
          WHEN 'wins' THEN p.total_wins::NUMERIC
          WHEN 'streak' THEN p.streak_count::NUMERIC
          ELSE p.elo_rating::NUMERIC
        END DESC NULLS LAST
    ) + p_offset AS rank,
    p.id, p.first_name, p.last_name, p.avatar_url,
    p.elo_rating, p.total_wins, p.streak_count, p.fire_score, p.grade
  FROM public.profiles p
  WHERE NOT p.is_banned
  ORDER BY
    CASE p_type
      WHEN 'trending' THEN p.fire_score
      WHEN 'wins' THEN p.total_wins::NUMERIC
      WHEN 'streak' THEN p.streak_count::NUMERIC
      ELSE p.elo_rating::NUMERIC
    END DESC NULLS LAST
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search profiles
CREATE OR REPLACE FUNCTION public.search_profiles(p_query TEXT, p_limit INTEGER DEFAULT 20)
RETURNS SETOF public.profiles AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.profiles
  WHERE NOT is_banned
    AND (
      first_name ILIKE '%' || p_query || '%'
      OR last_name ILIKE '%' || p_query || '%'
      OR grade ILIKE '%' || p_query || '%'
      OR (first_name || ' ' || last_name) ILIKE '%' || p_query || '%'
    )
  ORDER BY elo_rating DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public profile lookup (leaderboards, search links, etc.)
CREATE OR REPLACE FUNCTION public.get_public_profile(p_profile_id UUID)
RETURNS public.profiles AS $$
  SELECT * FROM public.profiles
  WHERE id = p_profile_id
    AND (NOT is_banned OR auth.uid() = p_profile_id)
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Is admin check
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = p_user_id);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rating_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (NOT is_banned OR auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND NOT is_banned);

-- Votes policies
CREATE POLICY "Votes viewable by authenticated"
  ON public.votes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own votes"
  ON public.votes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = voter_id);

-- Reports
CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can update reports"
  ON public.reports FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));

-- Rating history
CREATE POLICY "Rating history viewable"
  ON public.rating_history FOR SELECT USING (true);

-- Activity feed
CREATE POLICY "Activity feed viewable"
  ON public.activity_feed FOR SELECT USING (true);

-- Admins
CREATE POLICY "Admins viewable by admins"
  ON public.admins FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- User sessions
CREATE POLICY "Users manage own sessions"
  ON public.user_sessions FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- STORAGE
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_feed;
