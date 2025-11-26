const router = require('express').Router();
const MinuteStats = require('../database/models/minute-stats.model.js');

// Get minute stats for a specific date range
// Example: GET /api/stats/minute?from=2024-11-26&to=2024-11-27
router.get('/api/stats/minute', async (req, res) => {
	try {
		const { from, to, limit = 1440 } = req.query; // Default 1440 = 24h
		if (!from) return res.status(400).json({ success: false, status: 400, message: 'Missing "from" query parameter (YYYY-MM-DD)' });

		const query = { date: from };
		if (to && to !== from)query.date = { $gte: from, $lte: to };

		const stats = await MinuteStats
			.find(query)
			.sort({ timestamp: 1 })
			.limit(parseInt(limit))
			.lean();

		res.json({
			success: true,
			count: stats.length,
			data: stats,
		});
	} catch (err) {
		console.error('Error fetching minute stats:', err);
		res.status(500).json({ success: false, status: 500, message: 'Internal server error' });
	}
});

// Get stats for last N hours (from MongoDB only - Redis keys are deleted after aggregation)
// Example: GET /api/stats/recent?hours=24
router.get('/api/stats/recent', async (req, res) => {
	try {
		const hours = parseInt(req.query.hours) || 24;
		const now = new Date();
		const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);

		// Query MongoDB for all data
		const stats = await MinuteStats
			.find({ timestamp: { $gte: startTime } })
			.sort({ timestamp: 1 })
			.lean();

		res.json({
			success: true,
			hours,
			count: stats.length,
			data: stats,
		});
	} catch (err) {
		console.error('Error fetching recent stats:', err);
		res.status(500).json({ success: false, status: 500, message: 'Internal server error' });
	}
});

// Get aggregated hourly stats for a date
// Example: GET /api/stats/hourly?date=2024-11-26
router.get('/api/stats/hourly', async (req, res) => {
	try {
		const { date } = req.query;
		if (!date) return res.status(400).json({ success: false, status: 400, message: 'Missing "date" query parameter (YYYY-MM-DD)' });

		const minuteStats = await MinuteStats
			.find({ date })
			.sort({ time: 1 })
			.lean();

		// Aggregate by hour
		const hourlyStats = {};

		for (const stat of minuteStats) {
			const hour = stat.time.split(':')[0]; // Get HH from HH:mm

			if (!hourlyStats[hour]) {
				hourlyStats[hour] = {
					hour,
					total: 0,
					blocklists: 0,
					categories: {},
					responses: {},
				};
			}

			hourlyStats[hour].total += stat.total;
			hourlyStats[hour].blocklists += stat.blocklists;

			// Aggregate categories
			for (const [cat, count] of Object.entries(stat.categories)) {
				hourlyStats[hour].categories[cat] = (hourlyStats[hour].categories[cat] || 0) + count;
			}

			// Aggregate responses
			for (const [code, count] of Object.entries(stat.responses)) {
				hourlyStats[hour].responses[code] = (hourlyStats[hour].responses[code] || 0) + count;
			}
		}

		const data = Object.values(hourlyStats).sort((a, b) => a.hour.localeCompare(b.hour));
		res.json({ success: true, date, count: data.length, data });
	} catch (err) {
		console.error('Error fetching hourly stats:', err);
		res.status(500).json({ success: false, status: 500, message: 'Internal server error' });
	}
});

module.exports = router;
