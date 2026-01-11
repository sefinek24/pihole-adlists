import { formatDate, updateElementDate, updateElementDateOnly } from './date.js';

const WS_ADDRESS = document.querySelector('script[data-ws-address]')?.dataset?.wsAddress;
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_DELAY = 30000;
const HEARTBEAT_INTERVAL = 30000;
const CATEGORY_IDS = ['hosts', 'localhost', 'noip', 'adguard', 'unbound', 'dnsmasq', 'rpz'];

let heartbeatInterval = null, reconnectAttempts = 0, reconnectTimeout = null;
let ws = null;
let lastMessageTime = Date.now();

const elementCache = new Map();

const formatNumber = num => num == null ? '0' : (typeof num === 'number' ? num.toLocaleString('en-US') : String(num));

const getElement = id => {
	if (!elementCache.has(id)) elementCache.set(id, document.getElementById(`stats-content-${id}`));
	return elementCache.get(id);
};

const updateStats = (id, value) => {
	const element = getElement(id);
	if (!element) return;

	const formattedValue = typeof value === 'number' ? formatNumber(value) : String(value);
	if (element.textContent === formattedValue) return;

	element.textContent = formattedValue;
	element.classList.add('stats-updated');
	setTimeout(() => element.classList.remove('stats-updated'), 1000);
};

const handleWebSocketMessage = event => {
	lastMessageTime = Date.now();

	try {
		const data = JSON.parse(event.data);
		if (!data?.stats) return;

		const { stats, uptime, coll } = data;

		if (stats.total != null) updateStats('total-requests', stats.total);
		if (stats.blocklists != null) updateStats('blocklist-requests', stats.blocklists);

		if (stats.categories) {
			CATEGORY_IDS.forEach(id => {
				if (stats.categories[id] != null) updateStats(id, stats.categories[id]);
			});
		}

		if (stats.responses && typeof stats.responses === 'object') {
			Object.entries(stats.responses).forEach(([code, count]) => updateStats(`response-${code}`, count));
		}

		if (uptime) updateStats('uptime', uptime);

		if (coll?.createdAt) {
			updateStats('coll-cAt', formatDate(coll.createdAt));
			updateElementDateOnly('stats-since-date', coll.createdAt);
		}

		if (coll?.updatedAt) updateStats('coll-uAt', formatDate(coll.updatedAt));
	} catch (err) {
		console.error('WebSocket message error:', err);
	}
};

const getReconnectDelay = () => Math.min(RECONNECT_DELAY * Math.pow(1.5, reconnectAttempts), MAX_RECONNECT_DELAY);

const connect = () => {
	if (!WS_ADDRESS) {
		console.error('WebSocket address not configured');
		return;
	}

	if (ws?.readyState === WebSocket.OPEN || ws?.readyState === WebSocket.CONNECTING) return;

	ws = new WebSocket(WS_ADDRESS);

	ws.onopen = () => {
		console.log('WebSocket connected');
		reconnectAttempts = 0;
		lastMessageTime = Date.now();

		if (heartbeatInterval) clearInterval(heartbeatInterval);
		heartbeatInterval = setInterval(() => {
			const timeSinceLastMessage = Date.now() - lastMessageTime;
			if (timeSinceLastMessage > HEARTBEAT_INTERVAL * 2) {
				console.log('Connection appears stale, reconnecting...');
				ws.close();
			}
		}, HEARTBEAT_INTERVAL);
	};

	ws.onmessage = handleWebSocketMessage;

	ws.onerror = err => console.error('WebSocket error:', err);

	ws.onclose = () => {
		console.log('WebSocket disconnected');

		if (heartbeatInterval) {
			clearInterval(heartbeatInterval);
			heartbeatInterval = null;
		}

		if (reconnectTimeout) clearTimeout(reconnectTimeout);

		const delay = getReconnectDelay();
		console.log(`Reconnecting in ${(delay / 1000).toFixed(1)}s...`);

		reconnectTimeout = setTimeout(() => {
			reconnectAttempts++;
			connect();
		}, delay);
	};
};

const initDates = () => {
	updateElementDate('stats-content-coll-cAt');
	updateElementDate('stats-content-coll-uAt');
	updateElementDateOnly('stats-since-date');
};

const init = () => {
	initDates();
	connect();
};

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}
