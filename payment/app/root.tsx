import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from 'react-router';
import type { LinksFunction } from 'react-router';
import './root.css';

export const links: LinksFunction = () => [
	{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
	{
		rel: 'preconnect',
		href: 'https://fonts.gstatic.com',
		crossOrigin: 'anonymous',
	},
	{
		rel: 'stylesheet',
		href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
	},
];

export function Layout({ children }: { children: React.ReactNode }): React.JSX.Element {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export function HydrateFallback(): React.JSX.Element {
	return (
		<div style={{ 
			display: 'flex', 
			justifyContent: 'center', 
			alignItems: 'center', 
			minHeight: '100vh',
			fontFamily: 'Inter, system-ui, sans-serif'
		}}>
			<p>Loading...</p>
		</div>
	);
}

export default function App(): React.JSX.Element {
	return <Outlet />;
}
