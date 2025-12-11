# EmailJS Setup Guide for Divinity Health & Fitness

## Step 1: Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address

## Step 2: Add Email Service

1. In your EmailJS dashboard, click "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail recommended)
4. Follow the setup instructions for your provider
5. **Save your Service ID** (something like `service_abc123`)

## Step 3: Create Email Template

1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. Use this template content:

### Subject Line:
```
New Contact Form Submission - {{name}}
```

### Email Body:
```
New contact form submission from your fitness website:

Name: {{name}}
Email: {{email}}
Phone: {{phone}}
Interested Program: {{program}}

Fitness Goals:
{{goals}}

Preferred Training Times:
{{availability}}

Submitted: {{timestamp}}

You can reply directly to this email to respond to {{name}}.
```

4. **Save your Template ID** (something like `template_xyz789`)

## Step 4: Get Your Public Key

1. Go to "Account" in your EmailJS dashboard
2. Find your "Public Key" (something like `abc123xyz789`)

## Step 5: Update Your Website

Open `script.js` and replace these values in the `EMAILJS_CONFIG` object:

```javascript
const EMAILJS_CONFIG = {
    PUBLIC_KEY: 'your_actual_public_key_here',
    SERVICE_ID: 'your_actual_service_id_here',
    TEMPLATE_ID: 'your_actual_template_id_here'
};
```

## Step 6: Update Email Address

In `script.js`, line 87, change the email to your actual email:
```javascript
templateParams.to_email = 'your-actual-email@gmail.com';
```

Also update it in `contact.html` at line 103.

## Step 7: Test Your Form

1. Open your website
2. Fill out the contact form
3. Submit it
4. Check your email for the message

## Troubleshooting

### Common Issues:
- **"Email service not available"**: Make sure the EmailJS script is loading
- **"Failed to send message"**: Check your Service ID and Template ID
- **No email received**: Check spam folder, verify email service is active

### Free Tier Limits:
- 200 emails per month
- EmailJS branding in emails
- Basic support

### Need More?
Upgrade to paid plans starting at $20/month for:
- Unlimited emails
- Remove EmailJS branding
- Priority support

## Security Note
Your EmailJS credentials are client-side visible. This is normal for EmailJS, but consider:
- Using a dedicated email for this service
- Monitoring your usage in EmailJS dashboard
- Setting up email filters/rules for organization

---
*Delete this file after setup is complete*
