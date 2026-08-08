import type { MetaFunction } from 'react-router';
import { useLoaderData, Link } from 'react-router';
import styles from './home.module.css';

export const meta: MetaFunction = () => [
	{ title: 'Divinity Fitness - Payment Portal' },
	{ name: 'description', content: 'Quick payment portal for Divinity Fitness mini fridge' },
];

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

export async function clientLoader(): Promise<{ products: ProductDetails[] }> {
	const response = await fetch('/api/products');
	
	if (!response.ok) {
		throw new Error('Failed to fetch products');
	}
	
	const products = await response.json() as ProductDetails[];
	return { products };
}

function formatPrice(unitAmount: number | null, currency: string): string {
	if (unitAmount === null) return 'Price unavailable';
	
	const amount = unitAmount / 100; // Convert from cents
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: currency.toUpperCase(),
	}).format(amount);
}

export default function Home(): React.JSX.Element {
	const { products } = useLoaderData<typeof clientLoader>();

	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<div className={styles.header}>
					<h1 className={styles.title}>Divinity Fitness</h1>
					<p className={styles.subtitle}>Mini Fridge Payment Portal</p>
				</div>

				<div className={styles.card}>
					<h2 className={styles.cardTitle}>Welcome!</h2>
					<p className={styles.cardText}>
						To purchase a drink from our self-service mini fridge, simply scan the NFC tag
						on the drink you'd like to purchase, or select a product below.
					</p>
					<p className={styles.cardText}>
						Your phone will automatically open the payment page where you can complete
						your purchase using Apple Pay, Google Pay, or other convenient payment methods.
					</p>
				</div>

				{products.length > 0 && (
					<div className={styles.products}>
						<h3 className={styles.productsTitle}>Available Products</h3>
						<div className={styles.productsList}>
							{products.map((product) => (
								<Link
									key={product.id}
									to={`/${product.id}`}
									className={styles.productCard}
								>
									{product.images.length > 0 && (
										<img
											src={product.images[0]}
											alt={product.name}
											className={styles.productImage}
										/>
									)}
									<div className={styles.productInfo}>
										<h4 className={styles.productName}>{product.name}</h4>
										{product.description && (
											<p className={styles.productDescription}>{product.description}</p>
										)}
										{product.price && (
											<p className={styles.productPrice}>
												{formatPrice(product.price.unitAmount, product.price.currency)}
											</p>
										)}
									</div>
								</Link>
							))}
						</div>
					</div>
				)}

				<div className={styles.footer}>
					<p className={styles.footerText}>
						Questions? Contact gym staff for assistance.
					</p>
				</div>
			</div>
		</div>
	);
}
