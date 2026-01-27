# Update Your Existing Website on EC2

Since you've already cloned the repository, use these commands to update it:

## Quick Update Commands

```bash
# SSH into your EC2 instance
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip

# Navigate to your existing website directory
cd /var/www/ElijahsWebServer

# Pull the latest changes from GitHub
sudo git pull origin node-version

# If you get any merge conflicts or permission issues:
sudo git reset --hard HEAD
sudo git pull origin node-version

# Set proper permissions
sudo chown -R www-data:www-data /var/www/ElijahsWebServer/
sudo chmod -R 755 /var/www/ElijahsWebServer/

# Restart Nginx to ensure changes take effect
sudo systemctl restart nginx
```

## Verify Your Update

```bash
# Check what files were updated
git log --oneline -5

# Check if EmailJS files are present
ls -la *.html *.js
```

## What Got Updated

Your latest push included:
- ✅ **EmailJS integration** in `script.js`
- ✅ **Updated contact form** in `contact.html`  
- ✅ **New images and assets**
- ✅ **Improved form validation and styling**

## If You Need to Check Which Branch You're On

```bash
# See current branch
git branch

# Switch to node-version if needed
sudo git checkout node-version
```

## Test Your Website

After running the update commands:
1. Visit `http://your-ec2-public-ip`
2. Test the contact form to make sure EmailJS is working
3. Check that all images and styling load correctly

## Quick Troubleshooting

**If website doesn't update:**
```bash
# Force refresh by clearing any cached files
sudo systemctl reload nginx

# Check Nginx is running
sudo systemctl status nginx
```

**If contact form doesn't work:**
- Make sure EmailJS credentials are correct in the code
- Check browser console for any JavaScript errors
- Verify your domain is allowed in EmailJS dashboard

---
*Your website should now have the latest EmailJS integration!*
