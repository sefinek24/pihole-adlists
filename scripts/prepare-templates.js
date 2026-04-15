const { copyFile, mkdir, readdir, readFile, writeFile } = require('node:fs/promises');
const { join, relative } = require('node:path');
const validator = require('validator');
const local = require('./utils/local.js');

const TEMPLATES_DIR = join(__dirname, '..', 'blocklists', 'templates');
const FORK_HEADERS_PATH = join(__dirname, '..', 'blocklists', 'cache', 'fork-headers.json');

const emoji = key => ({
	modifiedLines: '🔧', convertedDomains: '✨', invalidLinesRemoved: '🧹',
	ipsReplaced: '🔄', domainToLower: '🔡', convertedAdGuard: '🔄',
	splitMultiDomain: '✂️', normalizedSpacing: '🔃', fixedGlued: '🩹',
	fqdnConverted: '🌐', portRemoved: '🔪',
}[key] || '');

const isSuspiciousDomain = domain =>
	typeof domain !== 'string' ||
	domain.length > 255 ||
	(domain.match(/\./g) || []).length > 32 ||
	!(/^[a-z0-9._-]+$/i).test(domain);

// Parses a single header comment line from a fork file.
// Returns { key, value } for "# Key: value" lines, or { title } for plain lines.
const parseForkLine = (line, hasTitleAlready) => {
	const kv = line.match(/^#\s+(\w[^:\n]{1,40}):\s+(.+)/);
	if (kv) {
		const key = kv[1].trim().toLowerCase().replace(/[\s-]+/g, '_');
		return { key, value: kv[2].trim() };
	}
	if (!hasTitleAlready) {
		const plain = line.replace(/^[#!]\s*/, '').trim();
		if (plain && plain.length > 3 && !(/^\d{8,}/).test(plain)) {
			return { key: 'title', value: plain };
		}
	}
	return null;
};

const processDirectory = async (dirPath, forkHeaders) => {
	try {
		await mkdir(dirPath, { recursive: true });
		const allEntries = await readdir(dirPath, { withFileTypes: true });
		const fileNames = allEntries.filter(e => e.isFile() && e.name.endsWith('.txt')).map(e => e.name);

		for (const fileName of fileNames) {
			const filePath = join(dirPath, fileName);
			const fileContents = await readFile(filePath, 'utf8');
			const lines = fileContents.split('\n');

			const isFork = fileName.endsWith('.fork.txt');
			const parsedForkMeta = {};

			const stats = {
				modifiedLines: 0, convertedDomains: 0, invalidLinesRemoved: 0, ipsReplaced: 0,
				domainToLower: 0, convertedAdGuard: 0, splitMultiDomain: 0, normalizedSpacing: 0,
				fixedGlued: 0, fqdnConverted: 0, portRemoved: 0,
			};

			const processedLines = [];

			for (let line of lines) {
				line = line.trim();
				if (!line || line === '0.0.0.0' || line === '127.0.0.1' || line === '0.0.0.0 0.0.0.0') {
					stats.invalidLinesRemoved++;
					continue;
				}

				if (line.startsWith('#') || line.startsWith('!')) {
					if ((/^#\s*@\w+:/).test(line)) {
						processedLines.push(line);
					} else {
						if (isFork) {
							const parsed = parseForkLine(line, 'title' in parsedForkMeta);
							if (parsed) parsedForkMeta[parsed.key] = parsed.value;
						}
						stats.invalidLinesRemoved++;
					}
					continue;
				}

				// Keep local network patterns
				if (local.test(line)) {
					processedLines.push(line);
					continue;
				}

				// Remove inline comments FIRST: example.com # comment → example.com
				if (line.includes('#')) {
					const withoutComment = line.split('#')[0].trim();
					if (withoutComment && withoutComment !== line.trim()) {
						line = withoutComment;
						stats.modifiedLines++;
					}
				}

				// Remove IP prefixes: 127.0.0.1 domain → domain, 0.0.0.0 domain → domain
				if ((/^(?:127\.0\.0\.1|0\.0\.0\.0|195\.187\.6\.3[3-5])\s+/).test(line)) {
					line = line.replace(/^(?:127\.0\.0\.1|0\.0\.0\.0|195\.187\.6\.3[3-5])\s+/, '');
					stats.ipsReplaced++;
					stats.modifiedLines++;
				}

				// ||example.com^ → example.com
				if (line.startsWith('||') && line.endsWith('^')) {
					line = line.slice(2, -1);
					stats.modifiedLines++;
					stats.convertedAdGuard++;
				}

				// example.com/ → example.com
				if (line.endsWith('/')) {
					line = line.slice(0, -1);
					stats.modifiedLines++;
				}

				// 0.0.0.0example.com → example.com (fix glued IP)
				const gluedIpMatch = line.match(/^(?:127\.0\.0\.1|0\.0\.0\.0)([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/);
				if (gluedIpMatch) {
					line = gluedIpMatch[1];
					stats.modifiedLines++;
					stats.fixedGlued++;
				}

				// EXAMPLE.com → example.com
				const lowerDomain = line.toLowerCase();
				if (line !== lowerDomain) {
					line = lowerDomain;
					stats.modifiedLines++;
					stats.domainToLower++;
				}

				// example.com:1234 → example.com
				const domainNoPort = line.split(':')[0];
				if (line !== domainNoPort) {
					line = domainNoPort;
					stats.modifiedLines++;
					stats.portRemoved++;
				}

				// example1.com example2.com → split into multiple lines
				if (line.includes(' ')) {
					const words = line.split(/\s+/);
					if (words.length > 1) {
						const uniqueDomains = [...new Set(words)];

						const splitLines = uniqueDomains.filter(domain => {
							if (!validator.isFQDN(domain, { allow_underscores: true }) || isSuspiciousDomain(domain)) {
								stats.invalidLinesRemoved++;
								return false;
							}
							return true;
						});

						const duplicatesRemoved = words.length - uniqueDomains.length;
						if (duplicatesRemoved > 0) stats.invalidLinesRemoved += duplicatesRemoved;

						stats.modifiedLines++;
						stats.splitMultiDomain += splitLines.length;
						processedLines.push(...splitLines);
						continue;
					}
				}

				// Final validation
				if (!validator.isFQDN(line, { allow_underscores: true }) || isSuspiciousDomain(line)) {
					stats.invalidLinesRemoved++;
					continue;
				}

				processedLines.push(line);
			}

			// Persist fork metadata if we found anything new
			if (isFork && Object.keys(parsedForkMeta).length > 0) {
				const relKey = relative(TEMPLATES_DIR, filePath).replace(/\\/g, '/');
				forkHeaders[relKey] = { ...forkHeaders[relKey], ...parsedForkMeta };
			}

			// Summary
			if (Object.values(stats).some(Boolean)) {
				await writeFile(filePath, processedLines.join('\n'), 'utf8');

				console.log('📝', filePath);
				Object.entries(stats).forEach(([k, v]) => {
					if (v) console.log(`   ${emoji(k)} ${v} ${k.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
				});
			}
		}

		const subDirs = allEntries.filter(d => d.isDirectory());
		for (const sub of subDirs) {
			await processDirectory(join(dirPath, sub.name), forkHeaders);
		}
	} catch (err) {
		console.error(`❌ Error processing ${dirPath}:`, err);
	}
};

const copyDirectory = async (src, dest) => {
	await mkdir(dest, { recursive: true });
	const entries = await readdir(src, { withFileTypes: true });
	await Promise.all(entries.map(async entry => {
		const srcPath = join(src, entry.name);
		const destPath = join(dest, entry.name);
		if (entry.isDirectory()) {
			await copyDirectory(srcPath, destPath);
		} else {
			await copyFile(srcPath, destPath);
		}
	}));
};

(async () => {
	try {
		const listsDir = join(__dirname, '..', 'lists');

		// Load existing fork headers to preserve data from previous runs
		// (headers are stripped after first processing, so we merge rather than overwrite)
		let forkHeaders = {};
		try {
			forkHeaders = JSON.parse(await readFile(FORK_HEADERS_PATH, 'utf8'));
		} catch { /* first run or cache missing — start fresh */ }

		await copyDirectory(listsDir, TEMPLATES_DIR);
		await processDirectory(TEMPLATES_DIR, forkHeaders);

		await mkdir(join(__dirname, '..', 'blocklists', 'cache'), { recursive: true });
		await writeFile(FORK_HEADERS_PATH, JSON.stringify(forkHeaders, null, '\t'), 'utf8');
		console.log(`\n📋 Fork headers saved for ${Object.keys(forkHeaders).length} files → ${FORK_HEADERS_PATH}`);
	} catch (err) {
		console.error('❌ Fatal error:', err);
	}
})();
