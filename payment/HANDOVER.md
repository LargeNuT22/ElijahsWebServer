# elijah-stripe — handover

Stripe payment page for the Divinity Fitness gym mini fridge, served at
**https://payment.divinity.fitness**.

## What is in this archive

- `elijah-stripe/` — the full working tree as it ran in production, minus `node_modules`
  and `.react-router`. This includes `.env`, which holds **live Stripe keys** (see Secrets
  below). Treat this archive as a secret.
- `deployment/payment.divinity.fitness.conf` — the nginx vhost it ran behind.

Source of truth is **https://github.com/Zei33/elijah-stripe** (branch `main`). The archived
tree is at commit `45ac891` with a clean working tree, so it matches `origin/main` exactly.
The only thing not in git is `.env`.

## Stack

React Router v7 (framework mode, SSR) + Express, TypeScript, pnpm. Stripe via
`@stripe/react-stripe-js` on the client and the `stripe` Node SDK on the server.

## Running it

```bash
pnpm install
pnpm build          # build:client (react-router build) then build:server (tsc)
pnpm start          # NODE_ENV=production node --env-file=.env dist/server/index.js
```

Listens on `PORT` from `.env` (production used **12600**).

## How it was hosted (the setup being retired)

An Ubuntu 20.04 EC2 instance, with the app kept alive in a **detached `screen` session named
`divinity`** — no systemd unit, no process manager, no auto-restart on boot. nginx terminated
TLS (certbot) and reverse-proxied `payment.divinity.fitness` to `127.0.0.1:12600`.

The vhost sets `Permissions-Policy: payment=(*)`, which the Payment Request API (Apple Pay /
Google Pay) needs in order to appear. Keep that header on the new host or those payment
methods silently disappear.

**This instance is being terminated.** Nothing here needs to be reproduced literally — any
Node host will do. A systemd unit or a container would be an improvement on the screen session.

## Secrets

`.env` contains:

| Variable | Notes |
|---|---|
| `STRIPE_SECRET_KEY` | **live** secret key — rotate it in the Stripe dashboard after handover |
| `VITE_STRIPE_PUBLISHABLE_KEY` | live publishable key; inlined into the client bundle at build time |
| `PORT` | 12600 in production |
| `NODE_ENV` | production |
| `APP_URL` | used for Stripe return URLs — **must** be updated to the new origin |
| `USE_HTTPS` | |

Two test-mode keys are present but commented out.

`VITE_STRIPE_PUBLISHABLE_KEY` is inlined by Vite at **build** time, not read at runtime, so
changing it requires a rebuild.

## DNS

`divinity.fitness` is **not** in the AWS account being decommissioned. Whoever controls that
zone needs to repoint `payment.divinity.fitness` at the new host, and a fresh TLS certificate
will need issuing there.
