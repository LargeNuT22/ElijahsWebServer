# Contact form → AWS SES setup

The contact form no longer uses EmailJS. It posts to `/api/contact` on your own
server (`server.js`), which relays the message to your inbox through **Amazon SES**.
No email credentials ever reach the browser.

```
Browser ──POST /api/contact──▶ nginx ──proxy──▶ Node (server.js) ──▶ AWS SES ──▶ divinitygym@hotmail.com
```

---

## 1. Verify a sender identity in SES

In the AWS console, region **Sydney (ap-southeast-2)** → **Amazon SES → Identities → Create identity**.

- **Best:** verify the **domain** `divinity.fitness` (add the DKIM CNAME records SES gives you to your DNS). Then you can send as `noreply@divinity.fitness`.
- **Quick alternative:** verify a single **email address** you control and use it as `SES_FROM`.

> You cannot send "from" a hotmail address you don't own — that's why `SES_FROM`
> should be on your domain. The customer's address goes in **Reply-To**, so you can
> just hit reply to answer them.

## 2. Leave the SES sandbox

New SES accounts are in a **sandbox** that only sends to *verified* addresses.
Two choices:

- **Request production access** (SES → *Account dashboard* → *Request production access*). Recommended — usually approved within a day.
- **Or stay in the sandbox:** since every enquiry goes to the single fixed inbox `divinitygym@hotmail.com`, verify that one address as an identity too and the form will work without production access.

## 3. Give the EC2 instance permission (IAM role — no keys needed)

1. IAM → **Roles → Create role** → trusted entity **AWS service → EC2**.
2. Attach a policy allowing SES send:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       { "Effect": "Allow", "Action": "ses:SendEmail", "Resource": "*" }
     ]
   }
   ```
3. EC2 → your instance → **Actions → Security → Modify IAM role** → attach it.

The AWS SDK picks up this role automatically — you do **not** put AWS keys in `.env`.

## 4. Deploy on the EC2 box

```bash
cd /var/www/ElijahsWebServer
git pull origin node-version
npm install --omit=dev          # installs express + @aws-sdk/client-ses
```

### Configuration (keep secrets OUT of the web root)

nginx serves `/var/www/ElijahsWebServer/` publicly, so **do not** put a `.env`
there. Instead create an env file elsewhere:

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

### Run it as a service (starts on boot, restarts on crash)

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
User=www-data

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now divinity-contact
sudo systemctl status divinity-contact        # should be "active (running)"
```

> Adjust `ExecStart` if `which node` isn't `/usr/bin/node`.

## 5. Point nginx `/api/` at the Node process

In your nginx `server { ... }` block for the site, add:

```nginx
# Relay API calls to the Node contact server
location /api/ {
    proxy_pass         http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header   Host              $host;
    proxy_set_header   X-Real-IP         $remote_addr;
    proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
}

# Defence in depth: never serve dotfiles (e.g. a stray .env) as static
location ~ /\. {
    deny all;
}
```

Then reload:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 6. Test

```bash
# On the server — should return {"ok":true,"configured":true}
curl -s localhost:3000/api/health

# End-to-end from anywhere
curl -s -X POST https://divinity.fitness/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","email":"you@example.com","goals":"Just testing"}'
```

A real enquiry should land in `divinitygym@hotmail.com` within seconds.

---

## After it works

- **Delete the EmailJS account / rotate its keys** — they're no longer used and were public.
- If the GitHub repo doesn't need to be public, make it private.
- Watch send volume in the SES console; set a billing alarm if you like (sending is ~$0.10 per 1,000 emails).

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| `configured: false` from `/api/health` | `SES_FROM` / `SES_TO` not loaded — check the EnvironmentFile and `systemctl restart divinity-contact` |
| 502 + log "Email address is not verified" | Sender not verified, or still in sandbox sending to an unverified recipient (see steps 1–2) |
| 502 + log "AccessDenied" / credentials | IAM role missing `ses:SendEmail` or not attached to the instance |
| Form posts but nothing arrives | Check the business inbox spam folder; confirm `SES_TO` is correct |
| 429 responses | Rate limiter (5 per IP per 10 min) — expected under rapid retries |
