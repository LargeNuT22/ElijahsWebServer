import dotenv from 'dotenv';

// Load environment variables BEFORE importing other modules that use them
dotenv.config();

/* eslint-disable import/first -- Must import after dotenv.config() to ensure env vars are loaded */
import express from 'express';
import https from 'node:https';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCheckoutSession, getProductDetails, getPublicProducts } from './stripe.js';
/* eslint-enable import/first */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ?? 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for development
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	if (req.method === 'OPTIONS') {
		res.sendStatus(200);
		return;
	}
	next();
});

// Content Security Policy for Stripe integration
app.use((_req, res, next) => {
	const isDevelopment = process.env.NODE_ENV !== 'production';
	
	// Build CSP directives for Stripe and payment providers
	const cspDirectives = [
		"default-src 'self'",
		// Allow Stripe.js script, Stripe CDN, Google Pay SDK, and inline scripts for React hydration
		// In production, 'unsafe-inline' is needed for React Router hydration scripts
		`script-src 'self' 'unsafe-inline' https://js.stripe.com https://*.stripe.com https://b.stripecdn.com https://pay.google.com https://*.google.com https://www.gstatic.com https://*.gstatic.com${isDevelopment ? " 'unsafe-eval'" : ''}`,
		// Allow connections to Stripe APIs and payment providers (Google Pay, Apple Pay)
		"connect-src 'self' https://api.stripe.com https://m.stripe.com https://merchant-ui-api.stripe.com https://js.stripe.com https://*.stripe.com https://b.stripecdn.com https://pay.google.com https://*.google.com https://www.gstatic.com https://*.gstatic.com https://payments.google.com",
		// Allow Stripe iframes and payment provider iframes (Google Pay)
		"frame-src https://js.stripe.com https://hooks.stripe.com https://*.stripe.com https://pay.google.com https://*.google.com https://www.gstatic.com https://*.gstatic.com",
		"child-src https://js.stripe.com https://hooks.stripe.com https://*.stripe.com https://pay.google.com https://*.google.com https://www.gstatic.com https://*.gstatic.com",
		// Allow Stripe images, data URIs, and payment provider images (Google Pay icons)
		"img-src 'self' data: https://q.stripe.com https://*.stripe.com https://b.stripecdn.com https://pay.google.com https://*.google.com https://www.gstatic.com https://*.gstatic.com",
		// Allow inline styles (needed for React and styling)
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.gstatic.com",
		// Allow Google Fonts and Google Pay fonts
		"font-src 'self' https://fonts.gstatic.com https://*.gstatic.com",
	].join('; ');

	res.setHeader('Content-Security-Policy', cspDirectives);
	next();
});

// Health check
app.get('/api/health', (_req, res) => {
	res.json({ status: 'ok' });
});

// Get all public products
app.get('/api/products', async (_req, res) => {
	try {
		const products = await getPublicProducts();
		res.json(products);
	} catch (error) {
		console.error('Error fetching products:', error);
		res.status(500).json({
			error: 'Failed to fetch products',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

// Get product details
app.get('/api/product/:productId', async (req, res) => {
	try {
		const { productId } = req.params;
		const product = await getProductDetails(productId);
		res.json(product);
	} catch (error) {
		console.error('Error fetching product:', error);
		res.status(500).json({ 
			error: 'Failed to fetch product details',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

// Validate checkout request body
function validateCheckoutRequest(body: unknown): { priceId: string; productId: string } | { error: string } {
	if (typeof body !== 'object' || body === null) {
		return { error: 'Invalid request body' };
	}
	
	const bodyObj = body as { priceId?: unknown; productId?: unknown };
	
	if (typeof bodyObj.priceId !== 'string' || bodyObj.priceId === '') {
		return { error: 'priceId is required' };
	}
	if (typeof bodyObj.productId !== 'string') {
		return { error: 'productId is required' };
	}
	
	return { priceId: bodyObj.priceId, productId: bodyObj.productId };
}

// Create Stripe Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
	try {
		const validation = validateCheckoutRequest(req.body);
		
		if ('error' in validation) {
			res.status(400).json({ error: validation.error });
			return;
		}

		const appUrl = process.env.APP_URL ?? `http://localhost:${PORT}`;
		const session = await createCheckoutSession(
			validation.priceId,
			validation.productId,
			`${appUrl}/success`
		);

		res.json({ clientSecret: session.client_secret });
	} catch (error) {
		console.error('Error creating checkout session:', error);
		res.status(500).json({ 
			error: 'Failed to create checkout session',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
});

// Serve static files from the React app build directory
const clientBuildPath = path.resolve(__dirname, '../../build/client');
app.use(express.static(clientBuildPath));

// Handle React Router client-side routing - serve index.html for all non-API routes
// This middleware runs after all other routes and static file serving
app.use((_req, res) => {
	res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Start server
const isProduction = process.env.NODE_ENV === 'production';
// Allow explicit USE_HTTPS=false to disable HTTPS even in production (e.g., when using NGINX reverse proxy)
const useHttps = process.env.USE_HTTPS === 'false' ? false : (process.env.USE_HTTPS === 'true' || isProduction);

if (useHttps) {
	// SSL Certificate paths
	const certPath = process.env.SSL_CERT_PATH ?? '/etc/letsencrypt/live/payment.divinity.fitness/fullchain.pem';
	const keyPath = process.env.SSL_KEY_PATH ?? '/etc/letsencrypt/live/payment.divinity.fitness/privkey.pem';

	try {
		// Check if certificate files exist
		const credentials = {
			key: fs.readFileSync(keyPath, 'utf8'),
			cert: fs.readFileSync(certPath, 'utf8')
		};

		// HTTPS server (port 443 or custom HTTPS_PORT)
		const httpsPort = process.env.HTTPS_PORT ?? 443;
		const httpsServer = https.createServer(credentials, app);
		
		httpsServer.listen(httpsPort, () => {
			console.log(`🔒 HTTPS Server running on port ${httpsPort}`);
			console.log(`   Health check: https://payment.divinity.fitness/api/health`);
		});

		// HTTP server for redirecting to HTTPS (port 80 or custom HTTP_PORT)
		const httpPort = process.env.HTTP_PORT ?? 80;
		const httpApp = express();
		
		httpApp.use((req, res) => {
			const host = req.headers.host?.replace(/:\d+$/, '') ?? 'payment.divinity.fitness';
			res.redirect(301, `https://${host}${req.url}`);
		});

		const httpServer = http.createServer(httpApp);
		httpServer.listen(httpPort, () => {
			console.log(`🔓 HTTP Server running on port ${httpPort} (redirects to HTTPS)`);
		});
	} catch (error) {
		console.error('❌ Failed to load SSL certificates:', error);
		console.error('   Falling back to HTTP mode');
		
		// Fallback to HTTP
		app.listen(PORT, () => {
			console.log(`🚀 Server running on port ${PORT} (HTTP)`);
			console.log(`   Health check: http://localhost:${PORT}/api/health`);
		});
	}
} else {
	// Development mode - use HTTP
	app.listen(PORT, () => {
		console.log(`🚀 Server running on port ${PORT} (HTTP - Development)`);
		console.log(`   Health check: http://localhost:${PORT}/api/health`);
	});
}
