const fs = require('node:fs/promises');
const path = require('node:path');

module.exports = async (format, relativePath, folderPath) => {
	const generatedPath = path.join(__dirname, '../../blocklists/generated', format, relativePath);
	await fs.mkdir(generatedPath, { recursive: true });

	const allFiles = await fs.readdir(folderPath, { withFileTypes: true });
	const txtFiles = allFiles.filter(file => file.isFile() && file.name.endsWith('.txt'));

	return {
		format,
		allFiles,
		txtFiles,
		generatedPath,
	};
};
