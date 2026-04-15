'use strict';

const { CATEGORIES } = require('../generate/file-processor/scripts/data.js');
const METADATA = require('../generate/file-processor/scripts/metadata.js');
const generateHeader = require('../generate/file-processor/scripts/generateHeader.js');

const CATEGORIES_MAP = new Map(CATEGORIES.map(c => [c.file, c]));

module.exports = (relPath, count) => {
	const rel = relPath.replace(/\\/g, '/');

	const cat = CATEGORIES_MAP.get(rel);
	if (cat) return generateHeader(cat.title, cat.description, count, { license: 'CC BY-NC-ND 4.0' });

	const meta = METADATA[rel] || {};
	return generateHeader(
		meta.title || 'Unknown',
		meta.description || null,
		count,
		{ modifiedBy: meta.modifiedBy, source: meta.source, license: meta.license }
	);
};
