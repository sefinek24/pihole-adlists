const { readdir } = require('node:fs/promises');
const { resolve, extname } = require('node:path');

const getAllFilesRecursively = async (directoryPath, extensions = ['.txt']) => {
	const directoryEntries = await readdir(directoryPath, { withFileTypes: true });

	const results = await Promise.all(directoryEntries.map(async entry => {
		const entryPath = resolve(directoryPath, entry.name);
		if (entry.isDirectory()) return getAllFilesRecursively(entryPath, extensions);
		if (extensions.includes(extname(entryPath))) return [entryPath];
		return [];
	}));

	return results.flat();
};

module.exports = getAllFilesRecursively;
