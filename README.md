# BookMyProtest

A "BookMyShow, but for protests" platform. Protesters register with name, photo,
and address; admins register the protests they're organizing (title, cause,
description, address + a real map pin, date/time); everyone can browse a live
map of every protest and tap in to see who's organizing it and how many people
are already going.

Stack: **Node.js + Express + TypeScript + Drizzle ORM (PostgreSQL / Neon)** on
the backend, **React + TypeScript + Tailwind + Leaflet** on the frontend.
Auth supports email/password and **Google sign-in**.

## How the pieces connect

- **Protesters** register with name, email, password, address, city, phone, and
  a photo (uploaded to Cloudinary) — or sign up instantly with Google, which
  skips straight to a session and lets them fill in address/city later. They
  can browse the map and tap **"I'm joining this protest"** on any event —
  that's the "connect with admin" link: it creates a row in `participations`
  tying protester ↔ protest, and pushes the live headcount everyone sees.
- **Admins** register separately (own table, own JWT role, also Google-capable)
  and create protest events by filling out the details and **clicking a spot
  on an interactive map** (`LocationPicker.tsx`) instead of typing
  coordinates. That pin becomes `latitude`/`longitude` on the `protests` row.
- **The home page map** (`MapView.tsx`) plots every protest as a custom ember
  pin — pulsing red if `status = ongoing` — with a popup showing cause, address,
  join count, and a link to the full detail page.

## Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) Postgres database (free tier is fine)
- A [Cloudinary](https://cloudinary.com) account (free tier) for photo uploads
- A [Google Cloud](https://console.cloud.google.com) OAuth Client ID (free) for Google sign-in

## 1. Set up Neon (Postgres)

1. Create a project at [neon.tech](https://console.neon.tech).
2. Open **Connect** on the dashboard and copy the **pooled connection**
   string. It looks like:
   ```
   postgres://user:password@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```
3. Paste it into `backend/.env` as `DATABASE_URL`. SSL is required and is
   already handled in `backend/src/db/index.ts`.

## 2. Set up Google OAuth

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth client ID** → Application type **Web application**.
3. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173` (local dev)
   - your deployed frontend URL (e.g. `https://bookmyprotest.vercel.app`)
4. You only need the **Client ID** (not the secret) — this project uses
   Google Identity Services' token-based sign-in, verified server-side.
   - Backend: `GOOGLE_CLIENT_ID` in `backend/.env`
   - Frontend: `VITE_GOOGLE_CLIENT_ID` in `frontend/.env` (same value)

If you leave these blank, the app still works fine with email/password —
the Google button just doesn't render.

## 3. Set up Cloudinary

Grab `Cloud name`, `API Key`, and `API Secret` from your
[Cloudinary dashboard](https://console.cloudinary.com/console) and put them
in `backend/.env`.

## 4. Backend setup

```bash
cd backend
cp .env.example .env      # or edit the .env already in this repo — see below
npm install
npm run db:generate       # generates SQL migration from schema.ts (already run once, re-run after schema edits)
npm run db:migrate        # applies migrations to your Neon database
npm run dev                # http://localhost:5000
```

> **Note:** `backend/.env` in this project already has real, randomly
> generated `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` values filled in for
> you — you only need to fill in `DATABASE_URL`, the Cloudinary keys, and
> `GOOGLE_CLIENT_ID`. Never commit this file (it's already in `.gitignore`);
> when you deploy, copy these same values into your host's environment
> variable settings instead.

## 5. Frontend setup

```bash
cd frontend
cp .env.example .env      # or edit the .env already in this repo
npm install
npm run dev                # http://localhost:5173 (proxies /api to :5000 in dev)
```

## Deploying

This project has no Docker/containers — deploy the backend and frontend as
two plain Node/static-site services. A common free-tier combo:

### Backend → Render (or Railway / Fly.io)

1. Push this repo to GitHub.
2. Create a new **Web Service** on [Render](https://render.com), pointing at
   the `backend/` directory.
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add all the variables from `backend/.env` as environment variables in
   Render's dashboard (DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET,
   CLOUDINARY_*, GOOGLE_CLIENT_ID, NODE_ENV=production, and CLIENT_URL set to
   your deployed frontend URL, e.g. `https://bookmyprotest.vercel.app`).
6. After the first deploy, run the migration once against your Neon DB —
   either via Render's shell (`npm run db:migrate`) or from your own machine
   with `DATABASE_URL` pointed at Neon.

### Frontend → Vercel (or Netlify)

1. Import the repo into [Vercel](https://vercel.com), set the project root
   to `frontend/`.
2. Build command: `npm run build`, output directory: `dist`.
3. Add environment variables:
   - `VITE_API_URL` = `https://<your-render-backend>.onrender.com/api`
   - `VITE_GOOGLE_CLIENT_ID` = same Client ID as the backend
4. Redeploy after adding env vars (Vite bakes them in at build time).
5. Go back to Google Cloud Console and add this Vercel URL to **Authorized
   JavaScript origins** if you haven't already.

### Same-domain deploys

If you'd rather serve both from one domain (e.g. both on Render, or a single
VPS with Nginx/Caddy in front), leave `VITE_API_URL` empty and instead
reverse-proxy `/api/*` on your web server to the backend service — the
frontend already defaults to a relative `/api` base URL.

## Auth model

Two separate identity tables (`admins`, `protesters`) rather than one table
with a role flag — keeps admin-only fields (organization) and protester-only
fields (address, photo) clean, and role is baked into the JWT payload so
`requireRole("admin" | "protester")` middleware can gate routes.

Two ways to authenticate, both issuing the same JWT pair:
- **Email/password** — scrypt-hashed, salted, stored per-user.
- **Google sign-in** — the frontend uses Google Identity Services
  (`@react-oauth/google`) to get a signed ID token, which the backend
  verifies with `google-auth-library` before creating/linking an account by
  email. Google-only accounts have no password hash and can't use the
  email/password login form.

Access tokens live in memory on the frontend (Zustand store, never
localStorage); refresh tokens are httpOnly cookies with silent-refresh
handled in the Axios interceptor. In production the cookie uses
`sameSite: "none"` + `secure: true` since the frontend and backend typically
live on different domains; locally it's `sameSite: "lax"` for simplicity.

## Extending it

- Add a `comments` or `updates` table on `protests` for organizers to post
  live updates (route changes, safety notices).
- Add push/email notifications when a protest near a protester's registered
  city goes from `upcoming` → `ongoing`.
- Swap the free OpenStreetMap tile layer for Mapbox/Google if you want custom
  map styling to match the ember theme even more closely.
- Add a "complete your profile" prompt for Google sign-ups that skipped the
  address field, since it's required to organize/join in a location-aware way.
