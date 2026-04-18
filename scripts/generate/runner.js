const fs = require('node:fs/promises');
const path = require('node:path');
const splitFile = require('./file-processor/split.js');
const getDate = require('../utils/date.js');
const sha256 = require('../utils/hashCache.js');
const txtFilter = require('../utils/txtFilter.js');
const processDir = require('../utils/process.js');
const buildHeader = require('../utils/buildHeader.js');

const TEMPLATES_DIR = path.join(__dirname, '../../blocklists/templates');

/**
 * Creates a format-conversion runner for a given output format.
 *
 * @param {object} opts
 * @param {string}   opts.format         - Format name passed to txtFilter/hashCache (e.g. 'noip', 'adguard').
 * @param {string}   opts.release        - Value substituted for <Release> in the header.
 * @param {string}   [opts.commentChar]  - Comment character used in split-file parts (default: '#').
 * @param {string}   [opts.ext]          - Output file extension (default: '.txt').
 * @param {Function} [opts.transform]    - Maps a single domain string to its output line.
 * @param {Function} [opts.buildDomains] - Replaces transform; maps domain[] → outputLine[].
 * @param {Function} [opts.headerTransform] - Post-processes the generated header string.
 * @param {string}   [opts.prefix]       - Static string prepended before the header (e.g. 'server:\n').
 * @param {Function} [opts.buildPrefix]  - Dynamic prefix builder; receives date object, overrides prefix.
 */
module.exports = ({ format, release, commentChar = '#', ext = '.txt', transform, buildDomains, headerTransform, prefix, buildPrefix }) => {
	const convert = async (folderPath = TEMPLATES_DIR, relativePath = '') => {
		const { allFiles, txtFiles, generatedPath } = await txtFilter(format, path, fs, relativePath, folderPath);

		await Promise.all(txtFiles.map(async file => {
			const thisFileName = path.join(folderPath, file.name);

			const { stop, content: rawContent } = await sha256(thisFileName, format);
			if (stop) return;

			const rawLines = rawContent.split(/\r?\n/);
			const fileMeta = {};
			for (const line of rawLines) {
				if (!line.startsWith('#')) break;
				const m = line.match(/^#\s*@(\w+):\s*(.+)/);
				if (m) fileMeta[m[1]] = m[2].trim();
			}

			const rawDomains = rawLines.filter(l => l && !l.startsWith('#'));
			const relPath = path.relative(TEMPLATES_DIR, thisFileName);
			let header = buildHeader(relPath, rawDomains.length, fileMeta);
			if (headerTransform) header = headerTransform(header);

			const date = getDate();
			const domainLines = buildDomains ? buildDomains(rawDomains) : rawDomains.map(transform);
			const pre = buildPrefix ? buildPrefix(date) : (prefix || '');

			const output = [pre + header, ...domainLines].join('\n')
				.replace('{Release}', release)
				.replace('{LastUpdate}', `${date.full} | ${date.now}`) + '\n';

			const outName = ext !== '.txt' ? file.name.replace('.txt', ext) : file.name;
			const fullNewFile = path.join(generatedPath, outName);
			await fs.writeFile(fullNewFile, output);

			await splitFile(fullNewFile, output, commentChar, pre || null);
		}));

		await processDir(convert, allFiles, path, relativePath, folderPath);
	};

	return async () => {
		await convert();
		console.log('\n');
	};
};
