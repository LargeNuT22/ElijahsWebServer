# Deployment Instructions - Divinity Health & Fitness Website

## ✅ Changes Committed Locally

All your changes have been successfully committed to your local repository with the message:
**"Update website: modified pages, added team photos, removed unused images"**

The commit includes:
- Modified: `about.html`, `contact.html`, `index.html`, `programs.html`, `styles.css`
- Added: Team photos in `gym-photos/TeamPhotos/`
- Added: New primary image `gym-photos/Primary/IMG_0376.jpg`
- Removed: Unused image files

## 📤 Step 1: Push to GitHub

**Note:** There was a network connectivity issue during the automated push. Please push manually when your network connection is stable.

### Option A: Using SSH (if configured)
```bash
cd /Users/jacobrook/Desktop/ElijahsWebsite
git push origin node-version
```

### Option B: Using HTTPS
```bash
cd /Users/jacobrook/Desktop/ElijahsWebsite
git remote set-url origin https://github.com/LargeNuT22/ElijahsWebServer.git
git push origin node-version
```

If prompted for credentials:
- Username: Your GitHub username
- Password: Use a Personal Access Token (not your GitHub password)

## 🚀 Step 2: Deploy to EC2 Server

Once your changes are pushed to GitHub, follow these steps to deploy to your EC2 instance:

### Quick Update (If Already Deployed)

```bash
# 1. SSH into your EC2 instance
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip

# 2. Navigate to your website directory
cd /var/www/ElijahsWebServer

# 3. Pull the latest changes from GitHub
sudo git pull origin node-version

# 4. If you encounter any conflicts or permission issues:
sudo git reset --hard HEAD
sudo git pull origin node-version

# 5. Set proper permissions
sudo chown -R www-data:www-data /var/www/ElijahsWebServer/
sudo chmod -R 755 /var/www/ElijahsWebServer/

# 6. Restart Nginx to apply changes
sudo systemctl restart nginx
```

### First-Time Deployment

If this is your first time deploying, follow the complete guide in `ec2-deployment-guide.md`.

## ✅ Step 3: Verify Deployment

1. **Check Nginx Status:**
   ```bash
   sudo systemctl status nginx
   ```

2. **View Recent Changes:**
   ```bash
   cd /var/www/ElijahsWebServer
   git log --oneline -5
   ```

3. **Test Your Website:**
   - Visit `http://your-ec2-public-ip` in your browser
   - Check that all pages load correctly
   - Verify images are displaying (especially team photos)
   - Test the contact form functionality
   - Check mobile responsiveness

## 🔧 Troubleshooting

### If Website Doesn't Update:
```bash
# Force Nginx to reload configuration
sudo systemctl reload nginx

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### If Git Pull Fails:
```bash
# Reset to latest remote state
cd /var/www/ElijahsWebServer
sudo git fetch origin
sudo git reset --hard origin/node-version
sudo systemctl restart nginx
```

### If Images Don't Load:
```bash
# Verify file permissions
sudo chown -R www-data:www-data /var/www/ElijahsWebServer/
sudo chmod -R 755 /var/www/ElijahsWebServer/

# Check if files exist
ls -la gym-photos/TeamPhotos/
```

### If Contact Form Doesn't Work:
- Verify EmailJS credentials in `script.js`
- Check browser console for JavaScript errors
- Ensure your domain is allowed in EmailJS dashboard
- Verify network connectivity from the server

## 📋 Deployment Checklist

- [ ] Changes pushed to GitHub successfully
- [ ] SSH'd into EC2 instance
- [ ] Pulled latest changes from GitHub
- [ ] Set proper file permissions
- [ ] Restarted Nginx
- [ ] Verified website loads correctly
- [ ] Tested all pages (Home, About, Programs, Contact)
- [ ] Verified images display correctly
- [ ] Tested contact form submission
- [ ] Checked mobile responsiveness

## 🔐 Security Reminders

1. **Keep your EC2 instance updated:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Regular backups:** Consider taking EC2 snapshots before major updates

3. **Monitor logs:** Check access and error logs regularly
   ```bash
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log
   ```

## 📞 Need Help?

If you encounter any issues:
1. Check the detailed deployment guide: `ec2-deployment-guide.md`
2. Review update commands: `ec2-update-commands.md`
3. Check Nginx status and logs
4. Verify GitHub repository is accessible

---

**Your website repository:** `https://github.com/LargeNuT22/ElijahsWebServer.git`  
**Branch:** `node-version`  
**Last commit:** Update website: modified pages, added team photos, removed unused images
