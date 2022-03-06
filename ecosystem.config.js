module.exports = {
	apps: [
		{
			name: 'vookav2',
			script: './build/index.js',
			// max_memory_restart: '700M',
			source_map_support: false,
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
