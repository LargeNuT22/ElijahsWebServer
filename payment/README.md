# Divinity Fitness - NFC Payment Portal

A React Router v7 web application for handling NFC-triggered payments for Divinity Fitness gym's self-service mini fridge using Stripe Express Checkout Element.

## Overview

This application provides a seamless payment experience for gym members purchasing drinks from a self-service mini fridge. Customers simply scan an NFC tag on their desired drink, which directs them to a payment page where they can complete their purchase using Apple Pay, Google Pay, or other convenient payment methods.

## Features

- 🏃 **React Router v7** - Modern routing with file-based routing
- 💳 **Stripe Express Checkout** - One-click payments with Apple Pay, Google Pay, Link, PayPal, and more
- 📱 **Mobile-First** - Optimized for mobile devices
- 🎨 **Modern UI** - Clean, professional design with smooth animations
- ⚡ **Fast** - TypeScript, optimized builds, and efficient code
- 🔒 **Secure** - PCI-compliant payment processing through Stripe

## Product Tiers

The system supports three tiers of drinks:
- **Regular** - Standard refreshing beverages
- **Enhanced** - Premium drinks with added benefits  
- **Premium** - Top-tier specialty beverages

Each drink has its own NFC tag that links to its specific product page.

## Prerequisites

- Node.js 18+ (recommended: latest LTS)
- pnpm (install with `npm install -g pnpm`)
- A Stripe account ([sign up here](https://dashboard.stripe.com/register))
- HTTPS connection (required for payment methods like Apple Pay/Google Pay)
  - In development: Use [ngrok](https://ngrok.com/) or similar

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp env.example .env
```

Edit `.env` and add your Stripe keys (get them from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)):

```env
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
PORT=3000
NODE_ENV=development
APP_URL=https://your-ngrok-url.ngrok.io
```

### 3. Create Products in Stripe

1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/products)
2. Create products for each drink tier (Regular, Enhanced, Premium)
3. Add prices to each product
4. Note the Product IDs - these will be encoded in your NFC tags

### 4. Register Your Domain

For Apple Pay and Google Pay to work, you must [register your domain](https://docs.stripe.com/payments/payment-methods/pmd-registration) with Stripe in both test and live mode.

### 5. Set Up NFC Tags

Each NFC tag should be programmed with a URL in the format:
```
https://payments.divinity.fitness/<STRIPE_PRODUCT_ID>
```

Replace `<STRIPE_PRODUCT_ID>` with the actual Product ID from Stripe.

## Development

Start both the Express server and React development server concurrently:

```bash
pnpm dev
```

This will start:
- API server on `http://localhost:3000`
- React app on `http://localhost:5173` (or next available port)

### Development with HTTPS (Recommended)

For testing Apple Pay and Google Pay, you need HTTPS:

1. Install [ngrok](https://ngrok.com/):
   ```bash
   npm install -g ngrok
   ```

2. In one terminal, start the dev servers:
   ```bash
   pnpm dev
   ```

3. In another terminal, create an HTTPS tunnel:
   ```bash
   ngrok http 5173
   ```

4. Update `APP_URL` in `.env` with your ngrok URL

5. [Register the ngrok domain](https://docs.stripe.com/payments/payment-methods/pmd-registration) with Stripe

## Production Build

Build the application:

```bash
pnpm build
```

This creates:
- Client build in `.react-router/` (served by React Router)
- Server build in `dist/server/`

Start the production server:

```bash
pnpm start
```

## Project Structure

```
├── app/                    # React Router v7 application
│   ├── routes/            # Route components
│   │   ├── home.tsx       # Welcome page
│   │   ├── checkout.tsx   # Payment page (/:productId)
│   │   └── success.tsx    # Success page
│   ├── components/        # Reusable components
│   │   └── CheckoutForm.tsx
│   ├── root.tsx           # Root component
│   └── routes.ts          # Route configuration
├── server/                # Express API server
│   ├── index.ts           # Main server file
│   └── stripe.ts          # Stripe integration
├── public/                # Static assets
└── package.json
```

## API Endpoints

### `GET /api/health`
Health check endpoint

**Response:**
```json
{
  "status": "ok"
}
```

### `GET /api/product/:productId`
Fetch product details from Stripe

**Response:**
```json
{
  "id": "prod_...",
  "name": "Enhanced Energy Drink",
  "description": "Premium energy drink with vitamins",
  "images": ["https://..."],
  "defaultPriceId": "price_...",
  "price": {
    "id": "price_...",
    "unitAmount": 500,
    "currency": "usd"
  }
}
```

### `POST /api/create-checkout-session`
Create a Stripe Checkout Session

**Request Body:**
```json
{
  "priceId": "price_...",
  "productId": "prod_..."
}
```

**Response:**
```json
{
  "clientSecret": "cs_test_..."
}
```

## URL Structure

- `/` - Home page (welcome screen)
- `/:productId` - Checkout page for specific product
- `/success` - Payment success confirmation page

## Payment Flow

1. Customer scans NFC tag on drink
2. Phone opens browser to `/:productId` URL
3. App fetches product details from Stripe
4. App creates Checkout Session
5. Express Checkout Element displays available payment methods
6. Customer selects payment method (Apple Pay, Google Pay, etc.)
7. Payment is processed
8. Customer is redirected to `/success` page

## Testing

### Test Cards (when not using Apple Pay/Google Pay)

Stripe provides test card numbers:
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0027 6000 3184`

Use any future expiration date and any 3-digit CVC.

### Testing Apple Pay / Google Pay

In test mode, Stripe recognizes your test API keys and returns a test token when you use a real card in Apple Pay or Google Pay. This allows you to test without being charged.

## Troubleshooting

### Express Checkout Element not showing

- Ensure you're serving over HTTPS
- Check that your domain is registered with Stripe
- Verify your Stripe publishable key is correct
- Check browser console for errors

### Payment methods not available

- Apple Pay requires Safari on iOS/macOS with a saved card
- Google Pay requires Chrome with a saved card
- Ensure payment methods are enabled in your [Stripe Dashboard](https://dashboard.stripe.com/settings/payment_methods)

### CORS errors in development

The Express server includes CORS headers for development. If you still see CORS errors:
- Ensure both servers are running
- Check that API URLs in the client match your server port

## Deployment

### Environment Variables

Make sure to set these in production:
- `STRIPE_SECRET_KEY` - Your live Stripe secret key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Your live Stripe publishable key
- `APP_URL` - Your production domain (e.g., `https://payments.divinity.fitness`)
- `NODE_ENV=production`

### Domain Registration

Don't forget to [register your production domain](https://docs.stripe.com/payments/payment-methods/pmd-registration) with Stripe in live mode.

## Tech Stack

- **React** 19 - UI library
- **React Router** v7 - Routing
- **TypeScript** - Type safety
- **Express** - API server
- **Stripe** - Payment processing
- **Vite** - Build tool

## License

ISC

## Support

For issues or questions, contact the gym staff or open an issue on the repository.
