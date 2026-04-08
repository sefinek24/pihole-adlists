const { readdir } = require('node:fs/promises');
const { resolve, extname } = require('node:path');

const getAllTxtFilesRecursively = async directoryPath => {
	const directoryEntries = await readdir(directoryPath, { withFileTypes: true });
	let txtFiles = [];

	for (const entry of directoryEntries) {
		const entryPath = resolve(directoryPath, entry.name);

		if (entry.isDirectory()) {
			const nestedTxtFiles = await getAllTxtFilesRecursively(entryPath);
			txtFiles = txtFiles.concat(nestedTxtFiles);
		} else if (extname(entryPath) === '.txt') {
			txtFiles.push(entryPath);
		}
	}

	return txtFiles;
};

module.exports = getAllTxtFilesRecursively;