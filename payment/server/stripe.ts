import Stripe from 'stripe';

if (typeof process.env.STRIPE_SECRET_KEY !== 'string' || process.env.STRIPE_SECRET_KEY === '') {
	throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
	apiVersion: '2025-09-30.clover',
	typescript: true,
});

export interface ProductDetails {
	id: string;
	name: string;
	description: string | null;
	images: string[];
	defaultPriceId: string | null;
	price: {
		id: string;
		unitAmount: number | null;
		currency: string;
	} | null;
}

async function fetchPriceInfo(defaultPrice: string | Stripe.Price | null | undefined): Promise<ProductDetails['price']> {
	if (defaultPrice == null) return null;
	
	const price = typeof defaultPrice === 'string'
		? await stripe.prices.retrieve(defaultPrice)
		: defaultPrice;

	return {
		id: price.id,
		unitAmount: price.unit_amount,
		currency: price.currency,
	};
}

function parseSortValue(sortMetadata: string | undefined): number {
	if (sortMetadata == null) return Infinity;
	const parsed = parseInt(sortMetadata, 10);
	return isNaN(parsed) ? Infinity : parsed;
}

/**
 * Fetch all public products from Stripe (those with metadata public_visible="true")
 */
export async function getPublicProducts(): Promise<ProductDetails[]> {
	try {
		// Fetch all active products
		const products = await stripe.products.list({
			active: true,
			expand: ['data.default_price'],
		});

		// Filter products with public_visible="true" metadata
		const publicProducts = products.data.filter(
			product => product.metadata.public_visible === 'true'
		);

		// Map to ProductDetails format with sort metadata
		const productDetailsWithSort = await Promise.all(
			publicProducts.map(async (product) => {
				const priceInfo = await fetchPriceInfo(product.default_price);
				const sortValue = parseSortValue(product.metadata.sort);

				return {
					details: {
						id: product.id,
						name: product.name,
						description: product.description,
						images: product.images,
						defaultPriceId: typeof product.default_price === 'string' 
							? product.default_price 
							: product.default_price?.id ?? null,
						price: priceInfo,
					},
					sortValue,
				};
			})
		);

		// Sort by the sort metadata field (lowest first), then by name as fallback
		return productDetailsWithSort
		.sort((a, b) => {
			if (a.sortValue !== b.sortValue) {
				return a.sortValue - b.sortValue;
			}
			return a.details.name.localeCompare(b.details.name);
		})
		.map(item => item.details);
	} catch (error) {
		console.error('Error fetching public products from Stripe:', error);
		throw error;
	}
}

/**
 * Fetch product details from Stripe
 */
export async function getProductDetails(productId: string): Promise<ProductDetails> {
	try {
		const product = await stripe.products.retrieve(productId);
		
		let priceInfo: ProductDetails['price'] = null;
		
		// If product has a default price, fetch it
		if (typeof product.default_price === 'string') {
			const price = await stripe.prices.retrieve(product.default_price);
			priceInfo = {
				id: price.id,
				unitAmount: price.unit_amount,
				currency: price.currency,
			};
		}

		return {
			id: product.id,
			name: product.name,
			description: product.description,
			images: product.images,
			defaultPriceId: typeof product.default_price === 'string' ? product.default_price : null,
			price: priceInfo,
		};
	} catch (error) {
		console.error('Error fetching product from Stripe:', error);
		throw error;
	}
}

/**
 * Create a Stripe Checkout Session
 */
export async function createCheckoutSession(
	priceId: string,
	productId: string,
	successUrl: string
): Promise<Stripe.Checkout.Session> {
	try {
		const session = await stripe.checkout.sessions.create({
			line_items: [
				{
					price: priceId,
					quantity: 1,
				},
			],
			mode: 'payment',
			ui_mode: 'custom',
			return_url: successUrl,
			// Enable multiple payment methods:
			// - 'card' enables Apple Pay and Google Pay
			// - 'link' + 'card' enables Link (fast checkout for returning customers)
			// - 'afterpay_clearpay' enables Afterpay/Clearpay buy now pay later
			payment_method_types: ['card', 'link', 'afterpay_clearpay'],
			automatic_tax: {
				enabled: false,
			},
			metadata: {
				productId,
			},
		});

		return session;
	} catch (error) {
		console.error('Error creating Stripe checkout session:', error);
		throw error;
	}
}

export default stripe;
