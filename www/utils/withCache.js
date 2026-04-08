const RedisClient = require('../services/redis.js');

const withCache = async (key, ttl, fetcher) => {
	try {
		const cached = await RedisClient.get(key);
		if (cached) return JSON.parse(cached);
	} catch {
		// ignore
	}

	const data = await fetcher();
	if (data != null) RedisClient.setEx(key, ttl, JSON.stringify(data)).catch(err => console.error('Cache set failed:', err.message));

	return data;
};

module.exports = withCache;
