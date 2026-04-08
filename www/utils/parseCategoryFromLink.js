const types = {
	'0.0.0.0': 'hosts',
	'127.0.0.1': 'localhost',
};

// Memoization cache with LRU-like behavior (limit: 1000 entries)
const cache = new Map();
const MAX_CACHE_SIZE = 1000;

module.exports = url => {
	// Check cache first
	if (cache.has(url)) {
		return cache.get(url);
	}

	const segments = url.split('/');
	const isVersioned = segments[2] === 'v1';
	const rawType = segments[isVersioned ? 3 : 2] || '';

	const result = {
		url,
		array: segments,
		type: types[rawType] || rawType,
	};

	// Add to cache with LRU eviction
	if (cache.size >= MAX_CACHE_SIZE) {
		const firstKey = cache.keys().next().value;
		cache.delete(firstKey);
	}
	cache.set(url, result);

	return result;
};