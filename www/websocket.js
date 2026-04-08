const WebSocket = require('ws');
const { getFullDate } = require('./utils/time.js');
const RequestStats = require('./database/models/request-stats.model');

const wss = new WebSocket.Server({
	port: process.env.WS_PORT,
	maxPayload: 16 * 1024,
	clientTracking: true,
	perMessageDeflate: false,
});

const MAX_CLIENTS = 100;
const BROADCAST_INTERVAL = 2000;
let cacheTimestamp = 0, cachedStats = null;
const CACHE_TTL = 1000;

const fetchStats = async () => {
	const now = Date.now();
	if (cachedStats && now - cacheTimestamp < CACHE_TTL) {
		return cachedStats;
	}

	try {
		const db = await RequestStats.findOne({}).lean();
		if (!db) return null;

		cachedStats = {
			stats: {
				total: db.total,
				blocklists: db.blocklists,
				categories: db.categories,
				responses: db.responses,
			},
			coll: {
				createdAt: db.createdAt,
				updatedAt: db.updatedAt,
			},
		};

		cacheTimestamp = now;
		return cachedStats;
	} catch (err) {
		console.error('Failed to fetch stats:', err);
		return null;
	}
};

const broadcast = async () => {
	const stats = await fetchStats();
	if (!stats) return;

	const uptime = getFullDate(process.uptime());
	const message = JSON.stringify({ ...cachedStats, uptime });

	wss.clients.forEach(client => {
		if (client.readyState === WebSocket.OPEN) client.send(message);
	});
};

const broadcastInterval = setInterval(broadcast, BROADCAST_INTERVAL);

wss.on('connection', (ws, req) => {
	if (wss.clients.size > MAX_CLIENTS) {
		ws.close(1008, 'Server at capacity');
		return;
	}

	console.log(`WebSocket connected from ${req.headers['x-forwarded-for']}`);

	fetchStats().then(stats => {
		if (stats && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ ...stats, uptime: getFullDate(process.uptime()) }));
	});

	ws.on('close', () => console.log('WebSocket disconnected'));
	ws.on('error', err => console.error('WebSocket error:', err));
});

wss.on('close', () => clearInterval(broadcastInterval));

console.log(`WebSocket server running at ${process.env.WS_ADDRESS}:${process.env.WS_PORT}`);