# Divinity Health & Fitness — Production Setup Guide (AWS EC2)

> **This is the master setup document.** It reflects the site as it is today:
> static HTML/CSS/JS pages **plus** a Node.js contact-form backend that sends
> email via Amazon SES. It supersedes the older guides
> (`ec2-deployment-guide.md`, `ec2-update-commands.md`,
> `DEPLOYMENT_INSTRUCTIONS.md`, `MANUAL_PUSH_GUIDE.md`).
> `SES_SETUP.md` remains as a focused reference for the contact form only.

---

## Architecture

```
                         ┌────────────────────── EC2 instance (Ubuntu) ──────────────────────┐
Visitor ── HTTPS (443) ──▶  nginx                                                            │
                         │   ├── serves static files from /var/www/ElijahsWebServer          │
                         │   └── /api/*  ──proxy──▶  Node.js (server.js, port 3000)          │
                         │                              └──▶ Amazon SES (ap-southeast-2)     │
                         └────────────────────────────────────────────────────────┬──────────┘
                                                                                  ▼
                                                                    divinitygym@hotmail.com
```

- **nginx** — TLS termination, static files, caching, security headers, `/api/` reverse proxy
- **Node.js (`server.js`)** — validates contact-form submissions, honeypot + rate limiting, sends via SES
- **Amazon SES** — email delivery; the instance authenticates via an **IAM role** (no keys on disk)
- **Repo** — `github.com/LargeNuT22/ElijahsWebServer`, branch **`node-version`**, deployed at `/var/www/ElijahsWebServer`

---

## 0. Quick checklist (tick these off in order)

- [ ] EC2 instance launched (Ubuntu LTS), Elastic IP attached
- [ ] Security group: 443 + 80 open to world, 22 restricted to your IP
- [ ] IAM role with `ses:SendEmail` attached to the instance
- [ ] DNS A records for `divinity.fitness` and `www.divinity.fitness` → Elastic IP
- [ ] System packages, Node.js LTS, nginx, git installed
- [ ] Repo cloned to `/var/www/ElijahsWebServer`, `npm install --omit=dev` run
- [ ] SES: domain identity verified (DKIM), production access granted
- [ ] `/etc/divinity/contact.env` created (outside web root)
- [ ] `divinity-contact` systemd service enabled and running
- [ ] nginx site config in place, `nginx -t` passes
- [ ] HTTPS via certbot, auto-renewal timer active
- [ ] End-to-end test: form submission arrives in the inbox
- [ ] Google Search Console verified, sitemap submitted

---

## 1. AWS resources

### 1.1 EC2 instance

| Setting | Recommendation | Why |
| --- | --- | --- |
| AMI | Ubuntu Server 24.04 LTS (or 22.04 LTS) | Long support window, matches this guide |
| Type | `t3.micro` (2 vCPU, 1 GB) | Ample for a static site + tiny API; upgrade to `t3.small` only if needed |
| Storage | 20 GB gp3 | Site + photos + logs with headroom |
| Key pair | Your existing `.pem` | Keep it safe; it is the only SSH door |
| Elastic IP | **Yes — allocate and associate** | Instance IP survives stop/start; DNS stays valid |

### 1.2 Security group (firewall)

| Port | Source | Purpose |
| --- | --- | --- |
| 443 (HTTPS) | `0.0.0.0/0`, `::/0` | Public site |
| 80 (HTTP) | `0.0.0.0/0`, `::/0` | Redirects to HTTPS + certbot renewal |
| 22 (SSH) | **Your IP only** (e.g. `x.x.x.x/32`) | Admin access. Never leave open to the world |

Port **3000 must NOT be opened** — Node is reached only through nginx on localhost.

### 1.3 IAM role (lets the server send email without stored keys)

1. IAM → **Roles → Create role** → trusted entity: **AWS service → EC2**.
2. Create/attach this inline policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       { "Effect": "Allow", "Action": "ses:SendEmail", "Resource": "*" }
     ]
   }
   ```
3. Name it e.g. `divinity-web-ses`, then EC2 → instance → **Actions → Security →
   Modify IAM role** → attach.

The AWS SDK on the instance discovers this role automatically. **Never put AWS
access keys in the repo or on the server.**

### 1.4 DNS

Wherever `divinity.fitness` DNS is hosted (Route 53 or the registrar):

| Record | Type | Value |
| --- | --- | --- |
| `divinity.fitness` | A | Elastic IP |
| `www.divinity.fitness` | A | Elastic IP |

Plus the **three DKIM CNAME records** SES gives you in step 3.

---

## 2. Server software

SSH in:

```bash
ssh -i "your-key.pem" ubuntu@<elastic-ip>
```

Install everything:

```bash
# System updates + automatic security patches
sudo apt update && sudo apt upgrade -y
sudo apt install -y unattended-upgrades git nginx
sudo dpkg-reconfigure -plow unattended-upgrades   # choose Yes

# Node.js 22 LTS (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node --version    # v22.x

sudo systemctl enable --now nginx
```

### 2.1 Deploy the code

```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/LargeNuT22/ElijahsWebServer.git
cd ElijahsWebServer
sudo git checkout node-version

# Server-side dependencies (express + AWS SES SDK; skips dev tools)
sudo npm install --omit=dev

# Ownership: nginx/node run as www-data
sudo chown -R www-data:www-data /var/www/ElijahsWebServer
sudo chmod -R 755 /var/www/ElijahsWebServer
```

---

## 3. Amazon SES (email for the contact form)

All in the AWS console, region **Asia Pacific (Sydney) `ap-southeast-2`**:

1. **Verify the domain** — SES → *Identities* → *Create identity* → **Domain** →
   `divinity.fitness`. Add the three DKIM CNAMEs to DNS. Wait for "Verified"
   (minutes to a few hours). This lets you send as `noreply@divinity.fitness`.
2. **Leave the sandbox** — SES → *Account dashboard* → *Request production
   access* (use case: "transactional contact-form notifications for our gym
   website, ~a few emails/day"). Usually approved within 24 h.
   *Shortcut while waiting:* also verify `divinitygym@hotmail.com` as an email
   identity — sandbox accounts can send to verified addresses, so the form
   works immediately.
3. *(Optional)* Set a **CloudWatch billing alarm**; at this volume SES costs
   effectively $0 (US$0.10 per 1,000 emails).

---

## 4. Contact-form service (Node + systemd)

### 4.1 Configuration — outside the web root

nginx serves `/var/www/ElijahsWebServer/` publicly, so secrets must not live
there. Create:

```bash
sudo mkdir -p /etc/divinity
sudo tee /etc/divinity/contact.env >/dev/null <<'EOF'
SES_REGION=ap-southeast-2
SES_FROM=Divinity Health & Fitness <noreply@divinity.fitness>
SES_TO=divinitygym@hotmail.com
PORT=3000
EOF
sudo chmod 600 /etc/divinity/contact.env
```

### 4.2 systemd unit — starts on boot, restarts on crash

```bash
sudo tee /etc/systemd/system/divinity-contact.service >/dev/null <<'EOF'
[Unit]
Description=Divinity contact form (Express + SES)
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/ElijahsWebServer
EnvironmentFile=/etc/divinity/contact.env
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=3
User=www-data
NoNewPrivileges=true
ProtectSystem=full
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now divinity-contact
systemctl status divinity-contact     # expect: active (running)
curl -s localhost:3000/api/health     # expect: {"ok":true,"configured":true}
```

> If `which node` is not `/usr/bin/node`, adjust `ExecStart`.

---

## 5. nginx

Replace the default site with this config:

```bash
sudo tee /etc/nginx/sites-available/divinity >/dev/null <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name divinity.fitness www.divinity.fitness;

    root /var/www/ElijahsWebServer;
    index index.html;

    # ---- API: proxy to the Node contact service -------------------------
    location /api/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }

    # ---- Static site ----------------------------------------------------
    location / {
        try_files $uri $uri/ =404;
    }

    # Never serve dotfiles (protects any stray .env, .git, etc.)
    location ~ /\. {
        deny all;
    }

    # The payment app's source lives in the repo but is a separate service on
    # payments.divinity.fitness — never serve its files from the main site
    location ^~ /payment {
        return 404;
    }

    # Long cache for images (filenames are stable derivatives)
    location ~* \.(webp|jpg|jpeg|png|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # Short cache for CSS/JS (no build hashes, so keep this modest)
    location ~* \.(css|js)$ {
        expires 1d;
        add_header Cache-Control "public, max-age=86400";
    }

    # HTML always revalidates so site updates appear immediately
    location ~* \.html$ {
        add_header Cache-Control "no-cache";
    }

    # ---- Security headers ------------------------------------------------
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;

    # Contact form posts are tiny
    client_max_body_size 64k;

    # ---- Compression ------------------------------------------------------
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml text/plain application/xml;
    gzip_min_length 1024;
}
EOF

sudo ln -sf /etc/nginx/sites-available/divinity /etc/nginx/sites-enabled/divinity
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

At this point `http://<elastic-ip>/` should serve the site and
`http://<elastic-ip>/api/health` should return JSON.

---

## 6. HTTPS (Let's Encrypt)

Requires DNS (section 1.4) to already point at the instance.

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d divinity.fitness -d www.divinity.fitness \
    --redirect -m divinitygym@hotmail.com --agree-tos --no-eff-email
```

`--redirect` makes certbot rewrite the config so all HTTP traffic 301s to
HTTPS. Renewal is automatic (systemd timer); verify with:

```bash
sudo certbot renew --dry-run
systemctl list-timers | grep certbot
```

### 6.1 Canonical host + HSTS (after HTTPS works)

For SEO, exactly one origin should serve content: `https://divinity.fitness`.
Certbot will have split the config into HTTP-redirect and HTTPS blocks. In the
**HTTPS server block**:

1. Add `www → apex` handling by creating a small extra server block:
   ```nginx
   server {
       listen 443 ssl;
       listen [::]:443 ssl;
       server_name www.divinity.fitness;
       ssl_certificate     /etc/letsencrypt/live/divinity.fitness/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/divinity.fitness/privkey.pem;
       return 301 https://divinity.fitness$request_uri;
   }
   ```
   and remove `www.divinity.fitness` from the main HTTPS block's `server_name`.
2. Add HSTS to the main HTTPS block **only once redirects are confirmed working**:
   ```nginx
   add_header Strict-Transport-Security "max-age=31536000" always;
   ```

Then `sudo nginx -t && sudo systemctl reload nginx`.

---

## 7. Post-deploy verification

```bash
# All four should end at https://divinity.fitness/... with a single 301
curl -sI http://divinity.fitness/            | head -3
curl -sI http://www.divinity.fitness/        | head -3
curl -sI https://www.divinity.fitness/       | head -3
curl -sI https://divinity.fitness/           | head -3

# API healthy through nginx
curl -s https://divinity.fitness/api/health

# Real end-to-end email test (then check the inbox, incl. spam folder)
curl -s -X POST https://divinity.fitness/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Deploy Test","email":"you@example.com","goals":"Testing after deploy"}'

# Dotfile protection
curl -sI https://divinity.fitness/.env | head -1     # expect 403

# Legal pages, sitemap, robots
curl -sI https://divinity.fitness/privacy.html | head -1
curl -sI https://divinity.fitness/sitemap.xml  | head -1
```

Browser checks: slideshow crossfades, reviews slider swipes, hamburger menu on
a phone, contact form shows the green success banner.

External checks (free):
- **SSL Labs** (ssllabs.com/ssltest) — expect A or A+
- **PageSpeed Insights** — mobile + desktop
- **Google Search Console** — verify the domain property, submit
  `https://divinity.fitness/sitemap.xml`

---

## 8. Updating the site (routine deploys)

Create a deploy script once:

```bash
sudo tee /usr/local/bin/deploy-divinity >/dev/null <<'EOF'
#!/bin/bash
set -e
cd /var/www/ElijahsWebServer
git pull origin node-version
npm install --omit=dev
chown -R www-data:www-data /var/www/ElijahsWebServer
chmod -R 755 /var/www/ElijahsWebServer
systemctl restart divinity-contact
nginx -t && systemctl reload nginx
echo "Deployed OK: $(git rev-parse --short HEAD)"
EOF
sudo chmod +x /usr/local/bin/deploy-divinity
```

Then every future update is:

```bash
# locally
git push origin node-version

# on the server
sudo deploy-divinity
```

**Rollback** (if a deploy breaks something):

```bash
cd /var/www/ElijahsWebServer
sudo git log --oneline -5              # find the last good commit
sudo git reset --hard <good-commit>
sudo systemctl restart divinity-contact
```

---

## 9. Monitoring & maintenance

| What | How | Cadence |
| --- | --- | --- |
| Contact service logs | `journalctl -u divinity-contact -n 50` | When investigating |
| nginx access/error logs | `/var/log/nginx/access.log`, `error.log` | When investigating |
| Service running? | `systemctl status divinity-contact nginx` | After any change |
| Disk space | `df -h` | Monthly |
| OS security patches | `unattended-upgrades` (installed above) | Automatic |
| Reboot after kernel updates | `cat /var/run/reboot-required` → `sudo reboot` | When flagged |
| TLS renewal | Automatic; `sudo certbot renew --dry-run` to confirm | Quarterly glance |
| SES sending stats / bounces | SES console → Account dashboard | Monthly glance |
| Search Console | Coverage + enhancements reports (emails you on problems) | On alert |

**Backups:** the site itself is fully reproducible from GitHub — the only
server-unique files are `/etc/divinity/contact.env`,
`/etc/nginx/sites-available/divinity`, and `/etc/letsencrypt/`. Copy those
three somewhere safe once, and re-creating the whole server takes ~30 minutes
with this guide. (Optional extra: enable daily EBS snapshots via Amazon Data
Lifecycle Manager.)

---

## 10. Troubleshooting

| Symptom | Check | Likely fix |
| --- | --- | --- |
| 502 on `/api/contact` | `systemctl status divinity-contact` | Service down → `journalctl -u divinity-contact -n 50`, fix, restart |
| `/api/health` says `"configured":false` | Env file loaded? | Fix `/etc/divinity/contact.env`, `sudo systemctl restart divinity-contact` |
| Log: "Email address is not verified" | SES identity status | Domain not verified, or still in sandbox sending to unverified recipient (§3) |
| Log: "AccessDenied" / credential errors | Instance IAM role | Role missing `ses:SendEmail` or not attached (§1.3) |
| Form sends but nothing in inbox | Spam folder; SES suppression list | Check hotmail spam; SES console → suppression list |
| 429 "Too many messages" | Rate limiter | Expected: 5 submissions/IP/10 min |
| Site shows old content after deploy | Browser/CDN cache | HTML is `no-cache`; hard-refresh; confirm `git log` on server matches local |
| `nginx -t` fails | Message points at the line | Fix, re-run `nginx -t`, then reload |
| Certificate expired | `systemctl list-timers` (look for certbot) | Timer inactive → `sudo systemctl enable --now certbot.timer` |
| Instance IP changed | Elastic IP association | Re-associate the Elastic IP (or it was never attached — attach one) |

---

## 11. Security summary (what protects what)

- **No secrets in the browser or repo** — SES auth via instance IAM role; env file at `/etc/divinity` with `600` perms
- **Port 3000 closed externally** — Node reachable only through nginx
- **SSH locked to your IP**, key-only auth
- **Dotfiles denied** by nginx (`.env`, `.git` can never be served)
- **Form abuse** — honeypot field + 5/IP/10-min rate limit + input validation in `server.js`
- **systemd hardening** — service runs as `www-data` with `ProtectSystem`/`PrivateTmp`
- **TLS everywhere** — certbot redirect + (after verification) HSTS
- **Auto security patches** — unattended-upgrades

## 12. Monthly cost (approximate, Sydney region)

| Item | Cost |
| --- | --- |
| EC2 `t3.micro` | ~US$9.50 (less with savings plan; ~$0 first year on free tier) |
| EBS 20 GB gp3 | ~US$1.90 |
| Elastic IP (attached to running instance) | $0 |
| SES | ~$0 at contact-form volume |
| Route 53 hosted zone (if used) | US$0.50 |
| **Total** | **~US$12/month** |

---

## 13. Payment app (payments.divinity.fitness)

The `payment/` folder in this repo is a **separate Stripe checkout app** for the
gym's self-service mini fridge, reached only by scanning the QR/NFC tags on the
drinks — it is intentionally not linked from the main site.

It runs as its own systemd service (`divinity-payment`, port 12600) behind its
own nginx vhost on this same instance. Full setup, build and Stripe
instructions: **[payment/DEPLOY.md](payment/DEPLOY.md)**.

Two rules it shares with the rest of this guide:

- Its Stripe keys live in `/etc/divinity/payment.env` (600, outside the web
  root) — never in the repo.
- Port 12600 stays closed in the security group, like port 3000.
