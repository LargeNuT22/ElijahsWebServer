import { useNavigate } from 'react-router';
import type { MetaFunction } from 'react-router';
import styles from './success.module.css';

export const meta: MetaFunction = () => [
	{ title: 'Payment Successful - Divinity Fitness' },
	{ name: 'description', content: 'Your payment was successful' },
];

export default function Success(): React.JSX.Element {
	const navigate = useNavigate();

	return (
		<div className={styles.container}>
			<div className={styles.content}>
				<div className={styles.successCard}>
					<div className={styles.iconContainer}>
						<div className={styles.checkmark}>
							<svg
								className={styles.checkmarkSvg}
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 52 52"
							>
								<circle
									className={styles.checkmarkCircle}
									cx="26"
									cy="26"
									r="25"
									fill="none"
								/>
								<path
									className={styles.checkmarkCheck}
									fill="none"
									d="M14.1 27.2l7.1 7.2 16.7-16.8"
								/>
							</svg>
						</div>
					</div>

					<h1 className={styles.title}>Payment Successful!</h1>
					<p className={styles.message}>
						Thank you for your purchase. Your payment has been processed successfully.
					</p>

					<div className={styles.details}>
						<p className={styles.detailText}>
							Enjoy your drink and have a great workout!
						</p>
					</div>

					<div className={styles.actions}>
						<button
							onClick={() => { void navigate('/'); }}
							className={styles.button}
						>
							Return to Home
						</button>
					</div>
				</div>

				<div className={styles.footer}>
					<p className={styles.footerText}>
						Receipt will be sent to your email address
					</p>
				</div>
			</div>
		</div>
	);
}
