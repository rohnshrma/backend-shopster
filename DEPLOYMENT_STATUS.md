# Shopster — Deployment Status

_Last updated: 2026-09-08. Committed here so it can be pulled on another device (the
project's root `WORK_LOG.md` lives outside any git repo and has the same content in its
section 13)._

Env values came from three `.env` files that were in `~/Downloads` (`env`, `env (1)`,
`env (2)`). `env (1)` is the production-configured backend one (Atlas URI + Vercel
`CLIENT_URL`) and is the source of truth below. Those download files are **not** in git.

---

## Repo prep (already committed + pushed)

- **backend-shopster** `6493cf4` on `main`: `render.yaml` blueprint (secrets `sync:false`),
  `GET /healthz` in `server.js`, `engines.node >=20` in `package.json`.
- **frontend-shopster** `1da8048` on `main`: `vercel.json` SPA rewrite to `/index.html`.
- Local `.env` in each repo, created from the downloads — git-ignored, not pushed.

---

## Backend — Render (LIVE)

| | |
|---|---|
| Service | `backend-shopster` — web service, **Free** plan, region Oregon, branch `main` |
| Service ID | `srv-dafq1rf40ujc73ce1dr0` (Render workspace "webigeeks's Workspace") |
| Live URL | **https://backend-shopster-17xk.onrender.com** (name `backend-shopster` was taken → `-17xk`) |
| Build / Start | `npm install` / `node server.js` |
| Health check | `/healthz` |
| Verified | Node 20.20.2, binds Render's injected `PORT` (10000), Atlas connected, `GET /api/product` returns real data |

### Render env vars (set via *Add from .env*)

| Key | Value / note |
|---|---|
| `MONGO_URI` | `mongodb+srv://vk8595422784_db_user:...@cluster0.z7331kg.mongodb.net/?appName=Cluster0` |
| `JWT_SECRET` | `qwertyuio` |
| `JWT_BUYER` | `poiuytrewq` |
| `STRIPE_SECRET_KEY` | `sk_test_51T3v3r0...` (test key from `env (1)`) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_bba9f2b0...` — **placeholder, wrong endpoint. Must be replaced — see below.** |
| `CLIENT_URL` | `https://shopster-e-commerce-indol.vercel.app` (updated once the Vercel URL was known; redeploy `dep-dafq5mf40ujc73cejjd0`) |
| `NODE_VERSION` | `20` |
| `PORT` | **not set on purpose** — Render injects it; `server.js` reads `process.env.PORT`. Don't add it. |

---

## Frontend — Vercel (LIVE)

| | |
|---|---|
| Project | `shopster-e-commerce`, team `rohnshrmas-projects` (Hobby), preset Vite, branch `main` |
| Live URL | **https://shopster-e-commerce-indol.vercel.app** (`shopster-e-commerce.vercel.app` was taken → `-indol`) |
| Env var | `VITE_API_URL` = `https://backend-shopster-17xk.onrender.com/api` (Production + Preview). Inlined at build time — changing it needs a redeploy. |
| Verified | SPA routes resolve (`/login`, `/shop`); `vercel.json` rewrite works |

**End-to-end check:** a cross-origin `fetch()` from the Vercel origin to
`https://backend-shopster-17xk.onrender.com/api/product` returned `200 OK` with data,
so CORS (`CLIENT_URL`) is correct.

Notes: Render Free spins down after ~15 min idle (~50s cold start). Atlas already accepts
Render connections. If the frontend's Vercel domain ever changes, update `CLIENT_URL` on
Render to match exactly or CORS breaks.

---

## STILL TO DO — Stripe webhook (blocked on Stripe login; do this on the other device)

1. Sign in to the Stripe account that owns the `sk_test_51T3v3r0...` test key (the one on
   Render), in **test mode**.
2. Dashboard → Developers → Webhooks → **Add endpoint**:
   - Endpoint URL: `https://backend-shopster-17xk.onrender.com/api/payment/webhook`
   - Event: `checkout.session.completed`
3. Open the new endpoint → reveal its **Signing secret** (`whsec_...`).
4. Render → `backend-shopster` → Environment → edit `STRIPE_WEBHOOK_SECRET` → paste the
   new secret → **Save, rebuild, and deploy**.

Until then, checkout redirects to Stripe fine, but the webhook that marks the order paid
fails signature verification (`stripe.webhooks.constructEvent` in
`controllers/paymentController.js`).
