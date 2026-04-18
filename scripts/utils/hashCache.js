const fs = require('node:fs/promises');
const fsSync = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const BASE_PATH = path.join(__dirname, '../../blocklists/templates');

const BASE_CODE_HASH = (() => {
	const h = createHash('sha512');
	for (const f of [
		path.join(__dirname, 'buildHeader.js'),
		path.join(__dirname, 'generateHeader.js'),
		path.join(__dirname, '../generate/runner.js'),
	]) {
		try { h.update(fsSync.readFileSync(f)); } catch { /* file missing in isolated test environments */ }
	}
	return h.digest('hex').slice(0, 16);
})();

const formatHashCache = new Map();

const getCodeHash = formatFile => {
	if (!formatFile) return BASE_CODE_HASH;
	if (formatHashCache.has(formatFile)) return formatHashCache.get(formatFile);
	try {
		const h = createHash('sha512');
		h.update(BASE_CODE_HASH);
		h.update(fsSync.readFileSync(formatFile));
		const hash = h.digest('hex').slice(0, 16);
		formatHashCache.set(formatFile, hash);
		return hash;
	} catch {
		return BASE_CODE_HASH;
	}
};

module.exports = async (thisFileName, type, formatFile = null) => {
	const codeHash = getCodeHash(formatFile);

	const relativePath = path.relative(BASE_PATH, path.dirname(thisFileName));
	const cacheFolder = path.join(__dirname, `../../blocklists/cache/${type}`, relativePath);

	await fs.mkdir(cacheFolder, { recursive: true }).catch(err => console.error(`❌ Error creating cache folder: ${err}`));

	const cacheFilePath = path.join(cacheFolder, `${path.basename(thisFileName, '.txt')}.sha512`);
	const hashFromCacheFile = await fs.readFile(cacheFilePath, 'utf8').catch(() => null);

	const buff = await fs.readFile(thisFileName);
	const hash = `${codeHash}:${createHash('sha512').update(buff).digest('hex')}`;
	if (hash === hashFromCacheFile) {
		// console.log(`⏭️ ${hash} / ${type}:${path.basename(thisFileName)} / skipped`);
		return { stop: true };
	}

	try {
		await fs.writeFile(cacheFilePath, hash);
	} catch (err) {
		console.error(`❌ Error writing cache file ${cacheFilePath}: ${err}`);
		return { stop: true };
	}

	console.log(`✅ ${hash} -> ${type}:${path.basename(thisFileName)} / hashed`);
	return { stop: false, content: buff.toString('utf8') };
};
