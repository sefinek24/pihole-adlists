const fs = require('node:fs');
const path = require('node:path');
const METADATA = require('../config/metadata.js');
const generateHeader = require('./generateHeader.js');

const SOURCES = (() => {
	const map = {};
	try {
		const bash = fs.readFileSync(path.join(__dirname, '../../bash/download.sh'), 'utf8');
		const re = /"(https?:\/\/\S+)\s+([\w./@%-]+\.(?:fork\.)?txt)"/g;
		let m;
		while ((m = re.exec(bash)) !== null) map[m[2]] = m[1];
	} catch {
		// download.sh not present (e.g. in isolated test environments)
	}
	return map;
})();

module.exports = (relPath, count, fileMeta = {}) => {
	const rel = relPath.replace(/\\/g, '/');
	const meta = METADATA[rel] || {};
	const isFork = rel.endsWith('.fork.txt');

	const homepageUrl = fileMeta.homepage || meta.homepage || null;
	const sourceUrl = SOURCES[rel] || null;
	const source = sourceUrl || homepageUrl || (isFork ? 'Unknown source (external list)' : null);

	return generateHeader(
		meta.title || fileMeta.title || null,
		meta.description || fileMeta.description || null,
		count,
		{
			modifiedBy: fileMeta.modifiedBy || meta.modifiedBy,
			source,
			homepage: sourceUrl && homepageUrl ? homepageUrl : null,
			license: fileMeta.license || meta.license,
		}
	);
};
