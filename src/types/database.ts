export type Profile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  grade: string;
  bio: string | null;
  avatar_url: string | null;
  elo_rating: number;
  total_wins: number;
  total_losses: number;
  streak_count: number;
  fire_score: number;
  is_banned: boolean;
  is_online: boolean;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Vote = {
  id: string;
  voter_id: string;
  winner_id: string;
  loser_id: string;
  winner_elo_before: number;
  loser_elo_before: number;
  winner_elo_after: number;
  loser_elo_after: number;
  created_at: string;
};

export type Report = {
  id: string;
  reporter_id: string;
  reported_id: string;
  reason: string;
  details: string | null;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  created_at: string;
};

export type Admin = {
  id: string;
  user_id: string;
  role: "moderator" | "admin" | "super_admin";
  created_at: string;
};

export type RatingHistory = {
  id: string;
  profile_id: string;
  elo_rating: number;
  delta: number;
  vote_id: string | null;
  created_at: string;
};

export type ActivityFeedItem = {
  id: string;
  profile_id: string;
  type: "vote_win" | "vote_loss" | "streak" | "milestone" | "joined";
  message: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  profile?: Pick<Profile, "id" | "first_name" | "last_name" | "avatar_url">;
};

export type LeaderboardEntry = Pick<
  Profile,
  | "id"
  | "first_name"
  | "last_name"
  | "avatar_url"
  | "elo_rating"
  | "total_wins"
  | "streak_count"
  | "fire_score"
  | "grade"
> & { rank: number };

export type VotePair = {
  left: Profile;
  right: Profile;
};

export type LeaderboardType = "rating" | "trending" | "wins" | "streak";
