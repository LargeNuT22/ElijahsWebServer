import { useState, useEffect, useRef } from 'react';
import { useCheckout, ExpressCheckoutElement } from '@stripe/react-stripe-js/checkout';
import styles from './CheckoutForm.module.css';

const formatAmount = (amount: number, curr: string): string =>
	new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: curr.toUpperCase(),
	}).format(amount / 100);

const LoadingState = ({ text }: { text: string }): React.JSX.Element => (
	<div className={styles.loading}>
		<div className={styles.spinner}></div>
		<p className={styles.loadingText}>{text}</p>
	</div>
);

interface CheckoutContentProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Checkout type not exported from Stripe SDK
	checkout: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Event type not exported from Stripe SDK
	onConfirm: (event: any) => Promise<void>;
	onReady: (event: { availablePaymentMethods?: Record<string, boolean> }) => void;
	visibility: 'hidden' | 'visible';
	errorMessage: string | null;
	loadingTimeout: boolean;
}

const Summary = ({ amount, currency }: { amount?: number; currency?: string }): React.JSX.Element | null => {
	if (amount == null || currency == null) return null;
	return (
		<div className={styles.summary}>
			<span className={styles.summaryLabel}>Total:</span>
			<span className={styles.summaryAmount}>{formatAmount(amount, currency)}</span>
		</div>
	);
};

const ErrorMessage = ({ message }: { message: string }): React.JSX.Element => (
	<div className={styles.error}>
		<p className={styles.errorText}>{message}</p>
	</div>
);

const StatusMessages = ({ 
	visibility, 
	loadingTimeout, 
	errorMessage 
}: { 
	visibility: 'hidden' | 'visible'; 
	loadingTimeout: boolean; 
	errorMessage: string | null; 
}): React.JSX.Element | null => {
	const showLoading = visibility === 'hidden' && !loadingTimeout;
	const timeoutMessage = 'Unable to load payment methods. Please try refreshing the page or contact support if the issue persists.';
	
	return (
		<>
			{showLoading && <LoadingState text="Loading payment methods..." />}
			{loadingTimeout && <ErrorMessage message={timeoutMessage} />}
			{errorMessage !== null && <ErrorMessage message={errorMessage} />}
		</>
	);
};

const CheckoutContent = ({ checkout, onConfirm, onReady, visibility, errorMessage, loadingTimeout }: CheckoutContentProps): React.JSX.Element => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Event type not exported from Stripe SDK
	const handleLoadError = (event: any): void => {
		console.error('[Express Checkout] Load error:', event);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Accessing untyped error event
		if (event?.error?.message != null) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Accessing untyped error event
			console.error('[Express Checkout] Error message:', event.error.message);
		}
	};

	return (
		<div className={styles.container}>
			{/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Accessing untyped Stripe checkout object */}
			<Summary amount={checkout.total?.total?.minorUnitsAmount} currency={checkout.currency} />

			<div className={styles.expressCheckout} style={{ visibility }}>
				<ExpressCheckoutElement 
					onConfirm={onConfirm} 
					onReady={onReady}
					onLoadError={handleLoadError}
					options={{
						// Show Google Pay and Apple Pay buttons even without saved cards
						// This ensures maximum visibility for gym customers using NFC tags
						paymentMethods: {
							googlePay: 'always',
							applePay: 'always',
						},
						layout: {
							overflow: 'never'
						}
					}}
				/>
			</div>

			<StatusMessages visibility={visibility} loadingTimeout={loadingTimeout} errorMessage={errorMessage} />

			<div className={styles.info}>
				<p className={styles.infoText}>Secure payment powered by Stripe</p>
			</div>
		</div>
	);
};

export default function CheckoutForm(): React.JSX.Element {
	const checkoutState = useCheckout();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [visibility, setVisibility] = useState<'hidden' | 'visible'>('hidden');
	const [loadingTimeout, setLoadingTimeout] = useState(false);
	const timeoutRef = useRef<number | null>(null);
	const readyFiredRef = useRef(false);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Event type not exported from Stripe SDK
	const handleConfirm = async (event: any): Promise<void> => {
		if (checkoutState.type !== 'success') return;
		try {
			// Pass the Express Checkout event to confirm - required for Checkout Sessions
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Event type not exported from Stripe SDK
			await checkoutState.checkout.confirm({ expressCheckoutConfirmEvent: event });
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : 'Payment failed');
		}
	};

	const handleReady = (event: { availablePaymentMethods?: Record<string, boolean> }): void => {
		// Mark that ready event has fired
		readyFiredRef.current = true;
		
		// Clear timeout since ready event fired successfully
		if (timeoutRef.current !== null) {
			window.clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}

		// Enhanced logging for debugging
		console.log('[Express Checkout] Ready event fired');
		console.log('[Express Checkout] Available payment methods:', event.availablePaymentMethods);
		console.log('[Express Checkout] Browser:', navigator.userAgent);
		console.log('[Express Checkout] HTTPS:', window.location.protocol === 'https:');
		console.log('[Express Checkout] Domain:', window.location.hostname);

		const hasPaymentMethods = event.availablePaymentMethods != null && 
			Object.values(event.availablePaymentMethods).some(method => method);
		
		if (hasPaymentMethods) {
			console.log('[Express Checkout] Payment methods available - showing element');
			setVisibility('visible');
		} else {
			// No payment methods available, but ready event fired
			console.warn('[Express Checkout] No payment methods available');
			console.warn('[Express Checkout] Possible causes:');
			console.warn('  - Not using HTTPS');
			console.warn('  - Domain not registered with Stripe');
			console.warn('  - No saved payment methods in browser');
			console.warn('  - Browser/region restrictions');
			setLoadingTimeout(true);
		}
	};

	// Set up timeout when checkout becomes available
	useEffect(() => {
		if (checkoutState.type === 'success' && !readyFiredRef.current) {
			// Log checkout session details
			console.log('[Express Checkout] Checkout session initialized');
			console.log('[Express Checkout] Currency:', checkoutState.checkout.currency);

			// Set a timeout to handle cases where ready event never fires
			timeoutRef.current = window.setTimeout(() => {
				if (!readyFiredRef.current) {
					console.error('[Express Checkout] Timeout: ready event never fired after 10 seconds');
					console.error('[Express Checkout] This usually means:');
					console.error('  1. HTTPS is not being used (required for wallet payments)');
					console.error('  2. Domain is not registered with Stripe');
					console.error('  3. Browser console has Stripe errors (check above)');
					console.error('  4. CSP is blocking Stripe resources');
					setLoadingTimeout(true);
				}
			}, 10000); // 10 second timeout
		}

		// Cleanup timeout on unmount or when effect re-runs
		return () => {
			if (timeoutRef.current !== null) {
				window.clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
		};
	}, [checkoutState.type]);

	if (checkoutState.type === 'loading') return <LoadingState text="Preparing checkout..." />;
	if (checkoutState.type === 'error') {
		return (
			<div className={styles.error}>
				<p className={styles.errorText}>Error loading checkout: {checkoutState.error.message}</p>
			</div>
		);
	}

	return (
		<CheckoutContent
			checkout={checkoutState.checkout}
			onConfirm={handleConfirm}
			onReady={handleReady}
			visibility={visibility}
			errorMessage={errorMessage}
			loadingTimeout={loadingTimeout}
		/>
	);
}
