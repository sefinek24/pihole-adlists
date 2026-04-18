const { mkdir, readdir, readFile, writeFile } = require('node:fs/promises');
const { join, resolve } = require('node:path');

const processLine = (line, existingDomains) => {
	if (line === '') return { shouldKeep: false, reason: 'emptyLine' };
	if (line.startsWith('# [')) return { shouldKeep: false, reason: 'uselessComment' };
	if (line.startsWith('##') || line.startsWith('#') || line.startsWith('!')) return { shouldKeep: true };

	if (existingDomains.has(line)) return { shouldKeep: false, reason: 'duplicate' };
	existingDomains.add(line);

	return { shouldKeep: true };
};

const processFile = async filePath => {
	try {
		const originalContent = await readFile(filePath, 'utf8');

		const existingDomains = new Set();
		let duplicatesRemoved = 0, emptyLinesRemoved = 0, uselessCommentsRemoved = 0;

		const filteredLines = [];
		for (const rawLine of originalContent.split('\n')) {
			const line = rawLine.trim();
			const { shouldKeep, reason } = processLine(line, existingDomains);
			if (!shouldKeep) {
				if (reason === 'emptyLine') emptyLinesRemoved++;
				if (reason === 'uselessComment') uselessCommentsRemoved++;
				if (reason === 'duplicate') duplicatesRemoved++;
				continue;
			}
			filteredLines.push(line);
		}

		const newContent = filteredLines.join('\n');
		if (newContent !== originalContent) await writeFile(filePath, newContent, 'utf8');

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
	if (!process.argv[2]) {
		console.error('Usage: node remove-duplicates.js <directory>');
		process.exit(1);
	}

	try {
		const targetDir = resolve(process.cwd(), process.argv[2]);
		await processDirectory(targetDir);
	} catch (err) {
		console.error('⚠️ Error running the process:', err.message);
	}
})();