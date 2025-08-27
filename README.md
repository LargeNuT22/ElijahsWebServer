# Elijah Rook Personal Training Website

A professional personal training website built with Express.js, showcasing Apex Training services.

## Features

- **Home Page**: Hero section with trainer introduction and key features
- **About Page**: Detailed trainer background, credentials, and philosophy
- **Programs Page**: Comprehensive training programs and packages
- **Contact Page**: Contact form and business information
- **Responsive Design**: Mobile-friendly interface
- **Express Server**: Professional web server setup

## Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. Navigate to the project directory:
```bash
cd /Users/jacobrook/Desktop/ElijahsWebsite
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The website will be available at:
- **http://0.0.0.0:80** (main address)
- **http://localhost:80** (local access)

### Development Mode

For development with auto-restart on file changes:
```bash
npm run dev
```

## Server Configuration

- **Host**: 0.0.0.0 (accessible from any network interface)
- **Port**: 80 (standard HTTP port)
- **Static Files**: Served from the root directory
- **Routes**: Clean URLs (e.g., `/about` instead of `/about.html`)

## Important Notes

⚠️ **Administrator Privileges Required**: Running on port 80 requires administrator/root privileges.

**On macOS/Linux:**
```bash
sudo npm start
```

**On Windows (as Administrator):**
```cmd
npm start
```

## Available Routes

- `/` or `/index.html` - Home page
- `/about` or `/about.html` - About Elijah
- `/programs` or `/programs.html` - Training programs
- `/contact` or `/contact.html` - Contact information

## File Structure

```
ElijahsWebsite/
├── server.js          # Express server configuration
├── package.json       # Node.js dependencies and scripts
├── index.html         # Home page
├── about.html         # About page
├── programs.html      # Programs page
├── contact.html       # Contact page
├── styles.css         # CSS styling
├── script.js          # JavaScript functionality
├── Logo/              # Logo assets
└── Profile picture/   # Profile images
```

## Production Deployment

For production deployment, consider:

1. **Process Manager**: Use PM2 for process management
```bash
npm install -g pm2
pm2 start server.js --name "elijah-website"
```

2. **Reverse Proxy**: Use Nginx as a reverse proxy
3. **SSL Certificate**: Add HTTPS support
4. **Environment Variables**: Configure for different environments

## Support

For technical support or questions about the website, contact:
- **Email**: elijah@apextraining.com
- **Phone**: (555) 123-4567

---

© 2024 Apex Training - Elijah Rook. All rights reserved.