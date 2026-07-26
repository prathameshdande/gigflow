# Changes Made

## Critical / crash bugs
- `server/routes/authRoutes.js` declared `getMe` twice with `const` -> the
  server threw `SyntaxError` on boot and could never start. Fixed; also
  removed the duplicate `server/auth/me.js` file that implemented the same
  route a second time.
- `client/src/context/NotificationContext.jsx` called `setSocket(s)`, a
  function that didn't exist (only an unused `socketRef` did). Any logged-in
  user mounting the app would hit a `ReferenceError`. Rewritten to use
  `socketRef.current`, pull the token from `AuthContext` instead of a
  non-reactive `localStorage.getItem`, fix the socket URL (was pointed at
  `.../api`, which isn't a valid Socket.IO endpoint), and remove a stray
  `toast.error(...)` that fired even on successful loads.

## Security
- `POST /api/auth/register` accepted any `role` from the client, including
  `"admin"` — anyone could self-promote to admin. Now whitelisted server-side
  to `client`/`freelancer` regardless of what's submitted; admin accounts can
  only be created via `npm run seed:admin`.
- Login returned different error messages for "no such user" vs "wrong
  password" (user enumeration). Unified to a generic message.
- `forgotPassword` now returns the same response whether or not the email
  exists, to prevent email enumeration via that endpoint.
- Passwords are now `select: false` on the User model (not returned by
  default on any query) and only pulled in explicitly for login/change-
  password.
- `bcrypt.hashSync`/`compareSync` replaced with the async `bcrypt.hash`/
  `compare` (avoids blocking the Node event loop).
- Added: helmet, express-rate-limit (global + strict on auth routes),
  express-mongo-sanitize (NoSQL injection), hpp (HTTP parameter pollution),
  express-validator on every route that accepts a body/param.
- `paymentController.createPayment` used to trust a client-supplied `amount`.
  It now always derives the amount from the gig's budget server-side, and
  requires the gig to be `completed` and the caller to be its owner.
- Deactivated accounts (`isActive: false`) are now rejected at login and at
  `/auth/me`, even with a still-valid JWT.
- Admin controller now refuses to delete/deactivate/block another admin
  account.
- Three overlapping, inconsistent admin-bootstrap scripts (`seedAdmin.js`,
  `resetAdmin.js`, `fixAdmin.js` — one of which hardcoded `admin123`) were
  replaced with a single idempotent `seed/seedAdmin.js` that reads
  `ADMIN_EMAIL`/`ADMIN_PASSWORD` from `.env` and generates a random password
  if none is set.
- **A real MongoDB Atlas connection string and Gmail app password were found
  committed in `server/.env`** in the uploaded project. These were not
  reused or included anywhere in this delivery — see the README for
  rotation steps.

## Broken real-time features (Socket.IO)
- `gigController.js`/`bidController.js` did
  `const { io } = require("../index")` at the top of the file. Because of the
  circular require between `index.js` and the controllers it loads, `io` was
  captured as `undefined` at import time and stayed that way forever —
  notifications for new bids, hires, submissions, approvals, payments, and
  messages were silently never sent. Fixed by extracting Socket.IO setup
  into `server/socket.js` with a `getIO()` accessor that controllers call
  lazily, inside each request handler, instead of destructuring once at
  import time.

## Broken bidding flow
- The bid form (`GigDetail.jsx`) sent `{ amount }`, but the `Bid` schema
  required `price` — every bid submission failed Mongoose validation.
  `MyBids.jsx`/`AdminBids.jsx` already expected `price`. Standardized on
  `price` everywhere and fixed the one place (`GigDetail.jsx`) that sent the
  wrong field.
- `gig.bids` was read directly off the gig object in `GigDetail.jsx`, but
  bids are a separate collection never embedded on the Gig document — the
  bid count, bid list, and "already bid" check were always empty/false.
  `GigDetail.jsx` now fetches bids via `GET /api/bids/:gigId` (owner) or
  `GET /api/bids/my` (freelancer, to compute "already bid").
- Added a DB-level unique index (`gigId + freelancerId`) so a freelancer
  can't submit two bids on the same gig even under a race condition.

## Broken gig lifecycle / frontend-backend contract mismatches
- Gig status enum was `open/assigned/inProgress/completed/closed` on the
  backend but the frontend checked for `"in-progress"` (hyphenated) in every
  conditional that gates the "submit work" and "in progress" UI — those
  screens could never appear. Standardized the enum to
  `open/in-progress/submitted/completed/closed` on both sides (also fixed
  `AdminGigs.jsx`'s status dropdown, which still had the old values).
- Route/verb mismatches between the built frontend and the backend:
  - `PUT /gigs/:id/submit-work` (frontend) vs `POST /gigs/:id/submit`
    (backend) — renamed the backend route.
  - `PUT /gigs/:id/approve` (frontend) vs `PATCH /gigs/:id/approve`
    (backend) — changed to PUT.
  - `PUT /gigs/:id/accept-bid` with `{ bidId }` in the body didn't exist on
    the backend at all (only `PATCH /bids/hire/:bidId` did) — added
    `gigController.acceptBid`, sharing its core logic with the existing
    hire-by-bid-id route via an extracted `hireBidCore` helper so both stay
    in sync.
  - `POST /gigs/:id/review` didn't exist — added a gig-scoped review
    endpoint that derives the reviewer/target from the gig itself (never
    trusts a client-supplied target user, so a review can't be spoofed).
  - `POST /payments/create` didn't exist (only `POST /payments`) — added as
    an alias.
- `submitWork` payload shape didn't match: frontend sent `{ file, message }`
  (singular), the Gig schema expected `submission.files` (an array).
  Standardized on a single `file` field on both sides.

## Auth / session bugs (frontend)
- The JWT was written to `localStorage["currentUserToken"]` by
  `AuthContext`, but `api/axios.js`, `NotificationContext.jsx`, and the chat
  socket in `GigDetail.jsx` all read `localStorage["token"]` — so the axios
  `Authorization` header, the notification socket, and the chat socket never
  actually had a token. Standardized on `"token"` everywhere.
- `AuthPage.jsx`'s submit handler called `login(data.user)` — but `login` in
  `AuthContext` is `login(email, password)` and makes its own network
  request; calling it with a user object triggered a second, bogus
  `/auth/login` request with `email` set to an object. Rewritten so
  `AuthPage.jsx` calls the context's `login`/`register` functions directly
  instead of doing its own duplicate `fetch` + misusing the context API.
- `AuthContext` never validated the session on load — it just trusted
  whatever was cached in `localStorage`, including for a deactivated or
  since-expired account. It now calls `GET /auth/me` on mount and clears the
  session if that fails.
- `api/config.js` hardcoded `http://localhost:8800/api` instead of reading
  `import.meta.env.VITE_API_URL` (the `.env` var was also missing the
  required `VITE_` prefix, so Vite would never have exposed it anyway).
- Added a 401 response interceptor to `api/axios.js` that clears local auth
  state and redirects to `/auth` on an expired/invalid session.

## Navbar bugs
- The desktop nav rendered `<NavItems />` with no props, so `user` and
  `location` were both `undefined` inside it and `NavItems` always returned
  `null` — the entire desktop navigation was invisible except for the logo
  and logout button. Fixed by passing `user`/`location` through.
- `NavItems` held its own local, disconnected `open` state and called its
  own `setOpen(false)` on nav-link clicks, which did nothing — the mobile
  menu never closed after navigating. Replaced with a `closeMenu` prop wired
  to the parent `Navbar`'s real `open` state.
- The admin quick-nav linked to `/admin/reports`, a route that doesn't exist
  anywhere in the router. Changed to `/admin/gigs`.

## Authorization / role separation ("proper client and freelancer flow")
- Added `middleware/restrictTo(...roles)` and applied it: only
  `client`/`admin` can create gigs, accept bids, and approve work; only
  `freelancer` can submit bids and submit work.
- Added a matching `ClientRoute` guard on the frontend so a freelancer
  visiting `/create` or `/edit-gig/:id` is redirected home instead of
  hitting a 403 from an otherwise-normal-looking page.
- `messageController.sendMessage` now verifies the `receiver` is actually
  the other party on that gig (not an arbitrary user id).
- `reviewController`/`gigController.reviewGig` now verify the reviewer is
  actually the gig's client or assigned freelancer, that the gig is
  `completed`, and enforce one review per reviewer per gig at the DB level.

## Admin panel
- Added `GET /api/admin/stats` and a new `AdminOverview` dashboard page
  (users/gigs/open gigs/bids/revenue/reviews at a glance) — there was
  previously no landing/overview page, just a redirect straight to the user
  list.
- Wrapped every admin controller function in proper try/catch with
  `next(err)` so a bad id or DB hiccup returns a clean JSON error instead of
  hanging the request or crashing the process.

## Found via live server logs (post-delivery)
- **Infinite notification-polling loop**: `NotificationBell.jsx` runs
  `useEffect(() => loadNotifications(), [loadNotifications])`, but
  `loadNotifications` (and the other functions returned by
  `NotificationProvider`) were plain functions recreated on every render —
  not memoized. Each call updates state -> provider re-renders -> new
  function reference -> effect fires again -> forever. This hammered
  `GET /api/notifications` continuously until the client hit the global rate
  limiter (`429`s on every route). Fixed by wrapping `loadNotifications`,
  `handleMarkAsRead`, and `handleMarkAllAsRead` in `useCallback` with stable
  (empty) dependency arrays.
- `NotificationBell.jsx` destructures `markAsRead`/`markAllAsRead` from
  `useNotifications()`, but the provider only exposed
  `handleMarkAsRead`/`handleMarkAllAsRead` — clicking a notification or
  "Mark all" would throw `markAsRead is not a function`. Fixed by exposing
  the functions under the names the consumer actually uses.
- `GET /api/bids/my 403`: `GigDetail.jsx`'s `fetchBids` branched only on gig
  ownership ("is this user the gig's client?"), not on role. A client
  viewing someone else's gig (or an admin) fell into the `else` branch and
  called the freelancer-only `/bids/my` endpoint, which correctly rejected
  them. Fixed to check `user.role === "freelancer"` explicitly, with a third
  branch (no bid fetch at all) for viewers who are neither the owner nor a
  freelancer.


- `index.js` now fails fast with a clear message if `MONGO_URI`/`JWT_KEY`
  aren't set, instead of failing confusingly later.
- Centralized Mongoose/duplicate-key/cast-error handling in one error
  middleware instead of ad hoc per-controller try/catch blocks with
  inconsistent shapes.
- `verifyToken` now accepts either the httpOnly cookie or an
  `Authorization: Bearer` header (previously cookie-only, which silently
  broke any client relying on the header).
- Removed dead/duplicate files: `server/db.js` (an unused, never-imported
  Mongo connector using deprecated options), a stray `server/Socket.io` file
  containing invalid, non-functional code, `server/routes/sendEmail.js`
  (duplicate of `utils/sendEmail.js`, not wired into any router), and the
  stale `server/client-dist/` build copy.
- Added a public `GET /api/users/:id` profile endpoint (name/bio/avatar/
  skills only) so a gig page can show basic info about the other party.
- Added pagination support to `GET /api/gigs` (backwards compatible: an
  unparameterized call still returns a plain array).

## Found via live server logs (round 2)
- **Login 401 with a correct password**: `authValidators.js` used
  express-validator's `.normalizeEmail()`, which does provider-specific
  canonicalization - most notably, it strips dots from the local part of
  `@gmail.com` addresses (`Jane.Doe@gmail.com` -> `janedoe@gmail.com`) and
  removes `+tag` suffixes. That's useful for deduplicating signups, but
  wrong for login matching: if an account's email was stored before this
  normalization existed (or via the admin seed script, which doesn't run
  through it), login recomputes a different string than what's in the
  database and fails with a misleading "invalid credentials" error even
  though the password is right. Replaced with a plain `trim()` +
  `toLowerCase()`, which matches what's actually stored on the `User` model
  and doesn't rewrite what the user typed.

## Found via live testing (round 3): stale DB connection after editing .env
- **Admin login 401 even with the exact credentials `seed:admin` just
  printed**: `nodemon` only watches `*.js`/`*.mjs`/`*.cjs`/`*.json` files by
  default - it does **not** restart on `.env` changes. If `server/.env` (in
  particular `MONGO_URI`) was edited after `npm run dev` was already
  running, the live API server keeps using whatever connection it opened at
  startup, while `npm run seed:admin` (a fresh, short-lived process) reads
  the *current* `.env` and correctly creates the admin in a different
  database than the one the running server is talking to. Login then fails
  with a normal-looking "invalid credentials" 401, because from the
  server's point of view that user genuinely doesn't exist in the DB it's
  connected to.
  - Added `server/nodemon.json` so nodemon also watches `.env` and restarts
    on changes.
  - Added a startup log line printing the connected database name and host
    (no credentials) so a DB mismatch like this is visible immediately
    instead of silently causing confusing 401s.
  - **Takeaway if you ever change `.env` by hand**: stop (`Ctrl+C`) and
    restart `npm run dev` to be safe, even with the watch fix in place.

## Theme / dark-mode fixes
- **Root cause of "the whole theme looks wrong"**: this project uses
  Tailwind CSS v4, where `dark:` utilities follow the OS's
  `prefers-color-scheme` by default - they do **not** respond to a `.dark`
  class on `<html>` unless you opt in. `ThemeContext.jsx`'s toggle sets
  `document.documentElement.classList.add("dark")`, but `main.css` never
  told Tailwind to treat that class as the dark-mode trigger. In practice
  this meant every `dark:` class in the entire app (Navbar, admin panel,
  cards, everywhere) was silently ignoring the in-app theme toggle and just
  following whatever the OS/browser preference was instead. Fixed by adding
  `@custom-variant dark (&:where(.dark, .dark *));` to `main.css` - this is
  the documented Tailwind v4 way to use class-based dark mode.
- The entire admin panel (`AdminUsers`, `AdminGigs`, `AdminBids`,
  `AdminPayments`, `AdminReviews`, `AdminMessages`, `AdminOverview`, and the
  `AdminDashboard` shell) had zero `dark:` classes on any card, table, or
  background - they'd have stayed hard-coded white/light even with the
  variant fix above. Added matching `dark:` backgrounds, borders, and text
  colors throughout, plus explicit dark styling on the gig-status `<select>`
  in `AdminGigs.jsx` (native selects don't inherit theme colors
  automatically).
- Same hardcoded-light-card issue in `MyPayments.jsx`, `EditGig.jsx`,
  `ForgotPasswordPage.jsx`, and `ResetPasswordPage.jsx` - added `dark:`
  variants so they match the rest of the app instead of staying a bright
  white card regardless of theme. (`AuthPage.jsx` and `NotificationBell.jsx`
  were intentionally left alone - they use a deliberately always-dark
  glassmorphism design with hardcoded white text, which is a design choice,
  not a light/dark bug.)
- Removed leftover `console.log` debug statements in `ThemeContext.jsx`
  that fired on every theme toggle.
- Removed two dead files found while auditing this: `pages/AppContent.jsx`
  (an entirely separate, outdated router implementation with its own route
  set, never imported by anything - the real router is
  `routes/AppRoutes.jsx`) and `components/ThemeTest.jsx` (unused, never
  imported anywhere).

## Payment module completed (checkout UI)
Previously "Release Payment" was a single button with no method selection
at all, despite the surrounding UI claiming "Secure Checkout" / "Protected
payment gateway" - clicking it silently created a pending ledger entry with
no visible next step. Completed the module:
- Added a real checkout modal (`GigDetail.jsx`, using the previously-unused
  `ui/Modal.jsx` component) with UPI / Card / Netbanking method selection,
  matching input fields per method, and a processing state.
- `Payment` model gained `method` (`card`/`upi`/`netbanking`) and
  `methodDetail` (a short, non-sensitive display string only - e.g.
  "UPI: name@bank" or "Card ending 4242"; full card numbers/CVVs are never
  sent to or stored by the server).
- `paymentController.createPayment` now requires `method`, validates it,
  and marks the payment `completed` immediately (simulating an instant
  gateway confirmation) instead of leaving it `pending` and requiring a
  separate, easy-to-miss confirmation step on a different page.
- `MyPayments.jsx` now displays which method a payment was made with.
- Corrected the "Protected payment gateway" copy on the gig page, which
  overstated what's actually implemented (no real gateway is connected -
  see the README's "Notes on scope" section).

## Real Razorpay integration
Replaced the simulated checkout (custom method-selection form that faked a
gateway) with an actual Razorpay integration:
- `server/utils/razorpay.js` - lazily-initialized shared Razorpay client
  from `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET`. Lazy on purpose: a missing
  key doesn't crash the whole server at boot, it only errors (with a clear
  message) when a payment is actually attempted.
- `POST /api/payments/razorpay/order` - creates a Razorpay order. Amount is
  always derived from the gig's `budget` server-side, never trusted from
  the client.
- `POST /api/payments/razorpay/verify` - verifies the HMAC-SHA256 payment
  signature (via `crypto.timingSafeEqual`, not a plain `===`, to avoid a
  timing side-channel) before ever marking a payment `completed`. Also
  fetches the payment's actual method (card/UPI/netbanking/wallet) from
  Razorpay's API server-side rather than trusting anything the client
  reports.
- `Payment` model gained `razorpayOrderId`/`razorpayPaymentId` for an audit
  trail, and `method` now reflects Razorpay's real categories.
- Client: added `utils/loadRazorpay.js` (loads the checkout.js script once,
  cached) and rewired `GigDetail.jsx`'s "Release Payment" button to open
  Razorpay's actual hosted checkout instead of a custom form - this app no
  longer collects raw card numbers/CVVs itself in any form, even client-side
  only, now that a real gateway handles that.
- `server/.env.example` documents the two required env vars and links to
  the Razorpay dashboard; the README has test-card/test-UPI values and a
  note on adding webhook verification before going to production.

## Deployment configuration (Render + Vercel)
- Added `render.yaml` - a Render Blueprint that pre-configures the backend
  as a web service rooted at `server/` (`npm install` / `npm start`), with
  a health check at `/api/health` and prompts for every required secret
  (`MONGO_URI`, `CLIENT_URL`, email/admin/Razorpay vars). `JWT_KEY` is
  auto-generated by the blueprint rather than needing a manual value.
- Added `client/vercel.json` with an SPA rewrite (`/(.*) -> /index.html`) -
  without this, refreshing any client-side route other than `/` (e.g.
  `/gigs/123`) 404s on Vercel, since by default it only serves files that
  exist on disk.
- `index.js`'s CORS `allowedOrigins` now accepts a comma-separated
  `CLIENT_URL` (e.g. a production Vercel URL plus a preview deployment
  URL) instead of a single value.
- README section 5 walks through the full two-step deploy (backend first,
  frontend second, then wiring `CLIENT_URL`/`VITE_API_URL` to each other),
  including the Vite-env-vars-are-build-time gotcha and Render free-tier
  cold-start behavior.
