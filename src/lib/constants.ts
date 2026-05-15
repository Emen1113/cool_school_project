export const APP_NAME = "CoolSchool";
export const APP_TAGLINE = "Vote. Rank. Rise.";

export const ALLOWED_EMAIL_DOMAINS = (
  process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS ?? "school.edu,student.edu"
)
  .split(",")
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

export const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const AVATAR_BUCKET = "avatars";

export const VOTE_RATE_LIMIT = 30; // votes per minute
export const VOTE_COOLDOWN_MS = 1500; // min time between votes

export const FIRE_DECAY_HOURS = 24;
export const FIRE_WIN_BOOST = 3;
export const FIRE_VOTE_BOOST = 1;

export const LEADERBOARD_PAGE_SIZE = 50;
