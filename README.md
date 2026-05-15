# CoolSchool

A modern school social ranking app — vote between students, climb ELO leaderboards, and earn fire streaks.

## Tech Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4** + custom glassmorphism UI
- **Framer Motion** animations
- **Supabase** (Auth, PostgreSQL, Storage, Realtime)
- **Cloudflare Turnstile** captcha (optional)

## Features

- School email-only signup
- Head-to-head voting with ELO ratings
- Leaderboards: top rated, trending, most wins, hot streaks
- Fire/trending score with decay
- Profile pages with share links & rating history
- Activity feed with realtime updates
- Avatar upload (WebP compression via Sharp)
- Admin dashboard (ban users, review reports)
- Row Level Security on all tables

## Quick Start

### 1. Clone & install

```bash
npm install
cp .env.example .env.local
```

### 2. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `database/schema.sql` in the **SQL Editor**
3. Enable **Email** auth in Authentication → Providers
4. Copy project URL and keys to `.env.local`

### 3. Configure allowed email domains

```env
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS=your-school.edu,students.your-school.edu
```

### 4. Create first admin

After signing up, run in SQL Editor:

```sql
INSERT INTO public.admins (user_id, role)
VALUES ('YOUR-USER-UUID', 'super_admin');
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel

1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Deploy

### Supabase

- Schema is applied via SQL Editor (or Supabase CLI migrations)
- Schedule fire decay cron:

```sql
SELECT cron.schedule('decay-fire-scores', '0 */6 * * *', 'SELECT public.decay_fire_scores()');
```

### Turnstile (optional)

1. Create a site at [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
2. Add site key and secret to env vars

## Project Structure

```
src/
  app/           # Routes & API
  components/    # UI components
  hooks/         # React hooks
  lib/           # Utils, Supabase, ELO
  services/      # Business logic
  types/         # TypeScript types
database/
  schema.sql     # Full PostgreSQL schema + RLS
  seed.sql       # Seed notes
```

## Scripts

| Command        | Description          |
|----------------|----------------------|
| `npm run dev`  | Start dev server     |
| `npm run build`| Production build     |
| `npm run start`| Start production     |
| `npm run lint` | Run ESLint           |

## License

MIT
