import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [
		reactRouter({
			ssr: false,
		}),
	],
	resolve: {
		alias: {
			'~': path.resolve(__dirname, 'app'),
		},
	},
});
