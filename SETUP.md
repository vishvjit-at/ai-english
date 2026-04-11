# SpeakUp with Aria — Setup & Deploy Guide

This is your reference for finishing the Phase 4 (Auth + Deploy) setup.

---

## ✅ Already Done (Code Side)

- Phase 1: MVP (conversations, scenarios, voice, themes)
- Phase 2: Database persistence (Prisma + Postgres + Docker, history, AI summaries, progress dashboard)
- Phase 3: Enhanced practice (real-time hints, vocabulary review, difficulty progression, guided lessons)
- Phase 4: Auth + Deploy code (Supabase auth wired in, all queries scoped by userId, login/signup pages, deploy configs)

---

## 📋 Manual Setup Steps Remaining

### Step 1: Create Supabase Project ✅ DONE
You've already created the project. Keys are in `server/.env`.

**Your Supabase URL:** `https://xtoipmvctktcztzoqbbx.supabase.co`

### Step 2: Fix DATABASE_URL (IMPORTANT)

Your current `DATABASE_URL` in `server/.env` uses port `5432` (direct connection). For production with Prisma + serverless, you should use the **transaction pooler** on port `6543`.

But for **local testing right now**, the local Docker Postgres is being used since the line above it overrides. Actually wait — the new `DATABASE_URL` line is **after** the local one, so it overrides. This means **local dev will now hit Supabase Postgres**, not the Docker one.

**Decision:** Do you want local dev to use:
- **Local Docker Postgres** (faster, isolated): change line 12 in `server/.env` to be commented out or removed, keep line 8
- **Supabase Postgres** (same as production, slower): keep line 12 but **remove line 8** to avoid duplicate `DATABASE_URL` warnings

### Step 3: Run Migrations on Supabase Postgres

Once you've decided on the DATABASE_URL above, run migrations against Supabase:

```bash
cd ~/Videos/ai-english/server
npx prisma migrate deploy
npx prisma generate
```

This creates all tables (users, sessions, messages, session_summaries, vocabulary) in your Supabase database.

### Step 4: Create client/.env

Create `~/Videos/ai-english/client/.env` with:

```
VITE_SUPABASE_URL=https://xtoipmvctktcztzoqbbx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0b2lwbXZjdGt0Y3p0em9xYmJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NTY5NDcsImV4cCI6MjA5MTIzMjk0N30.00OlkLhFszk0ycDjUKTjDM2wqYaeN2P7LtpFWVVhjW4
```

(VITE_API_URL is NOT needed locally — Vite proxy handles `/api` to localhost:5000 in dev.)

### Step 5: Enable Email Auth in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com) → your project
2. **Authentication** → **Providers** → **Email** should already be enabled
3. **Authentication** → **Settings** → toggle off **Confirm email** (for testing — re-enable later for production)

### Step 6: Enable Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project (or use existing)
3. **APIs & Services** → **OAuth consent screen**:
   - Type: External
   - App name: `SpeakUp with Aria`
   - Add your email as support email
   - Save through all steps
4. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**:
   - Type: Web application
   - Name: `SpeakUp Auth`
   - Authorized redirect URIs: `https://xtoipmvctktcztzoqbbx.supabase.co/auth/v1/callback`
5. Copy **Client ID** and **Client Secret**
6. Back in Supabase → **Authentication** → **Providers** → **Google**:
   - Enable
   - Paste Client ID and Client Secret
   - Save

### Step 7: Test Locally

```bash
cd ~/Videos/ai-english
npm run db:up          # only if using local Docker Postgres
npm run dev            # starts both client + server
```

Visit `http://localhost:5173`:
- Should redirect to `/login`
- Sign up with email/password (or Google)
- Try a conversation → End & Save → see in History
- Sign out → sign in → data persists

---

## 🚀 Deploy to Production

### Step 8: Push to GitHub

```bash
cd ~/Videos/ai-english
git init                          # if not already
git add .
git commit -m "Phase 4: Auth + Deploy ready"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-english.git
git push -u origin main
```

**Make sure `.gitignore` excludes:**
```
node_modules
dist
.env
.env.docker
server/.env
server/.env.docker
client/.env
server/src/generated
```

### Step 9: Deploy Server on Render (Free Tier)

1. Go to [render.com](https://render.com) → sign up with GitHub
2. **New** → **Web Service** → connect your `ai-english` repo
3. Configure:
   - **Name**: `ai-english-server`
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
4. Add Environment Variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://postgres.xtoipmvctktcztzoqbbx:67_$.TxLgDmNY,_@aws-0-[region].pooler.supabase.com:6543/postgres` (use transaction pooler from Supabase Settings → Database) |
| `GROQ_API_KEY` | `gsk_...` (from console.groq.com → API Keys) |
| `SUPABASE_URL` | `https://xtoipmvctktcztzoqbbx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0b2lwbXZjdGt0Y3p0em9xYmJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTY1Njk0NywiZXhwIjoyMDkxMjMyOTQ3fQ.CcHzK0lauEx1GzFpMUWuvskDv_qQcv7bdCbXIDrNguU` |
| `CLIENT_URL` | (leave blank, set after Vercel deploy) |
| `NODE_ENV` | `production` |
| `ELEVENLABS_API_KEY` | `sk_4a9a1133158688698ee4ad2290de42603b15eec13967e94c` (optional) |

5. Click **Deploy Web Service**
6. Wait ~3-5 minutes
7. Note your URL (e.g., `https://ai-english-server.onrender.com`)
8. Test: visit `https://ai-english-server.onrender.com/api/health`

### Step 10: Deploy Client on Vercel (Free Tier)

1. Go to [vercel.com](https://vercel.com) → sign up with GitHub
2. **Add New** → **Project** → import `ai-english` repo
3. Configure:
   - **Root Directory**: `client` (click Edit to change)
   - **Framework**: Vite (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://xtoipmvctktcztzoqbbx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0b2lwbXZjdGt0Y3p0em9xYmJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NTY5NDcsImV4cCI6MjA5MTIzMjk0N30.00OlkLhFszk0ycDjUKTjDM2wqYaeN2P7LtpFWVVhjW4` |
| `VITE_API_URL` | `https://ai-english-server.onrender.com/api` (your Render URL + /api) |

5. Click **Deploy**
6. Note your URL (e.g., `https://ai-english-client.vercel.app`)

### Step 11: Connect Vercel ↔ Render ↔ Supabase

**Update Render `CLIENT_URL`:**
1. Render dashboard → your service → **Environment**
2. Set `CLIENT_URL` = your Vercel URL (e.g., `https://ai-english-client.vercel.app`)
3. Save → Render auto-redeploys

**Update Supabase URL Configuration:**
1. Supabase → **Authentication** → **URL Configuration**
2. **Site URL**: your Vercel URL
3. **Redirect URLs**: add your Vercel URL

**If using Google OAuth:**
1. Google Cloud Console → Credentials → OAuth client
2. Add to **Authorized JavaScript origins**: your Vercel URL

---

## 🔑 All Keys Reference

| Where Used | Key Name | Value |
|---|---|---|
| Supabase URL | `https://xtoipmvctktcztzoqbbx.supabase.co` |
| Anon Key (client) | `VITE_SUPABASE_ANON_KEY` | `eyJ...JW4` |
| Service Role (server) | `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...nguU` |
| Local DB (Docker) | `DATABASE_URL` | `postgresql://aiuser:aipass@localhost:5432/ai_english` |
| Production DB (Supabase pooler) | `DATABASE_URL` | Get from Supabase → Settings → Database → Transaction pooler (port 6543) |
| Groq | `GROQ_API_KEY` | get from console.groq.com |
| ElevenLabs (optional) | `ELEVENLABS_API_KEY` | `sk_4a9a...` |

---

## 🐛 Troubleshooting

**"Failed to fetch" on first request after deploy:**
Render free tier sleeps after 15min inactivity. First request takes 30-60s to wake up. Subsequent requests are fast.

**"Invalid or expired token" errors:**
Check that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set correctly on Render.

**CORS errors:**
Make sure `CLIENT_URL` on Render matches your Vercel URL exactly (no trailing slash).

**Login redirects to wrong URL:**
Check Supabase → Authentication → URL Configuration → Site URL matches Vercel URL.

**Database migration fails on Supabase:**
Make sure DATABASE_URL uses the **transaction pooler** (port 6543), not direct connection (port 5432).

---

## 📂 Project Structure Quick Reference

```
ai-english/
├── client/              # React + Vite frontend
│   ├── src/
│   │   ├── pages/       # Pages: Home, Practice, Lessons, Vocabulary, etc.
│   │   ├── components/  # UI components
│   │   ├── hooks/       # useAuth, useSettings, useConversation
│   │   └── lib/         # api.ts, supabase.ts, types.ts
│   ├── .env             # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
│   └── vercel.json      # SPA routing config
├── server/              # Express + Prisma backend
│   ├── src/
│   │   ├── routes/      # auth.ts, conversation.ts, sessions.ts, voice.ts
│   │   ├── middleware/  # auth.ts (requireAuth)
│   │   ├── lib/         # prisma.ts, supabase.ts, system-prompts.ts
│   │   └── index.ts     # Express entry point
│   ├── prisma/
│   │   └── schema.prisma  # User, Session, Message, SessionSummary, VocabularyItem
│   └── .env             # GROQ_API_KEY, SUPABASE_*, DATABASE_URL
├── docker-compose.yml   # Local Postgres + server + client
└── SETUP.md             # This file
```

---

## 🎯 Future Phases (Ideas)

- **Phase 5**: Achievements, badges, shareable progress cards, leaderboard
- **Phase 6**: PWA support (installable, offline shell), pronunciation feedback, more lessons
- **Phase 7**: Onboarding flow, placement test, notification reminders

---

Last updated: 2026-04-09
