'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { CATEGORIES } = require('../generate/file-processor/scripts/data.js');
const METADATA = require('../generate/file-processor/scripts/metadata.js');
const generateHeader = require('../generate/file-processor/scripts/generateHeader.js');

const CATEGORIES_MAP = new Map(CATEGORIES.map(c => [c.file, c]));

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

	// CATEGORIES (auto-generated lists) take highest priority
	const cat = CATEGORIES_MAP.get(rel);
	if (cat) return generateHeader(cat.title, cat.description, count, { license: 'CC BY-NC-ND 4.0' });

	// File-level metadata declared via # @key: value lines in the template
	if (fileMeta.title) {
		return generateHeader(
			fileMeta.title,
			fileMeta.description || null,
			count,
			{ modifiedBy: fileMeta.modifiedBy, source: fileMeta.source, license: fileMeta.license }
		);
	}

	// Fallback: metadata.js (fork files) + source URL from download.sh
	const meta = METADATA[rel] || {};
	return generateHeader(
		meta.title || 'Unknown',
		meta.description || null,
		count,
		{ modifiedBy: meta.modifiedBy, source: SOURCES[rel] || null, license: meta.license }
	);
};
