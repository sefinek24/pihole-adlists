const router = require('express').Router();
const MinuteStats = require('../database/models/minute-stats.model.js');
const RequestStats = require('../database/models/request-stats.model.js');

// Get all-time statistics
router.get('/api/stats/alltime', async (req, res) => {
	try {
		const stats = await RequestStats.findOne({}).lean();
		if (!stats) {
			return res.json({ success: true, data: { total: 0, blocklists: 0, categories: {}, responses: {} } });
		}

		res.json({
			success: true,
			data: {
				total: stats.total || 0,
				blocklists: stats.blocklists || 0,
				categories: stats.categories || {},
				responses: stats.responses || {},
				createdAt: stats.createdAt,
				updatedAt: stats.updatedAt,
			},
		});
	} catch (err) {
		console.error('Error fetching all-time stats:', err);
		res.status(500).json({ success: false, status: 500, message: 'Internal server error' });
	}
});

// Get minute stats for a specific date range
// Example: GET /api/stats/minute?from=2024-11-26&to=2024-11-27
router.get('/api/stats/minute', async (req, res) => {
	try {
		const { from, to, limit = 1440 } = req.query;
		if (!from) return res.status(400).json({ success: false, status: 400, message: 'Missing "from" query parameter (YYYY-MM-DD)' });

		const fromDate = new Date(from);
		const toDate = to ? new Date(to) : fromDate;
		const daysDiff = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));

		const maxLimit = daysDiff > 90 ? 14400 : daysDiff > 30 ? 43200 : 100000;
		const finalLimit = Math.min(parseInt(limit), maxLimit);

		const query = { date: from };
		if (to && to !== from) query.date = { $gte: from, $lte: to };

		const stats = await MinuteStats
			.find(query)
			.select('-_id')
			.sort({ timestamp: 1 })
			.limit(finalLimit)
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

module.exports = router;
