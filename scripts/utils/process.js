module.exports = async (convert, allFiles, path, relativePath, folderPath) => {
	try {
		const subdirectories = allFiles.filter(file => file.isDirectory());
		await Promise.all(subdirectories.map(async subdirectory => {
			const nextRelativePath = path.join(relativePath, subdirectory.name);
			await convert(path.join(folderPath, subdirectory.name), nextRelativePath);
		}));
	} catch (err) {
		console.error(`❌ Error processing ${folderPath}:`, err);
	}
};