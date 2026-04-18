const createFormat = require('./runner.js');

const formats = [
	createFormat({
		format: 'noip',
		release: 'No IP (only domains)',
		transform: d => d,
		codeFile: __filename,
	}),
	createFormat({
		format: '0.0.0.0',
		release: '0.0.0.0 before each domain',
		transform: d => `0.0.0.0 ${d}`,
		codeFile: __filename,
	}),
	createFormat({
		format: '127.0.0.1',
		release: '127.0.0.1 before each domain',
		transform: d => `127.0.0.1 ${d}`,
		codeFile: __filename,
	}),
	createFormat({
		format: 'adguard',
		release: 'AdGuard [adguard.com]',
		commentChar: '!',
		headerTransform: h => h.replace(/^#/gm, '!'),
		transform: d => `||${d}^`,
		codeFile: __filename,
	}),
	createFormat({
		format: 'dnsmasq',
		release: 'Dnsmasq',
		transform: d => `server=/${d}/`,
		codeFile: __filename,
	}),
	createFormat({
		format: 'rpz',
		release: 'RPZ',
		commentChar: ';',
		headerTransform: h => h.replace(/^#/gm, ';'),
		buildPrefix: date => `$TTL 300\n@ SOA localhost. root.localhost. ${date.serialNumber} 43200 3600 259200 300\n  NS  localhost.\n`,
		buildDomains: domains => {
			const seen = new Set();
			const out = [];
			for (const d of domains) {
				const base = d.startsWith('www.') ? d.slice(4) : d;
				if (!seen.has(base)) {
					seen.add(base);
					out.push(`${base} CNAME .`, `*.${base} CNAME .`);
				}
			}
			return out;
		},
		codeFile: __filename,
	}),
	createFormat({
		format: 'unbound',
		release: 'Unbound',
		ext: '.conf',
		prefix: 'server:\n',
		transform: d => `local-zone: "${d}." always_nxdomain`,
		codeFile: __filename,
	}),
];

Promise.all(formats.map(run => run())).catch(err => {
	console.error('Fatal:', err);
	process.exitCode = 1;
});
