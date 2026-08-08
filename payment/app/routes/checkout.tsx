import { useParams, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import type { MetaFunction } from 'react-router';
import { CheckoutProvider } from '@stripe/react-stripe-js/checkout';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '~/components/CheckoutForm';
import styles from './checkout.module.css';

interface ProductDetails {
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

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (typeof stripePublishableKey !== 'string' || stripePublishableKey === '') {
	throw new Error('VITE_STRIPE_PUBLISHABLE_KEY is not set');
}

const stripePromise = loadStripe(stripePublishableKey);

export const meta: MetaFunction = () => [
	{ title: 'Checkout - Divinity Fitness' },
	{ name: 'description', content: 'Complete your purchase' },
];

const formatPrice = (amount: number | null, currency: string): string => {
	if (amount === null) return 'Price not available';
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: currency.toUpperCase(),
	}).format(amount / 100);
};

const LoadingView = (): React.JSX.Element => (
	<div className={styles.container}>
		<div className={styles.loadingCard}>
			<div className={styles.spinner}></div>
			<p className={styles.loadingText}>Loading product details...</p>
		</div>
	</div>
);

const ErrorView = ({ message, onReturn }: { message: string; onReturn: () => void }): React.JSX.Element => (
	<div className={styles.container}>
		<div className={styles.errorCard}>
			<h2 className={styles.errorTitle}>Error</h2>
			<p className={styles.errorText}>{message}</p>
			<button onClick={onReturn} className={styles.button}>
				Return Home
			</button>
		</div>
	</div>
);

interface CheckoutViewProps {
	product: ProductDetails;
	clientSecret: Promise<string>;
	onCancel: () => void;
}

const CheckoutView = ({ product, clientSecret, onCancel }: CheckoutViewProps): React.JSX.Element => (
	<div className={styles.container}>
		<div className={styles.content}>
			<div className={styles.header}>
				<h1 className={styles.title}>Divinity Fitness</h1>
				<p className={styles.subtitle}>Quick Checkout</p>
			</div>

			<div className={styles.productCard}>
				{product.images.length > 0 && (
					<img
						src={product.images[0]}
						alt={product.name}
						className={styles.productImage}
					/>
				)}
				<h2 className={styles.productName}>{product.name}</h2>
				{product.description !== null && product.description !== '' && (
					<p className={styles.productDescription}>{product.description}</p>
				)}
				{product.price !== null && (
					<p className={styles.productPrice}>
						{formatPrice(product.price.unitAmount, product.price.currency)}
					</p>
				)}
			</div>

			<div className={styles.checkoutCard}>
				<h3 className={styles.checkoutTitle}>Payment</h3>
				<CheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
					<CheckoutForm />
				</CheckoutProvider>
			</div>

			<div className={styles.footer}>
				<button onClick={onCancel} className={styles.cancelButton}>
					Cancel
				</button>
			</div>
		</div>
	</div>
);

export default function Checkout(): React.JSX.Element {
	const { productId } = useParams<{ productId: string }>();
	const navigate = useNavigate();
	const [product, setProduct] = useState<ProductDetails | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [clientSecret, setClientSecret] = useState<Promise<string> | null>(null);

	useEffect(() => {
		if (productId == null || productId === '') {
			setError('Product ID is required');
			setLoading(false);
			return;
		}

		const fetchProduct = async (): Promise<void> => {
			try {
				const response = await fetch(`/api/product/${productId}`);
				if (!response.ok) throw new Error('Failed to fetch product');

				const data: unknown = await response.json();
				// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- API response type is validated by server
				const product = data as ProductDetails;
				setProduct(product);

				if (product.defaultPriceId == null || product.defaultPriceId === '') {
					throw new Error('Product does not have a default price');
				}

				const secretPromise = fetch('/api/create-checkout-session', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						priceId: product.defaultPriceId,
						productId: product.id,
					}),
				}).then(async (res) => {
					if (!res.ok) throw new Error('Failed to create checkout session');
					const json: unknown = await res.json();
					// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- API response type is validated by server
					const result = json as { clientSecret: string };
					return result.clientSecret;
				});

				setClientSecret(secretPromise);
				setLoading(false);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'An error occurred');
				setLoading(false);
			}
		};

		void fetchProduct();
	}, [productId]);

	const handleReturn = (): void => { 
		void navigate('/');
	};

	if (loading) return <LoadingView />;
	if (error !== null || product === null) return <ErrorView message={error ?? 'Product not found'} onReturn={handleReturn} />;
	if (clientSecret === null) return <ErrorView message="Unable to initialize checkout" onReturn={handleReturn} />;

	return <CheckoutView product={product} clientSecret={clientSecret} onCancel={handleReturn} />;
}
