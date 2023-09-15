import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
	plugins: [react()],
	base: '/odinbook-ts/',
	resolve: {
		alias: {
			'@components': '/src/components',
			'@context': '/src/context',
			'@pages': '/src/pages',
			'@styles': '/src/styles',
			'@databaseTypes': '/src/types/database',
			'@socketTypes': '/src/types/socket',
			'@utilities': '/src/utilities',
			'@src': '/src'
		}
	}
})

// Vite version 4.4.9 will not run app with node 20.6
// Using "node": ">=20.0.0 <=20.5.0" for now - see package.json
