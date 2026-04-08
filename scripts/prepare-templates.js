const { copyFile, mkdir, readdir, readFile, writeFile } = require('node:fs/promises');
const { join } = require('node:path');
const validator = require('validator');
const local = require('./utils/local.js');

const emoji = key => ({
	modifiedLines: '🔧', convertedDomains: '✨', invalidLinesRemoved: '🧹',
	ipsReplaced: '🔄', domainToLower: '🔡', convertedAdGuard: '🔄',
	splitMultiDomain: '✂️', normalizedSpacing: '🔃', fixedGlued: '🩹',
	commentsConverted: '💬', fqdnConverted: '🌐', portRemoved: '🔪',
}[key] || '');

const isSuspiciousDomain = domain =>
	typeof domain !== 'string' ||
	domain.length > 255 ||
	(domain.match(/\./g) || []).length > 32 ||
	!(/^[a-z0-9._-]+$/i).test(domain);

const processDirectory = async dirPath => {
	try {
		await mkdir(dirPath, { recursive: true });
		const fileNames = (await readdir(dirPath)).filter(name => name.endsWith('.txt'));

		for (const fileName of fileNames) {
			const filePath = join(dirPath, fileName);
			const fileContents = await readFile(filePath, 'utf8');
			const lines = fileContents.split('\n');

			const stats = {
				modifiedLines: 0, convertedDomains: 0, invalidLinesRemoved: 0, ipsReplaced: 0,
				domainToLower: 0, convertedAdGuard: 0, splitMultiDomain: 0, normalizedSpacing: 0,
				fixedGlued: 0, commentsConverted: 0, fqdnConverted: 0, portRemoved: 0,
			};

			const processedLines = [];

			for (let line of lines) {
				line = line.trim();
				if (!line || line === '0.0.0.0' || line === '127.0.0.1' || line === '0.0.0.0 0.0.0.0') {
					stats.invalidLinesRemoved++;
					continue;
				}

				// Keep only header comments (multi-line comments, decorative headers, metadata)
				// Remove commented domains (e.g., "# example.com" or "! example.com")
				if (line.startsWith('#')) {
					// Check if it's a commented domain (# followed by domain-like pattern)
					const afterHash = line.substring(1).trim();
					// Skip if it's a URL (contains ://) or path (contains /)
					const isUrl = afterHash.includes('://') || afterHash.includes('/');
					// Domain pattern: no spaces, has dot, not starting with =, not a URL
					const isDomain = afterHash && !afterHash.includes(' ') && afterHash.includes('.') && !afterHash.startsWith('=') && !isUrl;
					if (isDomain) {
						// Looks like a commented domain, skip it
						stats.invalidLinesRemoved++;
						continue;
					}
					// Keep as header/metadata comment
					processedLines.push(line);
					continue;
				}

				// Remove commented AdBlock domains (! example.com)
				if (line.startsWith('!')) {
					const afterExclamation = line.substring(1).trim();
					// Skip URLs completely (don't convert to #)
					if (afterExclamation.startsWith('http') || afterExclamation.includes('://')) {
						stats.invalidLinesRemoved++;
						continue;
					}
					const isUrl = afterExclamation.includes('/');
					const isDomain = afterExclamation && !afterExclamation.includes(' ') && afterExclamation.includes('.') && !isUrl;
					if (isDomain) {
						// Looks like a commented domain, skip it
						stats.invalidLinesRemoved++;
						continue;
					}
					// Convert AdBlock comment to standard comment
					line = line.replace(/^!+/, '#');
					if (line === '# Syntax: Adblock Plus Filter List') line = '# Syntax: domain.tld';
					stats.modifiedLines++;
					stats.commentsConverted++;
					processedLines.push(line);
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

			// Summary
			if (Object.values(stats).some(Boolean)) {
				await writeFile(filePath, processedLines.join('\n'), 'utf8');

				console.log('📝', filePath);
				Object.entries(stats).forEach(([k, v]) => {
					if (v) console.log(`   ${emoji(k)} ${v} ${k.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
				});
			}
		}

		const subDirs = (await readdir(dirPath, { withFileTypes: true })).filter(d => d.isDirectory());
		for (const sub of subDirs) {
			await processDirectory(join(dirPath, sub.name));
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
		const templatesDir = join(__dirname, '..', 'blocklists', 'templates');
		await copyDirectory(listsDir, templatesDir);
		await processDirectory(templatesDir);
	} catch (err) {
		console.error('❌ Fatal error:', err);
	}
})();