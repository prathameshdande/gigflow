# GigFlow — Freelance Marketplace

A full-stack freelance marketplace (Fiverr/Upwork-style) with a client flow,
a freelancer flow, and an admin panel. Backend: Node/Express/MongoDB/Socket.IO.
Frontend: React + Vite + Tailwind.

This codebase was audited and repaired end-to-end. See **CHANGES.md** for the
full list of bugs found and fixed. This file covers setup only.

---

## Do this first: rotate your credentials

Your uploaded project's `server/.env` contained a **live MongoDB Atlas
connection string (with password) and a Gmail app password, committed in
plaintext**. That file was removed from this delivery and those secrets were
not reused anywhere. Before deploying this:

1. **Rotate your MongoDB Atlas database user password** (Atlas dashboard ->
   Database Access -> edit user).
2. **Revoke the leaked Gmail app password** and generate a new one
   (Google Account -> Security -> App Passwords).
3. Never commit `.env` to git - add it to `.gitignore` if it isn't already.

---

## 1. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:

```
MONGO_URI=<your new MongoDB connection string>
JWT_KEY=<a long random string>
PORT=8800
NODE_ENV=development
CLIENT_URL=http://localhost:5173
EMAIL_USER=<your email, for password-reset emails>
EMAIL_PASS=<a fresh app password>
ADMIN_EMAIL=admin@gigflow.com
ADMIN_PASSWORD=<pick a strong password, see below>
```

Generate a strong `JWT_KEY` with:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Create the admin account

```bash
npm run seed:admin
```

This is idempotent (safe to re-run) and reads `ADMIN_EMAIL` / `ADMIN_PASSWORD`
from `.env`. If you don't set `ADMIN_PASSWORD`, a random one is generated and
printed once to the console - save it immediately.

**Suggested credentials for local development** (put these in `.env` before
running the seed script, then log in with them):

```
Email:    admin@gigflow.com
Password: bqbUnphhdFA3
```

Change this password from the Profile page (or re-run the seed script with a
new `ADMIN_PASSWORD`) before using this anywhere but your own machine.

### Run the backend

```bash
npm run dev      # nodemon, auto-restart
# or
npm start
```

Health check: `GET http://localhost:8800/api/health`

---

## 2. Frontend setup

```bash
cd client
npm install
cp .env.example .env
```

`client/.env`:
```
VITE_API_URL=http://localhost:8800/api
```

```bash
npm run dev
```

---

## 3. What each role can do

- **Client**: post gigs, review proposals, hire a freelancer, chat, approve
  submitted work, release payment, leave a review.
- **Freelancer**: browse open gigs, submit proposals, get hired, chat,
  submit completed work, get paid, leave a review.
- **Admin**: `/admin` dashboard - platform stats, manage users (activate/
  deactivate), manage gigs (status/delete), moderate bids (approve/mark
  spam), view all messages, resolve payment disputes, moderate reviews.
  Admin accounts can only be created via `npm run seed:admin` - the public
  registration endpoint rejects any attempt to self-assign the admin role.

---

## 4. Payments (Razorpay)

Real checkout is wired up via Razorpay. Add your keys to `server/.env`:

```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_key_secret
```

Get test-mode keys from https://dashboard.razorpay.com/app/keys (test keys
start with `rzp_test_` and don't move real money - safe for development).

Flow: once a client marks a gig `completed`, "Release Payment" creates a
Razorpay order server-side (amount always comes from the gig's budget, never
from the client), opens Razorpay's hosted checkout (handles card/UPI/
netbanking/wallet UI itself - this app never collects or stores card
numbers or CVVs), and on success the server verifies the payment signature
with `RAZORPAY_KEY_SECRET` before marking it paid. See
`paymentController.createRazorpayOrder` / `verifyRazorpayPayment`.

**Test card** (Razorpay test mode): `4111 1111 1111 1111`, any future
expiry, any CVV. **Test UPI**: `success@razorpay`.

If `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` aren't set, the rest of the app
still runs fine - only the payment step will return a clear error until
they're configured.

**Going to production**: swap in your live keys (`rzp_live_...`), and
consider also verifying payments via a Razorpay webhook (in addition to the
client-side signature check already done here) so a payment still gets
recorded even if the user closes the tab right after paying.

## 5. Deploying: backend on Render, frontend on Vercel

The repo already includes `render.yaml` (backend Blueprint) and
`client/vercel.json` (SPA routing). This is a two-step deploy - the backend
needs to exist first so you know its URL for the frontend's env var, but
you'll come back and update the backend's `CLIENT_URL` once the frontend
is live.

### Step 1 — Backend on Render

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. In Render: **New -> Blueprint**, pick the repo. Render reads `render.yaml`
   and pre-fills a web service rooted at `server/` with build command
   `npm install` and start command `npm start`.
   - No `render.yaml`/Blueprints? Create it manually instead: **New -> Web
     Service**, root directory `server`, build command `npm install`, start
     command `npm start`, plan Free is fine to start.
3. Fill in the environment variables Render prompts for:
   - `MONGO_URI` - your Atlas connection string
   - `JWT_KEY` - auto-generated by the blueprint (or generate your own, see
     section 1 above)
   - `CLIENT_URL` - leave blank for now, you'll fill this in after Step 2
   - `EMAIL_USER` / `EMAIL_PASS` - for password-reset emails
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` - for `npm run seed:admin`
   - `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` - if using payments
4. Deploy. Confirm it's healthy at `https://<your-service>.onrender.com/api/health`.
5. Seed the admin account once it's live: Render dashboard -> your service
   -> **Shell** -> `npm run seed:admin`.

> Free-tier Render web services spin down after inactivity and take ~30-60s
> to wake up on the next request - the first request after idle will be
> slow. This is a platform limitation, not a bug in the app.

### Step 2 — Frontend on Vercel

1. In Vercel: **Add New -> Project**, pick the same repo.
2. Set **Root Directory** to `client`. Vercel auto-detects Vite (build
   command `npm run build` / `vite build`, output directory `dist`) - the
   included `client/vercel.json` handles SPA routing so refreshing a route
   like `/gigs/123` doesn't 404.
3. Add an environment variable:
   ```
   VITE_API_URL=https://<your-render-service>.onrender.com/api
   ```
4. Deploy. Note the resulting `https://<your-app>.vercel.app` URL.

### Step 3 — Connect them

1. Back in Render, set the backend's `CLIENT_URL` env var to your Vercel URL
   (e.g. `https://your-app.vercel.app`) — comma-separate multiple values if
   you also want to allow a preview deployment URL. Save; Render redeploys
   automatically.
2. If you ever change `VITE_API_URL` on Vercel, you must trigger a new
   Vercel deploy for it to take effect - Vite bakes env vars in at build
   time, not at request time.
3. Log in from the deployed frontend and confirm gigs/auth/notifications
   all work end to end.

## 6. Other notes on scope

- Real-time chat and notifications run over Socket.IO, authenticated with
  the same JWT used for the REST API.
