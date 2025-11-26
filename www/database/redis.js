const { createClient } = require('redis');

const RedisClient = createClient({
	socket: {
		host: process.env.REDIS_HOST,
		port: 6379,
		connectTimeout: 20 * 1000,
		reconnectStrategy: times => Math.min(times * 5000, 15000),
	},
	database: 8,
	password: process.env.REDIS_PASSWD,
});

let error = false;

RedisClient.on('connect', () => {
	console.log('Connected to Redis successfully');
	error = false;
});

RedisClient.on('error', err => {
	if (!error) {
		console.error('Redis error:', err.message);
		error = true;
	}
});

(async () => RedisClient.connect())();

module.exports = RedisClient;