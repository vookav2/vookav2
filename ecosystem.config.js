module.exports = {
	apps: [
		{
			name: 'vookav2',
			script: './src/index.ts',
			cwd: '/var/app/vookav2/',
			interpreter: 'ts-node',
			max_memory_restart: '700M',
			source_map_support: false,
			autorestart: true,
			interpreter_args: '--project tsconfig.prod.json',
			env_production: {
				NODE_ENV: 'production',
			},
			env_development: {
				NODE_ENV: 'development',
			},
		},
	],
}
