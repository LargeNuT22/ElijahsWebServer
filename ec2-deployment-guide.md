# EC2 Deployment Guide - Divinity Health & Fitness Website

## Prerequisites
- EC2 instance running (Ubuntu/Amazon Linux recommended)
- SSH access to your EC2 instance
- Your EC2 instance's public IP or domain name

## Step 1: Connect to Your EC2 Instance

```bash
# Replace with your key file and EC2 instance details
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip

# Or if using Amazon Linux:
ssh -i "your-key.pem" ec2-user@your-ec2-public-ip
```

## Step 2: Install Required Software

### For Ubuntu:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Git
sudo apt install git -y

# Install Nginx (web server)
sudo apt install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install Node.js (optional, for future enhancements)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y
```

### For Amazon Linux:
```bash
# Update system
sudo yum update -y

# Install Git
sudo yum install git -y

# Install Nginx
sudo yum install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install Node.js (optional)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
```

## Step 3: Clone Your Website

```bash
# Navigate to web directory
cd /var/www/

# Clone your repository
sudo git clone https://github.com/LargeNuT22/ElijahsWebServer.git

# Switch to the correct branch
cd ElijahsWebServer
sudo git checkout node-version

# Set proper permissions
sudo chown -R www-data:www-data /var/www/ElijahsWebServer/
sudo chmod -R 755 /var/www/ElijahsWebServer/
```

## Step 4: Configure Nginx

Create a new Nginx configuration:

```bash
# Create new site configuration
sudo nano /etc/nginx/sites-available/divinity-fitness
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # Replace with your domain or EC2 IP
    
    root /var/www/ElijahsWebServer;
    index index.html;
    
    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    # Cache static assets
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
}
```

Enable the site:

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/divinity-fitness /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Step 5: Configure Firewall (if needed)

```bash
# Allow HTTP and HTTPS traffic
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## Step 6: Test Your Website

1. Open your browser
2. Go to `http://your-ec2-public-ip`
3. You should see your fitness website!

## Step 7: Set Up SSL (Recommended)

Install Let's Encrypt for free SSL:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## Step 8: Set Up Automatic Deployment (Optional)

Create a deployment script:

```bash
# Create deployment script
sudo nano /var/www/deploy.sh
```

Add this content:

```bash
#!/bin/bash

# Deployment script for Divinity Health & Fitness website
echo "Starting deployment..."

cd /var/www/ElijahsWebServer

# Pull latest changes
sudo git pull origin node-version

# Set permissions
sudo chown -R www-data:www-data /var/www/ElijahsWebServer/
sudo chmod -R 755 /var/www/ElijahsWebServer/

# Restart Nginx
sudo systemctl restart nginx

echo "Deployment complete!"
```

Make it executable:

```bash
sudo chmod +x /var/www/deploy.sh
```

### Set Up GitHub Webhook (Advanced)

To automatically deploy when you push to GitHub:

1. Install webhook listener:
```bash
sudo npm install -g webhook
```

2. Create webhook configuration:
```bash
sudo nano /var/www/hooks.json
```

3. Add webhook configuration:
```json
[
  {
    "id": "deploy-divinity-fitness",
    "execute-command": "/var/www/deploy.sh",
    "command-working-directory": "/var/www/ElijahsWebServer",
    "source": {
      "type": "github",
      "secret": "your-secret-here"
    }
  }
]
```

4. Start webhook service:
```bash
webhook -hooks /var/www/hooks.json -verbose
```

## Manual Deployment Process

To update your website manually:

```bash
# SSH into your EC2 instance
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip

# Run the deployment script
sudo /var/www/deploy.sh
```

## Troubleshooting

### Website not loading?
- Check Nginx status: `sudo systemctl status nginx`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Verify files exist: `ls -la /var/www/ElijahsWebServer/`

### Permission issues?
```bash
sudo chown -R www-data:www-data /var/www/ElijahsWebServer/
sudo chmod -R 755 /var/www/ElijahsWebServer/
```

### Git pull fails?
```bash
cd /var/www/ElijahsWebServer
sudo git reset --hard HEAD
sudo git pull origin node-version
```

### EmailJS not working?
- Verify your domain in EmailJS dashboard
- Update allowed origins in EmailJS settings
- Check browser console for errors

## Security Best Practices

1. **Keep system updated**: `sudo apt update && sudo apt upgrade`
2. **Use strong passwords**: For all accounts
3. **Enable firewall**: UFW or Security Groups
4. **Regular backups**: Snapshot your EC2 instance
5. **Monitor logs**: Check access and error logs regularly
6. **Use SSL**: Always use HTTPS in production

## Performance Optimization

1. **Enable gzip compression** (included in config)
2. **Set up CloudFlare** for CDN and DDoS protection  
3. **Optimize images** before uploading
4. **Monitor server resources** with htop/top
5. **Set up monitoring** with CloudWatch

---

Your website should now be live at: `http://your-ec2-public-ip`

*Delete this file after successful deployment*
