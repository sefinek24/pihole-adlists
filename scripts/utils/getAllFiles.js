const { readdir } = require('node:fs/promises');
const { resolve, extname } = require('node:path');

const getAllFilesRecursively = async (directoryPath, extensions = ['.txt']) => {
	const directoryEntries = await readdir(directoryPath, { withFileTypes: true });
	let files = [];

	for (const entry of directoryEntries) {
		const entryPath = resolve(directoryPath, entry.name);

		if (entry.isDirectory()) {
			const nestedFiles = await getAllFilesRecursively(entryPath, extensions);
			files = files.concat(nestedFiles);
		} else if (extensions.includes(extname(entryPath))) {
			files.push(entryPath);
		}
	}

	return files;
};

module.exports = getAllFilesRecursively;