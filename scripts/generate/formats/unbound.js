const createFormat = require('../runner.js');

const run = createFormat({
	format: 'unbound',
	release: 'Unbound',
	ext: '.conf',
	prefix: 'server:\n',
	transform: d => `local-zone: "${d}." always_nxdomain`,
});

void run();
module.exports = run;
