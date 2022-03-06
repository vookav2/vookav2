module.exports = {
	apps: [
		{
			name: 'vookav2',
			script: './build/index.js',
			cwd: '~/app/vookav2/',
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
