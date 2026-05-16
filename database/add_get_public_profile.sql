-- Run in Supabase SQL Editor if other users' profiles return 404
CREATE OR REPLACE FUNCTION public.get_public_profile(p_profile_id UUID)
RETURNS public.profiles AS $$
  SELECT * FROM public.profiles
  WHERE id = p_profile_id
    AND (NOT is_banned OR auth.uid() = p_profile_id)
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.get_public_profile(UUID) TO anon, authenticated;
