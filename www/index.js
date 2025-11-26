process.loadEnvFile();

const cluster = require('node:cluster');
const numCPUs = require('node:os').availableParallelism();
const connectToDatabase = require('./database/mongoose.js');
const { startAggregationJob } = require('./jobs/aggregate-stats.js');

const { NODE_ENV, DOMAIN, PORT, MONGODB_URL, SEFINEK_API } = process.env;
if (!NODE_ENV || !DOMAIN || !PORT) throw new Error('Missing basic environment variables');
if (!MONGODB_URL) throw new Error('Missing MongoDB connection URL');
if (!SEFINEK_API) throw new Error('Missing SEFINEK_API environment variable');

(async () => {
	// Development mode - single process
	if (NODE_ENV === 'development') {
		await connectToDatabase();
		require('./database/redis.js');
		startAggregationJob();
		require('./server.js');
		require('./websocket.js');
		return;
	}

	// Production mode - cluster with primary + workers
	if (cluster.isPrimary) {
		await connectToDatabase();
		require('./database/redis.js');
		require('./websocket.js');

		// Start Redis → MongoDB aggregation job (runs every 5 minutes)
		startAggregationJob();

		// Fork workers (one per CPU core)
		for (let i = 0; i < numCPUs; i++) {
			cluster.fork();
		}

		// Auto-restart workers on crash
		cluster.on('exit', (worker, code, signal) => {
			console.error(`Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Restarting...`);
			cluster.fork();
		});

		console.log(`Primary ${process.pid} running at ${DOMAIN}:${PORT}`);
	} else {
		// Worker process - handles HTTP requests
		await connectToDatabase();
		require('./database/redis.js');
		require('./server.js');
		console.log(`Worker ${process.pid} started`);
	}
})();