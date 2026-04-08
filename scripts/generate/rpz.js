const { promises: fs } = require('node:fs');
const path = require('node:path');
const splitFile = require('./file-processor/split.js');
const getDate = require('../utils/date.js');
const sha256 = require('../utils/sha256.js');
const txtFilter = require('../utils/txtFilter.js');
const process = require('../utils/process.js');

const convert = async (folderPath = path.join(__dirname, '../../blocklists/templates'), relativePath = '') => {
	const { format, allFiles, txtFiles, generatedPath } = await txtFilter('rpz', path, fs, relativePath, folderPath);

	await Promise.all(txtFiles.map(async file => {
		const thisFileName = path.join(folderPath, file.name);

		// Cache
		const { stop } = await sha256(thisFileName, format, file);
		if (stop) return;

		// Content
		const fileContent = await fs.readFile(thisFileName, 'utf8');

		const seenDomains = new Set();
		const outputLines = [];

		fileContent.split('\n').forEach(line => {
			if (!line || line.startsWith('#')) return;

			const domain = line.startsWith('www.') ? line.slice(4) : line;
			if (!seenDomains.has(domain)) {
				seenDomains.add(domain);
				outputLines.push(`${domain} CNAME .`, `*.${domain} CNAME .`);
			}
		});

		const date = getDate();
		const replacedFile = outputLines.join('\n')
			.replace(/#(?: ?127\.0\.0\.1| ?0\.0\.0\.0) |:: /gm, '; ')
			.replace(/#/gm, ';')
			.replace('<Release>', 'RPZ')
			.replace('<LastUpdate>', `${date.full} | ${date.now}`);

		const fullNewFile = path.join(generatedPath, file.name);
		const header = `$TTL 300\n@ SOA localhost. root.localhost. ${date.serialNumber} 43200 3600 259200 300\n  NS  localhost.\n`;
		await fs.writeFile(fullNewFile, header + replacedFile);

		await splitFile(fullNewFile, replacedFile, ';', header);
	}));

	await process(convert, allFiles, path, relativePath, folderPath);
};

const run = async () => {
	await convert();
	console.log('\n');
};

(async () => await run())();

module.exports = run;