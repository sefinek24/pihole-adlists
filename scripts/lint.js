const { readdir, readFile } = require('node:fs/promises');
const { resolve, join } = require('node:path');

const getAllTxtFiles = async dir => {
	const dirents = await readdir(dir, { withFileTypes: true });
	const files = await Promise.all(
		dirents.map(dirent => {
			const res = resolve(dir, dirent.name);
			return dirent.isDirectory() ? getAllTxtFiles(res) : res;
		})
	);
	return files.flat().filter(file => file.endsWith('.txt') && file.includes('blocklists'));
};

const lintFile = async (file, fileContents) => {
	let hasError = false;
	const lines = fileContents.split('\n');

	lines.forEach((line, index) => {
		if (line.length > 0 && !line.indexOf('Version')) {
			console.error(`[Line ${index + 1}]: Must not contain a Version/Date - ${file}`);
			hasError = true;
		}

		const trimmed = line.trim();
		if (trimmed && !trimmed.startsWith('#')) {
			const domain = trimmed.split('#')[0].trim();

			if (domain.toLowerCase() !== domain) {
				console.error(`[Line ${index + 1}]: ${domain} must be all lowercase - ${file}`);
				hasError = true;
			}

			if ((/\s/gmu).test(domain)) {
				console.error(`[Line ${index + 1}]: in ${file} domain ${domain} contains whitespace.`);
				hasError = true;
			}
		}
	});

	return hasError;
};

(async () => {
	let hasError = false;
	const blockListDir = join(__dirname, '..', 'blocklists', 'templates');
	const files = await getAllTxtFiles(blockListDir);

	await Promise.all(
		files.map(async file => {
			const content = await readFile(file, 'utf8');
			const fileHasError = await lintFile(file, content);
			if (fileHasError) hasError = true;
		})
	);

	console.log(hasError ? '❌ Linting failed!' : '✔️ Linting passed');
	process.exit(hasError ? 1 : 0);
})();