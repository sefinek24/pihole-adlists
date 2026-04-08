module.exports = {
	apps: [{
		name: 'blocklist',
		script: './www/index.js',

		// Logging configuration
		log_date_format: 'HH:mm:ss.SSS DD.MM.YYYY',
		merge_logs: true,
		log_file: '/home/sefinek/logs/www/blocklist.sefinek.net/combined.log',
		out_file: '/home/sefinek/logs/www/blocklist.sefinek.net/out.log',
		error_file: '/home/sefinek/logs/www/blocklist.sefinek.net/error.log',

		// Application restart policy settings
		wait_ready: true,
		autorestart: true,
		max_restarts: 10,
		min_uptime: 20000,
		restart_delay: 5000,
		exp_backoff_restart_delay: 3000,

		// Environment variables configuration
		env: {
			NODE_ENV: 'production',
		},
	}],
};