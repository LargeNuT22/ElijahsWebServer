# Payment app — payment.divinity.fitness

Stripe checkout for the gym's self-service mini fridge. Customers scan a QR code
or NFC tag on a drink, which opens `https://payment.divinity.fitness/<PRODUCT_ID>`
and shows a one-tap payment page (Apple Pay / Google Pay / card / Afterpay).

There are deliberately **no links to this app from the main website** — the QR/NFC
tags are the only entry point, and its `robots.txt` blocks crawlers.

This guide deploys it on the **same EC2 instance** as the main site (see the root
`SETUP.md` first — nginx, DNS and HTTPS basics are set up there).

```
Phone (QR/NFC scan)
        │ https://payment.divinity.fitness/<product-id>
        ▼
   nginx (443, TLS)  ── adds Permissions-Policy: payment=(*)
        │ proxy
        ▼
   Node app on 127.0.0.1:12600  (systemd: divinity-payment)
        │
        ▼
   Stripe API (products, prices, checkout sessions)
```

Prices always come from Stripe server-side — a visitor cannot alter the amount.

---

## 0. Checklist

- [ ] DNS: `payment.divinity.fitness` A record → the instance's Elastic IP
- [ ] pnpm installed (`corepack enable pnpm`)
- [ ] `/etc/divinity/payment.env` created from the handover archive's `.env` (600)
- [ ] App built (`pnpm install && pnpm build` with the env file sourced)
- [ ] systemd unit `divinity-payment` running
- [ ] nginx vhost for the subdomain + certbot certificate
- [ ] `Permissions-Policy: payment=(*)` header present (Apple/Google Pay need it)
- [ ] Test purchase from a real QR/NFC tag
- [ ] Stripe secret key rotated (the old host's key was handed over in an archive)

---

## 1. DNS

In the `divinity.fitness` DNS zone add:

| Type | Name    | Value                     |
|------|---------|---------------------------|
| A    | payment | (same Elastic IP as site) |

The QR/NFC tags already encode `https://payment.divinity.fitness/<product-id>`,
so keeping this exact subdomain means **every existing tag keeps working** and the
Apple Pay / Google Pay domain registration with Stripe stays valid.

---

## 2. Configuration — outside the web root

The live Stripe keys are in the handover archive's `.env` (they are **not** in
git, on purpose). Put them at `/etc/divinity/payment.env`:

```bash
sudo mkdir -p /etc/divinity
sudo nano /etc/divinity/payment.env      # paste the contents of the archive's .env
sudo chmod 600 /etc/divinity/payment.env
sudo chown root:root /etc/divinity/payment.env
```

It must contain (see `payment/env.example` for the template):

| Variable | Value |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_...` (rotate it — see section 8) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` — **baked into the client at build time**; changing it requires a rebuild |
| `PORT` | `12600` |
| `NODE_ENV` | `production` |
| `USE_HTTPS` | `false` (nginx terminates TLS) |
| `APP_URL` | `https://payment.divinity.fitness` (Stripe return URL — must match exactly) |

Never open port 12600 in the security group — it is reachable only via nginx,
same rule as the contact-form service's port 3000.

---

## 3. Build

pnpm comes via corepack (bundled with Node):

```bash
sudo corepack enable pnpm
```

> **t3.micro note:** the Vite/TypeScript build can exhaust 1 GB RAM. If the build
> gets killed, add swap once:
> ```bash
> sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
> sudo mkswap /swapfile && sudo swapon /swapfile
> echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
> ```

Build in a root shell so the env file (needed for the Vite key) can be read:

```bash
sudo -s
cd /var/www/ElijahsWebServer/payment
set -a; source /etc/divinity/payment.env; set +a
pnpm install
pnpm build                      # client → build/client, server → dist/server
chown -R www-data:www-data /var/www/ElijahsWebServer/payment
exit
```

---

## 4. systemd unit

The app reads its config from the environment (systemd injects the file below;
the in-app `dotenv` is a no-op when no local `.env` exists).

```bash
sudo tee /etc/systemd/system/divinity-payment.service >/dev/null <<'EOF'
[Unit]
Description=Divinity payment app (Stripe mini-fridge checkout)
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/ElijahsWebServer/payment
EnvironmentFile=/etc/divinity/payment.env
ExecStart=/usr/bin/node dist/server/index.js
Restart=always
RestartSec=5

# Hardening
NoNewPrivileges=true
ProtectSystem=full
ProtectHome=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now divinity-payment
sudo systemctl status divinity-payment --no-pager
curl -s http://127.0.0.1:12600/api/health     # → {"status":"ok"}
```

---

## 5. nginx vhost

`Permissions-Policy: payment=(*)` is **required** — without it, Apple Pay and
Google Pay silently disappear from the payment page.

```bash
sudo tee /etc/nginx/sites-available/divinity-payment >/dev/null <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name payment.divinity.fitness;

    add_header Permissions-Policy "payment=(*)" always;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;

    client_max_body_size 64k;

    location / {
        proxy_pass         http://127.0.0.1:12600;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        "upgrade";
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/divinity-payment /etc/nginx/sites-enabled/divinity-payment
sudo nginx -t && sudo systemctl reload nginx
```

Then HTTPS (DNS from section 1 must already resolve):

```bash
sudo certbot --nginx -d payment.divinity.fitness
```

Certbot rewrites the vhost for TLS and adds the HTTP→HTTPS redirect; renewal is
already automatic from the main-site setup.

---

## 6. Verification

```bash
curl -s https://payment.divinity.fitness/api/health          # {"status":"ok"}
curl -s https://payment.divinity.fitness/robots.txt          # Disallow: /
curl -sI https://payment.divinity.fitness/ | grep -i permissions-policy
                                                             # payment=(*)
curl -s https://payment.divinity.fitness/api/products | head -c 200
                                                             # JSON list of drinks
```

Finally scan a real QR/NFC tag with a phone: product name and price should
appear with Apple Pay / Google Pay buttons. In live mode the smallest real test
is buying the cheapest drink and refunding it from the Stripe dashboard.

---

## 7. Routine deploys

The payment app only needs redeploying when files under `payment/` change:

```bash
cd /var/www/ElijahsWebServer && sudo git pull
sudo -s
cd /var/www/ElijahsWebServer/payment
set -a; source /etc/divinity/payment.env; set +a
pnpm install && pnpm build
chown -R www-data:www-data /var/www/ElijahsWebServer/payment
exit
sudo systemctl restart divinity-payment
```

---

## 8. Stripe housekeeping

- **Rotate the secret key.** The old live `sk_live_...` was passed around in the
  handover archive, so treat it as exposed: Stripe Dashboard → Developers → API
  keys → roll the secret key. Put the new value in `/etc/divinity/payment.env`
  and `sudo systemctl restart divinity-payment`. No rebuild needed — only the
  *publishable* key requires a rebuild.
- **Products & prices** are managed entirely in the Stripe Dashboard → Products.
  A product appears on the app's home page only if its metadata has
  `public_visible = true`; ordering uses a numeric `sort` metadata field. New
  NFC/QR tags should encode `https://payment.divinity.fitness/<PRODUCT_ID>`.
- **Domain registration** (Settings → Payment methods → Domains) already covers
  `payment.divinity.fitness`; it survives the move because the domain is
  unchanged. If Apple Pay ever stops showing, re-verify it there.

---

## 9. Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Apple Pay / Google Pay buttons missing | `Permissions-Policy: payment=(*)` header missing (check nginx), not HTTPS, or domain not registered in Stripe |
| 502 from nginx | app down — `sudo journalctl -u divinity-payment -n 50` |
| Home page shows no drinks | wrong key mode (test vs live) or products missing `public_visible=true` metadata |
| Payment succeeds but wrong return page | `APP_URL` in `/etc/divinity/payment.env` doesn't match the public origin |
| Build killed on the server | out of memory — add swap (section 3) |
| `Ignored build scripts: esbuild` during install | `pnpm-workspace.yaml` must contain the `allowBuilds: esbuild: true` entry (already in the repo) |
