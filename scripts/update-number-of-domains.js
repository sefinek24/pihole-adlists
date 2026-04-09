const { readFile, writeFile, readdir } = require('node:fs/promises');
const { join, relative, extname } = require('node:path');
const getAllFiles = require('./utils/getAllFiles.js');

const CANONICAL_TYPE = 'noip';
const TYPE_EXTENSIONS = { unbound: '.conf' };
const DEFAULT_EXT = '.txt';
const CONCURRENCY = 8;

const COUNT_HEADER_RE = /^([#!]\s*)(Domains|Count|Entries|Number of entries|Number of unique domains|Total number of network filters)(:\s*)(\d[\d,]*|<Count>)(\s+domains)?$/im;

const formatCount = count => count.toLocaleString('en-US', { minimumIntegerDigits: 8, useGrouping: true }).replace(/,/g, ' ');
const replaceCount = (content, domainCount) =>
	content.replace(COUNT_HEADER_RE, (_, prefix, key, sep, _num, suffix) =>
		`${prefix}${key}${sep}${domainCount.toLocaleString('en-US')}${/^domains$/i.test(key) ? '' : (suffix ?? '')}`
	);

const countDomains = content => {
	let count = 0;
	for (const line of content.split('\n')) {
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

	// Phase 1: count domains from noip, update noip files
	const counts = new Map();

	for (let i = 0; i < canonicalFiles.length; i += CONCURRENCY) {
		await Promise.all(canonicalFiles.slice(i, i + CONCURRENCY).map(async file => {
			const content = await readFile(file, 'utf8');
			const domainCount = countDomains(content);
			const relBase = relative(canonicalDir, file).slice(0, -extname(file).length);
			counts.set(relBase, domainCount);
			await writeFile(file, replaceCount(content, domainCount), 'utf8');
			console.log(`${formatCount(domainCount)} domains → ${file}`);
		}));
	}

	// Phase 2: propagate counts to each other type
	for (const type of otherTypes) {
		const ext = TYPE_EXTENSIONS[type] ?? DEFAULT_EXT;
		let updated = 0;

		await Promise.all([...counts.entries()].map(async ([relBase, domainCount]) => {
			const targetFile = join(generatedDir, type, relBase + ext);
			try {
				const content = await readFile(targetFile, 'utf8');
				await writeFile(targetFile, replaceCount(content, domainCount), 'utf8');
				updated++;
			} catch (err) {
				console.error(`  Failed: ${targetFile}: ${err.message}`);
				process.exitCode = 1;
			}
		}));

		console.log(`${type.padEnd(12)} updated ${updated}/${counts.size} files`);
	}
})().catch(err => {
	console.error('Fatal:', err.message);
	process.exitCode = 1;
});
