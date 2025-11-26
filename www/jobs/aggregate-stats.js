const RedisClient = require('../database/redis.js');
const RequestStats = require('../database/models/request-stats.model.js');
const MinuteStats = require('../database/models/minute-stats.model.js');

const AGGREGATION_INTERVAL = 5 * 60 * 1000; // 5 minutes
const isDev = process.env.NODE_ENV !== 'production';

const aggregateRedisToMongo = async () => {
	try {
		// Get all minute keys from Redis
		const allKeys = await RedisClient.keys('stats:minute:*');
		if (!allKeys.length) return;

		if (isDev) console.log(`Found ${allKeys.length} minute keys to aggregate`);

		// Aggregate data
		const aggregated = {
			inc: {},
			perDay: {},
			perMonth: {},
			perYear: {},
		};

		const minuteDocuments = [];
		const keysToDelete = [];

		for (const key of allKeys) {
			try {
				const data = await RedisClient.hGetAll(key);
				if (!data || Object.keys(data).length === 0) {
					if (isDev) console.warn(`Empty data for key: ${key}`);
					continue;
				}

				// Parse date from key: stats:minute:YYYY-MM-DD:HH:mm
				// Key format: stats:minute:2024-11-26:08:16 splits as ["stats", "minute", "2024-11-26", "08", "16"]
				const parts = key.split(':');

				if (parts.length !== 5) {
					if (isDev) console.warn(`Invalid key format: ${key}`);
					continue;
				}

				const date = parts[2]; // YYYY-MM-DD
				const hour = parts[3]; // HH
				const minute = parts[4]; // mm
				const time = `${hour}:${minute}`; // HH:mm

				const dateParts = date.split('-');
				if (dateParts.length !== 3) {
					if (isDev) console.warn(`Invalid date format in key: ${key}`);
					continue;
				}

				const year = dateParts[0];
				const month = dateParts[1];
				const day = dateParts[2];

				// Create timestamp (UTC)
				const timestamp = new Date(Date.UTC(
					parseInt(year),
					parseInt(month) - 1,
					parseInt(day),
					parseInt(hour),
					parseInt(minute),
					0, 0
				));

				if (isNaN(timestamp.getTime())) {
					if (isDev) console.warn(`Invalid timestamp for key: ${key}`);
					continue;
				}

				// Prepare minute document for minute-stats collection
				const minuteDoc = {
					timestamp,
					date,
					time,
					total: parseInt(data.total || 0),
					blocklists: parseInt(data.blocklists || 0),
					categories: {
						'0000': 0,
						'127001': 0,
						adguard: 0,
						dnsmasq: 0,
						noip: 0,
						rpz: 0,
						unbound: 0,
					},
					responses: {},
				};

				// Parse categories and responses
				for (const [field, value] of Object.entries(data)) {
					if (field.startsWith('categories:')) {
						const category = field.replace('categories:', '');
						minuteDoc.categories[category] = parseInt(value);
					}

					if (field.startsWith('responses:')) {
						const code = field.replace('responses:', '');
						minuteDoc.responses[code] = parseInt(value);
					}
				}

				minuteDocuments.push(minuteDoc);

				// Aggregate for request-stats collection (totals)
				if (data.total) {
					aggregated.inc.total = (aggregated.inc.total || 0) + parseInt(data.total);
				}

				if (data.blocklists) {
					aggregated.inc.blocklists = (aggregated.inc.blocklists || 0) + parseInt(data.blocklists);
				}

				// Aggregate per day/month/year
				const dayKey = date;
				const monthKey = `${month}-${year}`;
				const yearKey = year;

				if (data.blocklists) {
					aggregated.perDay[dayKey] = (aggregated.perDay[dayKey] || 0) + parseInt(data.blocklists);
					aggregated.perMonth[monthKey] = (aggregated.perMonth[monthKey] || 0) + parseInt(data.blocklists);
					aggregated.perYear[yearKey] = (aggregated.perYear[yearKey] || 0) + parseInt(data.blocklists);
				}

				// Aggregate categories and responses
				for (const [field, value] of Object.entries(data)) {
					if (field.startsWith('categories:')) {
						const category = field.replace('categories:', '');
						const categoryKey = `categories.${category}`;
						aggregated.inc[categoryKey] = (aggregated.inc[categoryKey] || 0) + parseInt(value);
					}

					if (field.startsWith('responses:')) {
						const code = field.replace('responses:', '');
						const responseKey = `responses.${code}`;
						aggregated.inc[responseKey] = (aggregated.inc[responseKey] || 0) + parseInt(value);
					}
				}

				keysToDelete.push(key);
			} catch (err) {
				console.error(`Error processing key ${key}:`, err.message);
			}
		}

		// Save minute documents to MongoDB (upsert prevents duplicates)
		if (minuteDocuments.length > 0) {
			try {
				await MinuteStats.bulkWrite(
					minuteDocuments.map(doc => ({
						updateOne: {
							filter: { date: doc.date, time: doc.time },
							update: { $set: doc },
							upsert: true,
						},
					}))
				);
				if (isDev) console.log(`Saved ${minuteDocuments.length} minute documents to minute-stats`);
			} catch (err) {
				console.error('Failed to save minute documents:', err.message);
			}
		}

		// Update aggregated request-stats (only if we have data)
		if (Object.keys(aggregated.inc).length > 0 || Object.keys(aggregated.perDay).length > 0) {
			try {
				const updateQuery = { $inc: aggregated.inc };

				// Update perDay/perMonth/perYear maps
				for (const [day, count] of Object.entries(aggregated.perDay)) {
					updateQuery.$inc[`perDay.${day}`] = count;
				}

				for (const [month, count] of Object.entries(aggregated.perMonth)) {
					updateQuery.$inc[`perMonth.${month}`] = count;
				}

				for (const [year, count] of Object.entries(aggregated.perYear)) {
					updateQuery.$inc[`perYear.${year}`] = count;
				}

				updateQuery.$set = { updatedAt: new Date() };

				await RequestStats.findOneAndUpdate({}, updateQuery, { upsert: true });
				if (isDev) console.log(`Updated request-stats: +${aggregated.inc.total || 0} requests, +${aggregated.inc.blocklists || 0} blocklists`);
			} catch (err) {
				console.error('Failed to update request-stats:', err.message);
			}
		}

		// Delete processed keys from Redis
		if (keysToDelete.length > 0) {
			try {
				await RedisClient.del(keysToDelete);
				if (isDev) console.log(`Deleted ${keysToDelete.length} processed keys from Redis`);
			} catch (err) {
				console.error('Failed to delete keys:', err.message);
			}
		}

		console.log(`Aggregation completed: ${minuteDocuments.length} minutes, +${aggregated.inc.total || 0} requests, +${aggregated.inc.blocklists || 0} blocklists`);

	} catch (err) {
		console.error('Failed:', err);
	}
};

const startAggregationJob = () => {
	if (isDev) console.log(`Job started, running every ${AGGREGATION_INTERVAL / 1000 / 60} minutes`);

	// Run immediately on start
	aggregateRedisToMongo();

	// Then run every N minutes
	setInterval(aggregateRedisToMongo, AGGREGATION_INTERVAL);
};

module.exports = { startAggregationJob, aggregateRedisToMongo };
