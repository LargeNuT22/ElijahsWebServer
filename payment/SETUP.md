# Quick Setup Guide

Follow these steps to get the application running:

## 1. Install Dependencies

```bash
pnpm install
```

This will install all necessary packages including:
- React Router v7
- Stripe JavaScript SDK
- Express
- TypeScript and build tools

## 2. Configure Environment

Create a `.env` file in the root directory:

```bash
cp env.example .env
```

Then edit `.env` and add your Stripe API keys from the [Stripe Dashboard](https://dashboard.stripe.com/apikeys):

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
PORT=3000
NODE_ENV=development
APP_URL=http://localhost:5173
```

## 3. Set Up Stripe Products

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Products** → **Add Product**
3. Create three products for each drink tier:
   - **Regular Drink** (e.g., $2.00)
   - **Enhanced Drink** (e.g., $3.50)
   - **Premium Drink** (e.g., $5.00)
4. For each product, add:
   - Name
   - Description
   - Image (optional)
   - Price
5. Note the Product IDs (e.g., `prod_...`) - you'll need these for the NFC tags

## 4. Start Development Servers

```bash
pnpm dev
```

This starts:
- Express API server on `http://localhost:3000`
- React development server on `http://localhost:5173`

The app will open automatically in your browser.

## 5. Test the Payment Flow

Visit `http://localhost:5173/prod_YOUR_PRODUCT_ID` (replace with your actual product ID from Stripe).

You should see:
1. Product details
2. Price
3. Express Checkout Element with payment buttons

**Note:** For Apple Pay and Google Pay to work:
- You need HTTPS (see HTTPS Setup below)
- You need to register your domain with Stripe
- You need a card saved in Apple Pay or Google Pay

## 6. HTTPS Setup (for Apple Pay/Google Pay)

Apple Pay and Google Pay require HTTPS. In development, use ngrok:

1. Install ngrok:
   ```bash
   npm install -g ngrok
   ```

2. Start your dev servers:
   ```bash
   pnpm dev
   ```

3. In another terminal, create HTTPS tunnel:
   ```bash
   ngrok http 5173
   ```

4. Update `.env`:
   ```env
   APP_URL=https://your-ngrok-url.ngrok.io
   ```

5. Register the ngrok domain in [Stripe Dashboard → Settings → Payment Methods → Domain Registration](https://dashboard.stripe.com/settings/payment_methods)

## 7. Program NFC Tags

Once you have your product IDs, program your NFC tags:

**URL Format:**
```
https://payments.divinity.fitness/PRODUCT_ID
```

Replace `payments.divinity.fitness` with your actual domain, and `PRODUCT_ID` with the Stripe Product ID.

**NFC Programming Tools:**
- iOS: NFC Tools app
- Android: NFC Tools app or TagWriter

## Testing Payments

### Test Mode
In test mode (using `sk_test_...` keys):
- Use test card: `4242 4242 4242 4242`
- Any future expiration date
- Any 3-digit CVC
- Any ZIP code

### Apple Pay / Google Pay Testing
In test mode, when you use a real card saved in Apple Pay or Google Pay, Stripe recognizes your test keys and creates a test payment token (you won't be charged).

## Troubleshooting

### "Cannot find module" errors
Run `pnpm install` to install all dependencies.

### Express Checkout Element not showing
- Ensure you're on HTTPS
- Check browser console for errors
- Verify your publishable key is correct
- Make sure payment methods are enabled in Stripe Dashboard

### Payment methods not available
- Apple Pay: Requires Safari with saved card
- Google Pay: Requires Chrome with saved card
- Domain must be registered with Stripe

### CORS errors
Make sure both servers are running (`pnpm dev`).

## Next Steps

After setup:
1. Test the payment flow with different products
2. Customize the styling if needed
3. Set up production environment
4. Deploy to your hosting provider
5. Switch to live Stripe keys
6. Program your NFC tags with production URLs

## Support

For issues:
1. Check the main [README.md](./README.md) for detailed documentation
2. Review Stripe's [Express Checkout Element docs](https://docs.stripe.com/elements/express-checkout-element)
3. Check the browser console for errors
4. Verify all environment variables are set correctly
