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
const HEARTBEAT_INTERVAL = 30000;
const REPLACE_GRACE_MS = 3000;
let cacheTimestamp = 0, cachedStats = null;
const CACHE_TTL = 1000;
const connectedIps = new Map();
const replacedAt = new Map();

const fetchStats = async () => {
	const now = Date.now();
	if (cachedStats && now - cacheTimestamp < CACHE_TTL) return cachedStats;

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
	if (!connectedIps.size) return;

	const stats = await fetchStats();
	if (!stats) return;

	const message = JSON.stringify({ ...stats, uptime: getFullDate(process.uptime()) });
	for (const ws of connectedIps.values()) {
		if (ws.readyState === WebSocket.OPEN) ws.send(message);
	}
};

const broadcastInterval = setInterval(broadcast, BROADCAST_INTERVAL);

const heartbeatInterval = setInterval(() => {
	for (const ws of wss.clients) {
		if (!ws.isAlive) { ws.terminate(); continue; }
		ws.isAlive = false;
		ws.ping();
	}
}, HEARTBEAT_INTERVAL);

wss.on('connection', (ws, req) => {
	if (wss.clients.size > MAX_CLIENTS) {
		ws.close(1008, 'Server at capacity');
		return;
	}

	const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';

	const existing = connectedIps.get(ip);
	if (existing && existing.readyState === WebSocket.OPEN) {
		const lastReplaced = replacedAt.get(ip) ?? 0;
		if (Date.now() - lastReplaced >= REPLACE_GRACE_MS) {
			replacedAt.set(ip, Date.now());
			existing.close(4001, 'Replaced by new connection');
		}
	}
	connectedIps.set(ip, ws);
	ws.isAlive = true;
	ws.on('pong', () => { ws.isAlive = true; });

	console.log(`WebSocket connected from ${ip}`);

	fetchStats()
		.then(stats => { if (stats && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ ...stats, uptime: getFullDate(process.uptime()) })); })
		.catch(err => console.error('Failed to send initial stats:', err));

	ws.on('close', () => {
		if (connectedIps.get(ip) === ws) {
			connectedIps.delete(ip);
			replacedAt.delete(ip);
		}
		console.log(`WebSocket disconnected from ${ip}`);
	});
	ws.on('error', err => console.error('WebSocket error:', err));
});

wss.on('close', () => {
	clearInterval(broadcastInterval);
	clearInterval(heartbeatInterval);
});

console.log(`WebSocket server running at ${process.env.WS_ADDRESS}:${process.env.WS_PORT}`);