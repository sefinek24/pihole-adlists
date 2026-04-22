const RedisClient = require('../services/redis.js');

const inflight = new Map();

const withCache = async (key, ttl, fetcher) => {
	try {
		const cached = await RedisClient.get(key);
		if (cached) return JSON.parse(cached);
	} catch {
		// ...
	}

	if (inflight.has(key)) return inflight.get(key);

	const pending = (async () => {
		const data = await fetcher();
		if (data != null) {
			RedisClient.setEx(key, ttl, JSON.stringify(data))
				.catch(err => console.error('Cache set failed:', err.message));
		}

		return data;
	})();

	inflight.set(key, pending);

	try {
		return await pending;
	} finally {
		if (inflight.get(key) === pending) inflight.delete(key);
	}
};

module.exports = withCache;
