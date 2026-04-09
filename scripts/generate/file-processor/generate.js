const { mkdir, rm } = require('node:fs/promises');
const { createReadStream, createWriteStream, statSync } = require('node:fs');
const { join } = require('node:path');
const readline = require('node:readline');
const cluster = require('node:cluster');
const numCPUs = require('node:os').availableParallelism();
const { CATEGORIES, GLOBAL_WHITELIST } = require('./scripts/data.js');

const TMP_DIR = join(__dirname, '..', '..', '..', 'tmp');
const MAIN_FILE = join(TMP_DIR, 'main.txt');

const compiledWhitelist = GLOBAL_WHITELIST.map(p => new RegExp('^' + p.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$'));
const isDomainWhitelisted = domain => compiledWhitelist.some(re => re.test(domain));

const setupWriteStreams = () => {
	const streams = {};
	for (const { file } of CATEGORIES) {
		const outputPath = join(__dirname, '../../../blocklists/templates', file);
		streams[file] = createWriteStream(outputPath, { flags: 'a' });
		streams[file].on('error', err => console.error(`Error writing to ${file}: ${err.message}`));
	}
	return streams;
};

const processChunk = async (start, end, chunkId) => {
	console.time(`Chunk ${chunkId}`);
	console.log(`Worker ${process.pid} processing ${start}-${end}`);

	const counters = Object.fromEntries(CATEGORIES.map(({ file }) => [file, 0]));
	const writeStreams = setupWriteStreams();

	const rl = readline.createInterface({ input: createReadStream(MAIN_FILE, { start, end }), crlfDelay: Infinity });
	rl.on('line', line => {
		if (!line || isDomainWhitelisted(line)) return;

		for (const { regex, file, whitelist } of CATEGORIES) {
			if (whitelist?.test(line)) continue;
			if (regex.test(line)) {
				writeStreams[file].write(`\n${line}`);
				counters[file]++;
			}
		}
	});

	rl.on('close', () => {
		for (const [file, count] of Object.entries(counters)) {
			console.log(`Worker ${process.pid} - ${file}: ${count} domains`);
		}
		for (const stream of Object.values(writeStreams)) stream.end();
		console.timeEnd(`Chunk ${chunkId}`);
		cluster.worker.kill();
	});

	rl.on('error', err => console.error(`Worker ${process.pid} read error: ${err.message}`));
};

const startMaster = async () => {
	for (const { file } of CATEGORIES) {
		const dir = join(__dirname, 'output', file.split('/')[0]);
		await mkdir(dir, { recursive: true });
	}

	const fileSize = statSync(MAIN_FILE).size;
	const chunkSize = Math.ceil(fileSize / numCPUs);

	for (let i = 0; i < numCPUs; i++) {
		const start = i * chunkSize;
		const end = (i === numCPUs - 1) ? fileSize - 1 : (start + chunkSize - 1);
		cluster.fork({ start, end, chunkId: i });
	}

	let exited = 0;
	cluster.on('exit', (worker, code) => {
		exited++;
		if (code !== 0) console.error(`Worker ${worker.process.pid} exited with code ${code}`);
		if (exited === numCPUs) {
			rm(TMP_DIR, { recursive: true, force: true })
				.then(() => console.log(`Deleted ${TMP_DIR}`))
				.catch(err => console.error(`Failed to delete ${TMP_DIR}: ${err.message}`));
		}
	});
};

if (cluster.isPrimary) {
	startMaster().catch(console.error);
} else {
	const { start, end, chunkId } = process.env;
	processChunk(Number(start), Number(end), Number(chunkId)).catch(console.error);
}