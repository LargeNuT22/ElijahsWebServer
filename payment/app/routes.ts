import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
	index('routes/home.tsx'),
	route('success', 'routes/success.tsx'),
	route(':productId', 'routes/checkout.tsx'),
] satisfies RouteConfig;
