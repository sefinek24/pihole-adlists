const { writeFile } = require('node:fs/promises');
const { createReadStream } = require('node:fs');
const { join } = require('node:path');
const readline = require('readline');
const getAllFiles = require('./utils/getAllFiles.js');

const formatCount = count => count.toLocaleString('en-US', { minimumIntegerDigits: 8, useGrouping: true }).replace(/,/g, ' ');

const createUpdatedContents = (lines, domainCount) => {
	const countText = domainCount?.toLocaleString('en-US') || 'Unknown';
	return lines.join('\n').replace(
		/^(#\s*)(Domains|Count|Entries|Number of entries|Number of unique domains|Total number of network filters)(:\s*)(\d[\d,]*|<Count>)(\s+domains)?$/im,
		(_, prefix, key, separator) => `${prefix}${key}${separator}${countText} domains`
	);
};

const countDomains = async file => {
	const lines = [];
	let domainCount = 0;

	const rl = readline.createInterface({ input: createReadStream(file, 'utf8'), crlfDelay: Infinity });
	for await (const line of rl) {
		const trimmed = line.trim();
		if (trimmed && !trimmed.startsWith('#')) domainCount++;
		lines.push(line);
	}

	return { lines, domainCount };
};

const processFile = async file => {
	try {
		const { lines, domainCount } = await countDomains(file);
		const updatedContent = createUpdatedContents(lines, domainCount);
		await writeFile(file, updatedContent, 'utf8');

		console.log(`${formatCount(domainCount)} domains → ${file}`);
	} catch (err) {
		console.error(`Failed to process ${file}:`, err.message);
	}
};

(async () => {
	const blockListDir = join(__dirname, '..', 'blocklists', 'generated');

	const files = await getAllFiles(blockListDir, ['.txt', '.conf']);
	await Promise.all(files.map(processFile));
})();