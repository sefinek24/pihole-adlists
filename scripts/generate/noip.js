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
	const { format, allFiles, txtFiles, generatedPath } = await txtFilter('noip', path, fs, relativePath, folderPath);

	await Promise.all(txtFiles.map(async file => {
		const thisFileName = path.join(folderPath, file.name);

		const { stop, content: rawContent } = await sha256(thisFileName, format, file);
		if (stop) return;

		const domains = rawContent.split('\n').filter(l => l && !l.startsWith('#'));
		const relPath = path.relative(TEMPLATES_DIR, thisFileName);
		const header = buildHeader(relPath, domains.length);

		const date = getDate();
		const output = [header, ...domains].join('\n')
			.replace('<Release>', 'No IP (only domains)')
			.replace('<LastUpdate>', `${date.full} | ${date.now}`);

		const fullNewFile = path.join(generatedPath, file.name);
		await fs.writeFile(fullNewFile, output);

		await splitFile(fullNewFile, output, '!');
	}));

	await process(convert, allFiles, path, relativePath, folderPath);
};

const run = async () => {
	await convert();
	console.log('\n');
};

(async () => await run())();

module.exports = run;
