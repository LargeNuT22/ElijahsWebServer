# Manual Push Guide - GitHub Upload Instructions

## Current Status

✅ **All changes are committed locally:**
- Commit 1: "Update website: modified pages, added team photos, removed unused images"
- Commit 2: "Add deployment instructions"
- Branch: `node-version`
- Repository: `git@github.com:LargeNuT22/ElijahsWebServer.git`

⚠️ **Network Issue:** Cannot connect to GitHub due to DNS resolution failure.

## Solution: Manual Push When Network is Available

### Option 1: Push via Terminal (When Network Works)

```bash
cd /Users/jacobrook/Desktop/ElijahsWebsite

# Check your commits are ready
git log --oneline -3

# Push to GitHub
git push origin node-version
```

### Option 2: Switch to HTTPS (If SSH Still Doesn't Work)

```bash
cd /Users/jacobrook/Desktop/ElijahsWebsite

# Change remote to HTTPS
git remote set-url origin https://github.com/LargeNuT22/ElijahsWebServer.git

# Verify the change
git remote -v

# Push (will prompt for GitHub credentials)
git push origin node-version
```

**Note:** For HTTPS, you'll need:
- GitHub username: `LargeNuT22`
- Personal Access Token (not password) - create one at: https://github.com/settings/tokens

### Option 3: Use GitHub Desktop App

1. Download GitHub Desktop: https://desktop.github.com/
2. Add the repository: File → Add Local Repository
3. Select: `/Users/jacobrook/Desktop/ElijahsWebsite`
4. Click "Publish branch" or "Push origin"

### Option 4: Check Network/DNS Settings

If you continue having network issues:

```bash
# Test DNS resolution
nslookup github.com

# Test connectivity
ping github.com

# Check if you're behind a proxy/firewall
echo $http_proxy
echo $https_proxy
```

## Verify Your Push Was Successful

After pushing, verify on GitHub:

1. Go to: https://github.com/LargeNuT22/ElijahsWebServer
2. Switch to the `node-version` branch (dropdown in top left)
3. You should see:
   - Latest commit: "Add deployment instructions"
   - Previous commit: "Update website: modified pages, added team photos, removed unused images"
   - All your HTML files (index.html, about.html, contact.html, programs.html)
   - styles.css and script.js
   - gym-photos/ folder with TeamPhotos/ subfolder

## What Should Be in GitHub

Your repository should contain:

```
ElijahsWebServer/
├── index.html
├── about.html
├── contact.html
├── programs.html
├── styles.css
├── script.js
├── DEPLOYMENT_INSTRUCTIONS.md
├── gym-photos/
│   ├── TeamPhotos/
│   │   ├── ElijahProfilePic.PNG
│   │   ├── IanProfilePic.png
│   │   └── TeresaProfilePic.png
│   ├── Primary/
│   │   └── IMG_0376.jpg
│   └── [other gym photos]
└── [other files]
```

## If Repository Appears Empty

If you see an empty repository on GitHub:

1. **Check the branch:** Make sure you're viewing the `node-version` branch, not `main`
2. **Verify remote:** 
   ```bash
   git remote -v
   ```
   Should show: `git@github.com:LargeNuT22/ElijahsWebServer.git`
3. **Check commits:**
   ```bash
   git log --oneline --all
   ```
4. **Force push (if needed):**
   ```bash
   git push -u origin node-version
   ```

## Troubleshooting Network Issues

### Fix DNS Resolution

```bash
# Flush DNS cache (macOS)
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Try again
ping github.com
```

### Check Firewall/Proxy

- If on a corporate network, you may need VPN or proxy settings
- Check System Preferences → Network for proxy settings
- Try using a different network (mobile hotspot, etc.)

### Alternative: Use GitHub Web Interface

If terminal push continues to fail:

1. Go to: https://github.com/LargeNuT22/ElijahsWebServer
2. Click "Upload files"
3. Drag and drop your files (but this won't preserve git history)

**Note:** This is not recommended as it loses commit history. Better to fix network and push properly.

## Quick Test Commands

```bash
# See what needs to be pushed
cd /Users/jacobrook/Desktop/ElijahsWebsite
git status

# See your local commits
git log --oneline -5

# See what's on remote
git fetch origin
git log origin/node-version --oneline -5

# Compare local vs remote
git log origin/node-version..HEAD --oneline
```

## Next Steps After Successful Push

Once your code is on GitHub, deploy to EC2:

```bash
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
cd /var/www/ElijahsWebServer
sudo git pull origin node-version
sudo systemctl restart nginx
```

See `DEPLOYMENT_INSTRUCTIONS.md` for complete deployment guide.

---

**Need Help?**
- Check GitHub status: https://www.githubstatus.com/
- Verify repository exists: https://github.com/LargeNuT22/ElijahsWebServer
- Check your SSH keys: `ssh -T git@github.com` (when network works)
