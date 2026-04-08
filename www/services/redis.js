const { createClient } = require('redis');

const { REDIS_HOST, REDIS_PASSWD } = process.env;
if (!REDIS_HOST) throw new Error('Missing REDIS_HOST environment variable');

const RedisClient = createClient({
	socket: {
		host: REDIS_HOST,
		port: 6379,
		connectTimeout: 20 * 1000,
		reconnectStrategy: times => Math.min(times * 5000, 15000),
	},
	database: 8,
	password: REDIS_PASSWD,
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