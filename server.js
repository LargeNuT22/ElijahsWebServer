/**
 * Divinity Health & Fitness — contact form backend.
 *
 * Serves POST /api/contact, which validates the submission and relays it to the
 * business inbox via Amazon SES. All email credentials live server-side (env vars
 * or, preferably, an EC2 instance IAM role) and are never exposed to the browser.
 *
 * In production nginx serves the static site and reverse-proxies /api/ to this
 * process; the static handler below is a convenience for local development.
 */

// Load .env for local development only. In production, supply env vars via the
// systemd unit (see SES_SETUP.md) — do NOT place a .env file in the web root.
try {
    require('dotenv').config();
} catch (err) {
    /* dotenv is optional; ignore if not installed */
}

const path = require('path');
const express = require('express');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const app = express();
app.set('trust proxy', 1); // sit behind nginx; trust its X-Forwarded-For

const PORT = process.env.PORT || 3000;
const SES_REGION = process.env.SES_REGION || 'ap-southeast-2'; // Sydney (closest to QLD)
const SES_FROM = process.env.SES_FROM;                          // verified SES sender identity
const SES_TO = process.env.SES_TO;                              // business inbox

const ses = new SESClient({ region: SES_REGION });

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// --- Simple in-memory rate limiter (per IP) --------------------------------
// Enough to blunt abuse of a small contact form without extra dependencies.
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_MAX = 5;                    // submissions per IP per window
const rateHits = new Map();

function isRateLimited(ip) {
    const now = Date.now();
    const rec = rateHits.get(ip) || { count: 0, start: now };
    if (now - rec.start > RATE_WINDOW_MS) {
        rec.count = 0;
        rec.start = now;
    }
    rec.count += 1;
    rateHits.set(ip, rec);
    return rec.count > RATE_MAX;
}

// Periodically drop stale entries so the map can't grow unbounded.
setInterval(() => {
    const now = Date.now();
    for (const [ip, rec] of rateHits) {
        if (now - rec.start > RATE_WINDOW_MS) rateHits.delete(ip);
    }
}, RATE_WINDOW_MS).unref();

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SERVICE_LABELS = {
    '24hr-membership': '24hr Gym Membership',
    'personal-training': 'Personal Training',
    'massage-therapy': 'Massage Therapy',
    'self-defence': 'Self Defence Classes',
    'consultation': 'Free Consultation'
};

app.post('/api/contact', async (req, res) => {
    const body = req.body || {};

    // Honeypot: real users never fill the hidden "company" field. If it's set,
    // quietly accept so bots think they succeeded, but send nothing.
    if (body.company) {
        return res.json({ ok: true });
    }

    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const phone = String(body.phone || '').trim();
    const program = String(body.program || '').trim();
    const goals = String(body.goals || '').trim();
    const availability = String(body.availability || '').trim();

    if (!name || !email) {
        return res.status(400).json({ ok: false, error: 'Name and email are required.' });
    }
    if (!EMAIL_RE.test(email) || email.length > 254) {
        return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
    }
    if (name.length > 100) {
        return res.status(400).json({ ok: false, error: 'Name is too long.' });
    }

    const ip = req.ip || 'unknown';
    if (isRateLimited(ip)) {
        return res.status(429).json({ ok: false, error: 'Too many messages. Please try again later.' });
    }

    if (!SES_FROM || !SES_TO) {
        console.error('Contact form misconfigured: SES_FROM and SES_TO must be set.');
        return res.status(500).json({ ok: false, error: 'The contact form is not configured. Please email us directly.' });
    }

    const serviceLabel = SERVICE_LABELS[program] || program || 'Not specified';
    const fields = [
        ['Name', name],
        ['Email', email],
        ['Phone', phone || 'Not provided'],
        ['Interested service', serviceLabel],
        ['Fitness goals', goals || 'Not provided'],
        ['Preferred training times', availability || 'Not provided']
    ];

    const textBody = fields.map(([label, value]) => `${label}: ${value}`).join('\n');
    const htmlBody = `
        <div style="font-family:Arial,sans-serif;font-size:15px;color:#111;line-height:1.6">
            <h2 style="color:#1873CC;margin:0 0 16px">New enquiry from the website</h2>
            <table style="border-collapse:collapse">
                ${fields.map(([label, value]) => `
                    <tr>
                        <td style="padding:6px 14px 6px 0;vertical-align:top;font-weight:bold;color:#555">${escapeHtml(label)}</td>
                        <td style="padding:6px 0;vertical-align:top">${escapeHtml(value).replace(/\n/g, '<br>')}</td>
                    </tr>`).join('')}
            </table>
        </div>`;

    try {
        await ses.send(new SendEmailCommand({
            Source: SES_FROM,
            Destination: { ToAddresses: [SES_TO] },
            ReplyToAddresses: [email],
            Message: {
                Subject: { Data: `New website enquiry from ${name}`, Charset: 'UTF-8' },
                Body: {
                    Text: { Data: textBody, Charset: 'UTF-8' },
                    Html: { Data: htmlBody, Charset: 'UTF-8' }
                }
            }
        }));
        return res.json({ ok: true });
    } catch (err) {
        console.error('SES send failed:', err);
        return res.status(502).json({ ok: false, error: 'Failed to send your message. Please try again or contact us directly.' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ ok: true, configured: Boolean(SES_FROM && SES_TO) });
});

// Static site — local-dev convenience only (nginx serves these in production).
// dotfiles: 'deny' keeps files like .env from being served if this ever runs
// as the front-facing server.
app.use(express.static(path.join(__dirname), { dotfiles: 'deny', extensions: ['html'] }));

app.listen(PORT, () => {
    console.log(`Divinity contact server listening on http://localhost:${PORT}`);
    console.log(`SES region: ${SES_REGION} | configured: ${Boolean(SES_FROM && SES_TO)}`);
});
