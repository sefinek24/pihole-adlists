const fs = require('node:fs').promises;
const path = require('node:path');

const MAX_FILE_SIZE = 104847142; // 99.99 MB

module.exports = async (fullNewFile, replacedFile, comment = '#', header = null) => {
	const fileStats = await fs.stat(fullNewFile);
	if (fileStats.size > MAX_FILE_SIZE) {
		await fs.writeFile(
			fullNewFile,
			`${comment} The file consists of several individual parts.\n${header ? `${header}\n` : ''}${replacedFile.slice(0, MAX_FILE_SIZE)}`,
			'utf8'
		);

		console.log(`📑 File trimmed to ${MAX_FILE_SIZE} bytes and updated: ${fullNewFile}`);
	}

	let part = 2;
	const { dir, name, ext } = path.parse(fullNewFile);
	for (let start = MAX_FILE_SIZE; start < replacedFile.length; start += MAX_FILE_SIZE) {
		await fs.writeFile(
			path.join(dir, `${name}_${part}${ext}`),
			`${comment} The file consists of several individual parts.\n${header ? `${header}\n` : ''}${replacedFile.slice(start, start + MAX_FILE_SIZE)}`,
			'utf8'
		);

		console.log(`✔️ Created part ${part}: ${path.join(dir, `${name}_${part}${ext}`)}`);
		part++;
	}
};