-- Seed data for development (run after schema)
-- Note: profiles require auth.users entries in production

-- Example: promote a user to admin after they sign up
-- INSERT INTO public.admins (user_id, role) VALUES ('YOUR-USER-UUID', 'super_admin');

-- Fire decay cron (set up in Supabase Dashboard > Database > Cron)
-- SELECT cron.schedule('decay-fire-scores', '0 */6 * * *', 'SELECT public.decay_fire_scores()');
