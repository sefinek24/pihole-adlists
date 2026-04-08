module.exports = async (format, path, fs, relativePath, folderPath) => {
	const generatedPath = path.join(__dirname, '../../blocklists/generated', format, relativePath);
	try {
		await fs.access(generatedPath);
	} catch {
		await fs.mkdir(generatedPath, { recursive: true });
	}

	const allFiles = await fs.readdir(folderPath, { withFileTypes: true });
	const txtFiles = allFiles.filter(file => file.isFile() && file.name.endsWith('.txt'));

	return {
		format,
		allFiles,
		txtFiles,
		generatedPath,
	};
};