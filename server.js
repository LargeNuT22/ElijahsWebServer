const express = require('express');
const path = require('path');

const app = express();
const PORT = 80;
const HOST = '0.0.0.0';

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname)));

// Route for home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route for about page
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

// Route for programs page
app.get('/programs', (req, res) => {
    res.sendFile(path.join(__dirname, 'programs.html'));
});

// Route for contact page
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

// Handle .html extensions as well
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/about.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/programs.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'programs.html'));
});

app.get('/contact.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>404 - Page Not Found</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
                h1 { color: #333; }
                a { color: #007bff; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <h1>404 - Page Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
            <a href="/">Return to Home</a>
        </body>
        </html>
    `);
});

// Start the server
app.listen(PORT, HOST, () => {
    console.log(`🚀 Elijah's Website is running!`);
    console.log(`📍 Server: http://${HOST}:${PORT}`);
    console.log(`🏠 Home: http://${HOST}:${PORT}/`);
    console.log(`👤 About: http://${HOST}:${PORT}/about`);
    console.log(`💪 Programs: http://${HOST}:${PORT}/programs`);
    console.log(`📞 Contact: http://${HOST}:${PORT}/contact`);
    console.log(`\n⚠️  Note: Running on port 80 requires administrator privileges`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully');
    process.exit(0);
});
