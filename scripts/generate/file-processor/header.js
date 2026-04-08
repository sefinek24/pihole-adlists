const { join } = require('node:path');
const fs = require('node:fs/promises');
const { CATEGORIES } = require('./scripts/data.js');
const generateHeader = require('./scripts/generateHeader.js');

const processCategory = async ({ title, description, category, file }) => {
	const filePath = join(__dirname, `../../../blocklists/templates/${file}`);

	try {
		await fs.access(filePath);
	} catch (err) {
		return console.error(filePath, err);
	}

	let fileContent = await fs.readFile(filePath, 'utf8');
	fileContent = fileContent.replace(/#.*/gm, '').trim();

	const count = fileContent.split('\n').filter(line => {
		const trimmed = line.trim();
		return trimmed && !trimmed.startsWith('#');
	}).length;
	const headerContent = generateHeader(title, description, count);

	await fs.writeFile(filePath, `${headerContent}\n${fileContent}`, 'utf8');

	console.log(`==================================
Category:      ${category || 'Unknown'}
Title:         ${title || 'Unknown'}
Entries count: ${count}
File path:     ${filePath}
==================================`);
};

const main = async () => {
	for (const category of CATEGORIES) {
		await processCategory(category);
	}
};

main().catch(error => console.error('[ERROR]', error));