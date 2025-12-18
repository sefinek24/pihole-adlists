const { mkdir, readdir, readFile, writeFile } = require('node:fs/promises');
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
				if (!line || line === '0.0.0.0' || line === '127.0.0.1') {
					stats.invalidLinesRemoved++;
					continue;
				}

				if (local.test(line) || line.startsWith('#')) {
					processedLines.push(line);
					continue;
				}

				// ! comment → # comment
				if (line.startsWith('!')) {
					line = line.replace(/^!+/, '#');
					if (line === '# Syntax: Adblock Plus Filter List') line = '# Syntax: domain.tld';
					stats.modifiedLines++;
					stats.commentsConverted++;
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
				const gluedIpMatch = line.match(/^(?:127\.0\.0\.1|0\.0\.0\.0)([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(\s+.*)?$/);
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
				if (!line.includes('#') && line.includes(' ')) {
					const words = line.split(/\s+/);
					if (words.length > 1) {
						const uniqueDomains = [...new Set(words.map(d => d.toLowerCase().split(':')[0]))];

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

(async () => {
	try {
		await processDirectory(join(__dirname, '..', 'blocklists', 'templates'));
	} catch (err) {
		console.error('❌ Fatal error:', err);
	}
})();