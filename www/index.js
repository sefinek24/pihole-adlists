process.loadEnvFile();

const cluster = require('node:cluster');
const numCPUs = require('node:os').availableParallelism();
const connectToDatabase = require('./database/mongoose.js');
const mergeUpdates = require('./cluster/mergeUpdates.js');
const RequestStats = require('./database/models/request-stats.model');

const { NODE_ENV, DOMAIN, PORT, MONGODB_URL, SEFINEK_API } = process.env;
if (!NODE_ENV || !DOMAIN || !PORT) throw new Error('Missing basic environment variables');
if (!MONGODB_URL) throw new Error('Missing MongoDB connection URL');
if (!SEFINEK_API) throw new Error('Missing SEFINEK_API environment variable');

(async () => {
	if (NODE_ENV === 'development') {
		await connectToDatabase();
		require('./server.js');
		require('./websocket.js');
		return;
	}

	if (cluster.isPrimary) {
		await connectToDatabase();
		require('./websocket.js');

		// Global stats buffer
		let globalStatsBuffer = { inc: {}, set: {} };

		const flushBuffer = async () => {
			if (!Object.keys(globalStatsBuffer.inc).length && !Object.keys(globalStatsBuffer.set).length) return;

			try {
				await RequestStats.findOneAndUpdate(
					{},
					{ $inc: globalStatsBuffer.inc, $set: globalStatsBuffer.set },
					{ upsert: true }
				);
				globalStatsBuffer = { inc: {}, set: {} };
			} catch (err) {
				console.error('Error flushing buffer.', err);
			}
		};

		setInterval(flushBuffer, 2500);

		// Fork workers
		for (let i = 0; i < numCPUs; i++) {
			cluster.fork();
		}

		// Merge updates
		cluster.on('message', (worker, message) => {
			if (message?.type === 'updateStats') mergeUpdates(globalStatsBuffer, message.data);
		});

		// On exit
		cluster.on('exit', (worker, code, signal) => {
			console.error(`Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Restarting...`);
			cluster.fork();
		});

		console.log(`Primary ${process.pid} running at ${DOMAIN}:${PORT}`);
	} else {
		await connectToDatabase();
		require('./server.js');
		console.log(`Worker ${process.pid} started`);
	}
})();