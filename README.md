# auto-seo (Next.js / Vercel)

Multi-site AI content pipeline. Same features as the original Flask version, rebuilt as a Next.js 15 app deployable to Vercel.

## Features

- Manage unlimited WordPress sites from one dashboard, each with its own niche, audience, expert voice, author bio, daily cap, and minimum word count
- AI keyword research — paste a seed term, Claude proposes 30+ long-tail candidates with intent tags
- Article generator — Claude Sonnet 4.6 writes the post, embeds Article + FAQPage JSON-LD schema, assigns category + tags, internally links to past articles on the same site
- Quality gates — articles below the site's minimum word count or missing FAQ are held back as drafts for review
- Article preview, edit, and manual publish — review HTML in the dashboard before pushing to WordPress
- Activity log + cost tracking — every run recorded with token cost; per-site monthly spend visible
- Auth — credentials-based login, first-launch setup, encrypted WP application passwords at rest
- Vercel Cron — daily run across all active sites, respects per-site daily cap

## Local development

```powershell
# 1. Install dependencies
npm install

# 2. Provision a Postgres database (Neon free tier is easiest)
#    Sign up at https://neon.tech, create a project, copy the connection string.

# 3. Generate auth + encryption secrets
node -e "console.log('AUTH_SECRET=' + require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('base64'))"

# 4. Configure environment
cp .env.example .env
# Edit .env: paste DATABASE_URL, DIRECT_DATABASE_URL, AUTH_SECRET, ENCRYPTION_KEY,
# ANTHROPIC_API_KEY. CRON_SECRET is optional for local dev.

# 5. Push the schema to your database
npx prisma db push

# 6. Run the dev server
npm run dev
```

Open http://localhost:3000 and follow the first-run setup to create the admin account.

## Deploying to Vercel

### One-time setup

1. **Provision Postgres.** Sign up for [Neon](https://neon.tech) (or use Vercel Postgres). Create a project. Copy the **pooled** connection string (used as `DATABASE_URL`) and the **direct** connection string (used as `DIRECT_DATABASE_URL`).

2. **Push code to a Git repo** (GitHub/GitLab/Bitbucket).

3. **Import the repo to Vercel.** New Project → Import.

4. **Set environment variables** in Vercel Project Settings → Environment Variables:

   | Variable | How to get it |
   |---|---|
   | `DATABASE_URL` | Neon pooled URL (with `?pgbouncer=true&connect_timeout=15`) |
   | `DIRECT_DATABASE_URL` | Neon direct URL (no pooler) — Prisma uses it for migrations |
   | `AUTH_SECRET` | `openssl rand -base64 32` |
   | `ENCRYPTION_KEY` | `openssl rand -base64 32` (32 bytes, encrypts WP passwords) |
   | `ANTHROPIC_API_KEY` | https://console.anthropic.com/settings/keys |
   | `CRON_SECRET` | Any random string. Required if you use Vercel Cron. Vercel sends it as `Authorization: Bearer $CRON_SECRET`. |

   Optional (for social posting): `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET`, `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USERNAME`, `REDDIT_PASSWORD`, `REDDIT_USER_AGENT`.

5. **Push the Prisma schema.** Locally with the production `DATABASE_URL`/`DIRECT_DATABASE_URL` set:
   ```powershell
   npx prisma db push
   ```
   (or run a one-off `prisma migrate deploy` job if you start using migrations).

6. **Deploy.** Vercel auto-deploys from `main`. The first deploy spins up the cron job at `/api/cron`, scheduled daily at 09:00 UTC (see `vercel.json`).

### After deploy

- Visit your `*.vercel.app` URL. You'll be redirected to `/setup` to create the admin account.
- Add your first site. Test the WordPress connection. Add keywords. Click **Run** to generate one article.
- The cron job will trigger one article per active site daily, capped per site.
- To run manually outside the dashboard: `curl -H "Authorization: Bearer $CRON_SECRET" https://yoursite.vercel.app/api/cron`

### Cost

- **Vercel Hobby plan** — free, 60s function timeout (enough for one article generation per request).
- **Neon free tier** — 0.5 GB storage, plenty for tens of thousands of articles.
- **Anthropic** — ~$0.05–$0.15 per article (Sonnet 4.6). 4 sites × 1 article/day × 30 days ≈ $6–$18/month.

## Architecture notes

- **One article per request.** Article generation takes 20–40s; the runner does one per call to fit Vercel's 60s timeout.
- **Multi-article runs.** The dashboard's Run widget loops on the client, calling the action `count` times in sequence.
- **Daily cap.** Enforced inside `runOneForSite`; cron + dashboard both honor it.
- **WP passwords at rest.** AES-256-GCM with a key derived from `ENCRYPTION_KEY`. Never stored or logged in plaintext.
- **Auth.** Auth.js v5 (NextAuth) with a Credentials provider, JWT sessions (14-day lifetime). Middleware protects every route except `/login`, `/setup`, `/api/auth`, and `/api/cron`.
- **Internal linking.** When publishing, scans the new article HTML against past article titles on the same site, inserts up to 5 links to the longest-matching titles, skips matches inside headings or existing anchors.

## Files

```
prisma/schema.prisma         Database schema
src/lib/db.ts                Prisma singleton
src/lib/auth.ts              Auth.js config + helpers
src/lib/encryption.ts        AES-256-GCM for WP passwords
src/lib/anthropic.ts         Article generator + keyword research
src/lib/wordpress.ts         WP REST publisher with category/tag taxonomy
src/lib/linker.ts            Internal linker
src/lib/social.ts            X + Reddit (env-gated)
src/lib/runner.ts            Per-site orchestration + quality gates
src/middleware.ts            Auth gate for protected routes
src/app/(auth)/              Login + setup pages
src/app/(app)/               Authenticated dashboard pages
src/app/api/research/        Keyword research endpoint
src/app/api/sites/[id]/keywords/  Bulk add keywords
src/app/api/cron/            Vercel cron entry point
src/components/              UI components (Sidebar, Card, Pill, ...)
src/actions/                 Server actions for forms
vercel.json                  Cron schedule
```

## Differences from the Flask version

- SQLite → Postgres
- WP passwords now encrypted at rest (Flask version stored plaintext)
- "Run N articles" loops client-side (Vercel timeouts make in-process loops risky)
- Dry-run output stored in DB instead of files (no persistent FS on Vercel)
- Background social posting moved to env-gated; X/Reddit integrations are stubbed in v1 — wire up `twitter-api-v2` and `snoowrap` if you need them
- Schedule is now Vercel Cron at 09:00 UTC (configurable in `vercel.json`)
