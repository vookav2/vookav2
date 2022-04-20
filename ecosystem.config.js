module.exports = {
	apps: [
		{
			name: 'pm2-ecosystem-example',
			script: './build/index.js',
			// max_memory_restart: '700M',
			source_map_support: true,
			autorestart: true,
			env_production: {
				NODE_ENV: 'production',
			},
			env_development: {
				NODE_ENV: 'development',
			},
		},
	],
}
