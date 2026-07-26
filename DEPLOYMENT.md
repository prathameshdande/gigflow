# Deploying GigFlow: Render (backend) + Vercel (frontend)

Backend goes on Render, frontend goes on Vercel. Do the backend first — you
need its live URL before configuring the frontend.

---

## Part 1: Backend on Render

### Option A - Blueprint (uses the included `render.yaml`)

1. Push this project to a GitHub repo (Render deploys from a git repo, not
   a zip upload).
2. In the Render dashboard: **New > Blueprint**, pick your repo. Render
   reads `render.yaml` at the repo root and pre-fills a web service rooted
   at `server/`.
3. You'll be prompted to fill in the env vars marked `sync: false`:
   - `MONGO_URI` - your Atlas connection string
   - `JWT_KEY` - Render can auto-generate this (already set to
     `generateValue: true`)
   - `CLIENT_URL` - leave blank for now, come back and set it after Part 2
     (it needs your Vercel URL, which doesn't exist yet)
   - `EMAIL_USER` / `EMAIL_PASS` - for password-reset emails
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` - for the admin seed script
   - `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` - from your Razorpay dashboard
4. Click **Apply**. Render builds and deploys `server/`.

### Option B - Manual web service

1. **New > Web Service**, connect your repo.
2. **Root Directory**: `server`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Health Check Path**: `/api/health`
6. Add the same env vars listed above under the service's **Environment**
   tab.

### After it deploys

- Note the URL Render gives you, e.g. `https://gigflow-backend.onrender.com`
- Visit `https://<your-backend>.onrender.com/api/health` - you should see
  `{"status":"ok","db":"connected"}`. If `db` says `disconnected`, double
  check `MONGO_URI` (and that your Atlas cluster's Network Access allows
  connections from anywhere - `0.0.0.0/0` - since Render's IPs aren't
  static on the free plan).
- **Create the admin account**: Render dashboard → your service → **Shell**
  tab → run:
  ```bash
  npm run seed:admin
  ```
  This prints the admin email/password once. Save it.

### Render free-tier gotcha

Free web services spin down after ~15 minutes of no traffic and take
10-30 seconds to wake back up on the next request. That first request after
idle will feel slow (or briefly time out) - this is normal on the free plan,
not a bug. Paid plans don't sleep.

---

## Part 2: Frontend on Vercel

1. **New Project** in Vercel, import the same repo.
2. **Root Directory**: `client` (important - this is a monorepo; Vercel
   needs to know the frontend lives in a subfolder). Vercel auto-detects
   Vite once the root directory is set correctly.
3. **Environment Variables**: add
   ```
   VITE_API_URL=https://<your-backend>.onrender.com/api
   ```
   (must include the `/api` suffix, and must start with `VITE_` or Vite
   won't expose it to the client at all.)
4. Deploy. `client/vercel.json` is already set up with a SPA rewrite so
   refreshing on a route like `/gigs/123` doesn't 404 - no extra config
   needed there.

### Wire the backend back to this frontend

Now that you have your Vercel URL (e.g. `https://gigflow.vercel.app`):

1. Back in Render, set `CLIENT_URL` to that exact URL (no trailing slash).
2. `CLIENT_URL` accepts a comma-separated list, which is useful for also
   allowing a Vercel preview deployment URL, e.g.:
   ```
   CLIENT_URL=https://gigflow.vercel.app,https://gigflow-git-preview-you.vercel.app
   ```
3. Redeploy/restart the Render service so it picks up the new env var
   (same rule as local dev: the running process doesn't hot-reload `.env`
   changes).

---

## Part 3: Verify end to end

1. Open your Vercel URL, register an account, confirm you land on the app
   (not stuck on a CORS or cookie error in the browser console).
2. Log in as the seeded admin and confirm `/admin` loads with real stats.
3. Run through the full gig lifecycle (post → bid → hire → submit → approve
   → Release Payment) using a Razorpay test card (`4111 1111 1111 1111`,
   any future expiry, any CVV) to confirm the whole chain works against the
   live deployment, not just localhost.

If login/cookies seem to silently fail only in production: open the
browser's Network tab on the login request and check the `Set-Cookie`
response header. In production the cookie is set with `SameSite=None;
Secure`, which requires HTTPS on both ends (Render and Vercel both give you
HTTPS by default, so this should just work) - but if you ever front either
service with a custom domain that isn't HTTPS-only, this is the first
thing to check.

---

## Part 4: Custom domains (optional)

- Vercel: Project Settings → Domains → add yours, follow their DNS
  instructions.
- Render: service → Settings → Custom Domains, same idea.
- If you add a custom domain to the frontend, update `CLIENT_URL` on Render
  to match (and redeploy/restart), or the browser will get CORS errors from
  the new origin.
