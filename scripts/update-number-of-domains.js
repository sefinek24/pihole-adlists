const { writeFile, readdir } = require('node:fs/promises');
const { createReadStream } = require('node:fs');
const { join, relative, extname } = require('node:path');
const readline = require('node:readline');
const getAllFiles = require('./utils/getAllFiles.js');

const CANONICAL_TYPE = 'noip';
const TYPE_EXTENSIONS = { unbound: '.conf' };
const DEFAULT_EXT = '.txt';

const formatCount = count => count.toLocaleString('en-US', { minimumIntegerDigits: 8, useGrouping: true }).replace(/,/g, ' ');

const createUpdatedContents = (lines, domainCount) => {
	const countText = domainCount.toLocaleString('en-US');
	return lines.join('\n').replace(
		/^([#!]\s*)(Domains|Count|Entries|Number of entries|Number of unique domains|Total number of network filters)(:\s*)(\d[\d,]*|<Count>)(\s+domains)?$/im,
		(_, prefix, key, separator) => `${prefix}${key}${separator}${countText} domains`
	);
};

const readLines = async file => {
	const lines = [];
	const rl = readline.createInterface({ input: createReadStream(file, 'utf8'), crlfDelay: Infinity });
	for await (const line of rl) lines.push(line);
	return lines;
};

const countDomains = lines => {
	let count = 0;
	for (const line of lines) {
		const t = line.trim();
		if (t && !t.startsWith('#')) count++;
	}
	return count;
};

(async () => {
	const generatedDir = join(__dirname, '..', 'blocklists', 'generated');
	const canonicalDir = join(generatedDir, CANONICAL_TYPE);

	const allTypes = (await readdir(generatedDir, { withFileTypes: true }))
		.filter(e => e.isDirectory())
		.map(e => e.name);

	const otherTypes = allTypes.filter(t => t !== CANONICAL_TYPE);

	const canonicalFiles = await getAllFiles(canonicalDir, [DEFAULT_EXT]);

	await Promise.all(canonicalFiles.map(async canonicalFile => {
		const lines = await readLines(canonicalFile);
		const domainCount = countDomains(lines);

		const relBase = relative(canonicalDir, canonicalFile).slice(0, -extname(canonicalFile).length);

		await Promise.all([
			writeFile(canonicalFile, createUpdatedContents(lines, domainCount), 'utf8')
				.then(() => console.log(`${formatCount(domainCount)} domains → ${canonicalFile}`)),
			...otherTypes.map(async type => {
				const targetFile = join(generatedDir, type, relBase + (TYPE_EXTENSIONS[type] ?? DEFAULT_EXT));
				try {
					const targetLines = await readLines(targetFile);
					await writeFile(targetFile, createUpdatedContents(targetLines, domainCount), 'utf8');
				} catch (err) {
					console.error(`Failed to update ${targetFile}:`, err.message);
					process.exitCode = 1;
				}
			}),
		]);
	}));
})().catch(err => {
	console.error('Fatal:', err.message);
	process.exitCode = 1;
});
