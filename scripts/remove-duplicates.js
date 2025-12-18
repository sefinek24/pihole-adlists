const { mkdir, readdir, readFile, writeFile } = require('node:fs/promises');
const { join } = require('node:path');

const processLine = (line, existingDomains) => {
	if (line === '') return { shouldKeep: false, reason: 'emptyLine' };
	if (line.startsWith('# [')) return { shouldKeep: false, reason: 'uselessComment' };
	if (line.startsWith('##') || line.startsWith('#') || line.startsWith('!')) return { shouldKeep: true };

	const domain = line.trim();
	if (!domain) return { shouldKeep: true };

	if (existingDomains.has(domain)) return { shouldKeep: false, reason: 'duplicate' };
	existingDomains.add(domain);

	return { shouldKeep: true };
};

const processFile = async filePath => {
	try {
		let fileContents = await readFile(filePath, 'utf8');

		const existingDomains = new Set();
		let duplicatesRemoved = 0, emptyLinesRemoved = 0, uselessCommentsRemoved = 0;

		const lines = fileContents.split('\n').map(line => line.trim());
		const filteredLines = lines.filter(line => {
			const { shouldKeep, reason } = processLine(line, existingDomains);
			if (!shouldKeep) {
				if (reason === 'emptyLine') emptyLinesRemoved++;
				if (reason === 'uselessComment') uselessCommentsRemoved++;
				if (reason === 'duplicate') duplicatesRemoved++;
				return false;
			}
			return true;
		});

		fileContents = filteredLines.join('\n');
		await writeFile(filePath, fileContents, 'utf8');

		if (duplicatesRemoved > 0) {
			console.log(`✔️ ${duplicatesRemoved} ${duplicatesRemoved === 1 ? 'duplicate' : 'duplicates'} removed from ${filePath}`);
		}

		if (emptyLinesRemoved > 0) {
			console.log(`✔️ ${emptyLinesRemoved} empty ${emptyLinesRemoved === 1 ? 'line' : 'lines'} removed from ${filePath}`);
		}

		if (uselessCommentsRemoved > 0) {
			console.log(`✔️️ ${uselessCommentsRemoved} useless ${uselessCommentsRemoved === 1 ? 'comment' : 'comments'} removed from ${filePath}`);
		}
	} catch (err) {
		console.error(`⚠️ Error processing file ${filePath}:`, err.message);
	}
};

const processDirectory = async dirPath => {
	try {
		await mkdir(dirPath, { recursive: true });

		const dirEntries = await readdir(dirPath, { withFileTypes: true });
		const txtFiles = dirEntries.filter(entry => entry.isFile() && entry.name.endsWith('.txt')).map(entry => entry.name);
		const subdirectories = dirEntries.filter(entry => entry.isDirectory()).map(entry => join(dirPath, entry.name));

		await Promise.all(txtFiles.map(fileName => processFile(join(dirPath, fileName))));
		await Promise.all(subdirectories.map(subdirectory => processDirectory(subdirectory)));
	} catch (err) {
		console.error(`⚠️ Error processing directory ${dirPath}:`, err.message);
	}
};

(async () => {
	try {
		await processDirectory(join(__dirname, '..', 'blocklists', 'templates'));
	} catch (err) {
		console.error('⚠️ Error running the process:', err.message);
	}
})();