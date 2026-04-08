const { createInterface } = require('readline');
const { get } = require('axios');
const { Extract } = require('unzipper');
const { createDecompressor } = require('lzma-native');
const { mkdir, rm, readdir } = require('node:fs/promises');
const { join, basename, extname } = require('node:path');
const { createWriteStream, createReadStream } = require('node:fs');
const { pipeline } = require('node:stream/promises');
const { fileUrls } = require('./scripts/data.js');

const TMP_DIR = join(__dirname, '..', '..', '..', 'tmp');
const MAIN_FILE = join(TMP_DIR, 'main.txt');

const downloadFile = async (url, outputPath) => {
	console.log(`Downloading: ${url}`);
	const res = await get(url, { responseType: 'stream' });
	await pipeline(res.data, createWriteStream(outputPath));
};

const extractors = {
	'.zip': (input, outputDir) => pipeline(createReadStream(input), Extract({ path: outputDir })),
	'.xz': async (input, outputDir) => {
		const outputFile = join(outputDir, basename(input, '.xz'));
		await pipeline(createReadStream(input), createDecompressor(), createWriteStream(outputFile));
	},
};

const collectDomains = async (filePath, writeStream) => {
	const rl = createInterface({ input: createReadStream(filePath), crlfDelay: Infinity });

	for await (const line of rl) {
		const domain = extname(filePath) === '.csv' ? line.split(',')[0].trim() : line.trim();
		if (domain && !writeStream.write(`${domain}\n`)) await new Promise(resolve => writeStream.once('drain', resolve));
	}
};

const processFiles = async (dir, writeStream) => {
	const entries = await readdir(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = join(dir, entry.name);
		if (entry.isDirectory()) {
			await processFiles(fullPath, writeStream);
		} else {
			await collectDomains(fullPath, writeStream);
		}
	}
};

const handleCompressedFile = async (filePath, outputDir, writeStream) => {
	await mkdir(outputDir, { recursive: true });

	const ext = extname(filePath);
	if (extractors[ext]) {
		await extractors[ext](filePath, outputDir);
		await processFiles(outputDir, writeStream);
		await rm(outputDir, { recursive: true, force: true });
	}
	await rm(filePath, { force: true });
};

const main = async () => {
	await rm(TMP_DIR, { recursive: true, force: true });
	await mkdir(TMP_DIR, { recursive: true });

	const writeStream = createWriteStream(MAIN_FILE, { flags: 'a' });

	for (const { url, name } of fileUrls) {
		const fileName = name || basename(url);
		const filePath = join(TMP_DIR, fileName);
		const extractPath = join(TMP_DIR, `${fileName}_extracted`);

		try {
			await downloadFile(url, filePath);

			const ext = extname(filePath);
			if (extractors[ext]) {
				await handleCompressedFile(filePath, extractPath, writeStream);
			} else {
				await collectDomains(filePath, writeStream);
				await rm(filePath, { force: true });
			}
		} catch (err) {
			console.error(`Error handling ${fileName}:`, err.message);
		}
	}

	await new Promise(resolve => writeStream.end(resolve));
	console.log('Domain list saved to', MAIN_FILE);
};

main().catch(err => console.error('Fatal error:', err.message));