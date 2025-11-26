const RedisClient = require('../../database/redis.js');
const parseCategoryFromLink = require('../../utils/parseCategoryFromLink.js');

const BOT_REGEX = /netcraftsurveyagent|domainsproject\.org|f(?:reepublicapis|acebook)|screaming frog|i(?:a_archiv|ndex)er|s(?:istrix|crapy|lurp)|scraper|(?:s(?:cann|pid)|fetch)er|lychee\/|crawl|yahoo|jest\/|bot/i;

const getMinuteKey = () => {
	const now = new Date();
	const date = now.toISOString().slice(0, 10); // YYYY-MM-DD
	const time = now.toISOString().slice(11, 16); // HH:mm
	return `stats:minute:${date}:${time}`;
};

const updateStats = async (req, res) => {
	if (req.method !== 'GET' || BOT_REGEX.test(req.headers['user-agent'])) return;

	try {
		const { type } = parseCategoryFromLink(req.originalUrl || req.url);
		const statusCode = res?.statusCode ?? 'unknown';
		const minuteKey = getMinuteKey();

		const pipeline = RedisClient.multi();

		// Increment total requests
		pipeline.hIncrBy(minuteKey, 'total', 1);
		pipeline.hIncrBy(minuteKey, `responses:${statusCode}`, 1);

		// Track blocklist requests
		const url = req.originalUrl || req.url;
		if (type && statusCode >= 200 && statusCode <= 304 && (url.includes('.txt') || url.includes('.conf'))) {
			pipeline.hIncrBy(minuteKey, 'blocklists', 1);
			pipeline.hIncrBy(minuteKey, `categories:${type}`, 1);
		}

		// Set TTL to 48 hours as backup (keys are deleted after aggregation, but kept if server is down)
		pipeline.expire(minuteKey, 172800);

		await pipeline.exec();
	} catch (err) {
		// Silent fail - don't block requests if Redis has issues
		console.error('Redis stats update failed:', err.message);
	}
};

module.exports = (req, res, next) => {
	res.on('finish', () => updateStats(req, res));
	next();
};
