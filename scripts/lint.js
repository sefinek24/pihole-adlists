const { readFile } = require('node:fs/promises');
const { join } = require('node:path');
const getAllFiles = require('./utils/getAllFiles.js');

const WHITESPACE_RE = /\s/u;

const lintFile = (file, fileContents) => {
	let hasErr = false;
	const lines = fileContents.split('\n');

	lines.forEach((line, index) => {
		if (line.length > 0 && line.startsWith('Version')) {
			console.error(`[Line ${index + 1}]: Must not contain a Version/Date - ${file}`);
			hasErr = true;
		}

		const trimmed = line.trim();
		if (trimmed && !trimmed.startsWith('#')) {
			const domain = trimmed.split('#')[0].trim();
			if (domain.toLowerCase() !== domain) {
				console.error(`[Line ${index + 1}]: ${domain} must be all lowercase - ${file}`);
				hasErr = true;
			}

			if (WHITESPACE_RE.test(domain)) {
				console.error(`[Line ${index + 1}]: in ${file} domain ${domain} contains whitespace.`);
				hasErr = true;
			}
		}
	});

	return hasErr;
};

(async () => {
	const blockListDir = join(__dirname, '..', 'blocklists', 'templates');
	const files = await getAllFiles(blockListDir, ['.txt']);

	let hasErr = false;
	await Promise.all(
		files.map(async file => {
			const content = await readFile(file, 'utf8');
			const fileHasErr = lintFile(file, content);
			if (fileHasErr) hasErr = true;
		})
	);

	console.log(hasErr ? '❌ Linting failed!' : '✔️ Linting passed');
	process.exit(hasErr ? 1 : 0);
})();