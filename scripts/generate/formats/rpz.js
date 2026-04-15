const createFormat = require('../runner.js');

const run = createFormat({
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
});

void run();
module.exports = run;
