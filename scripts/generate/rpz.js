const fs = require('node:fs/promises');
const path = require('node:path');
const splitFile = require('./file-processor/split.js');
const getDate = require('../utils/date.js');
const sha256 = require('../utils/sha256.js');
const txtFilter = require('../utils/txtFilter.js');
const process = require('../utils/process.js');
const buildHeader = require('../utils/buildHeader.js');

const TEMPLATES_DIR = path.join(__dirname, '../../blocklists/templates');

const convert = async (folderPath = TEMPLATES_DIR, relativePath = '') => {
	const { format, allFiles, txtFiles, generatedPath } = await txtFilter('rpz', path, fs, relativePath, folderPath);

	await Promise.all(txtFiles.map(async file => {
		const thisFileName = path.join(folderPath, file.name);

		const { stop, content: rawContent } = await sha256(thisFileName, format, file);
		if (stop) return;

		const domains = rawContent.split('\n').filter(l => l && !l.startsWith('#'));
		const relPath = path.relative(TEMPLATES_DIR, thisFileName);
		const header = buildHeader(relPath, domains.length).replace(/^#/gm, ';');

		const seenDomains = new Set();
		const outputLines = [];
		for (const domain of domains) {
			const d = domain.startsWith('www.') ? domain.slice(4) : domain;
			if (!seenDomains.has(d)) {
				seenDomains.add(d);
				outputLines.push(`${d} CNAME .`, `*.${d} CNAME .`);
			}
		}

		const date = getDate();
		const soaHeader = `$TTL 300\n@ SOA localhost. root.localhost. ${date.serialNumber} 43200 3600 259200 300\n  NS  localhost.\n`;
		const output = [soaHeader + header, ...outputLines].join('\n')
			.replace('<Release>', 'RPZ')
			.replace('<LastUpdate>', `${date.full} | ${date.now}`);

		const fullNewFile = path.join(generatedPath, file.name);
		await fs.writeFile(fullNewFile, output);

		await splitFile(fullNewFile, output, ';', soaHeader);
	}));

	await process(convert, allFiles, path, relativePath, folderPath);
};

const run = async () => {
	await convert();
	console.log('\n');
};

(async () => await run())();

module.exports = run;
