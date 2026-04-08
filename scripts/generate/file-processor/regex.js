const { CATEGORIES } = require('./scripts/data.js');
const { readFile, writeFile } = require('node:fs/promises');
const { join } = require('node:path');

const removeWhitelistedDomains = async (category) => {
	const filePath = join(__dirname, '..', '..', '..', 'blocklists', 'templates', category.file);
	const data = await readFile(filePath, 'utf-8');
	const lines = data.split('\n');
	let removedCount = 0;

	const filteredLines = lines.filter(line => {
		const trimmedLine = line.trim();
		if (!trimmedLine || trimmedLine.startsWith('#')) return true;

		const isWhitelisted = category.whitelist?.test(trimmedLine);
		const matchesRegex = !category.regex.test(trimmedLine);

		if (isWhitelisted || matchesRegex) {
			removedCount++;
			console.log(`Removed ${trimmedLine}`);
			return false;
		}

		return true;
	});

	if (removedCount > 0) {
		await writeFile(filePath, filteredLines.join('\n'));
		console.log(`Category: ${category.category}; Removed: ${removedCount}`);
	} else {
		console.log(`Category: ${category.category}; No domains removed.`);
	}
};

const processCategories = async () => {
	const tasks = CATEGORIES
		.filter(category => category.regex && category.file)
		.map(removeWhitelistedDomains);

	await Promise.all(tasks);
};

processCategories().catch(console.error);