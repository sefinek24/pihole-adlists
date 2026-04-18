const createFormat = require('../runner.js');

const run = createFormat({
	format: 'unbound',
	release: 'Unbound',
	ext: '.conf',
	prefix: 'server:\n',
	transform: d => `local-zone: "${d}." always_nxdomain`,
	codeFile: __filename,
});

if (require.main === module) void run();
module.exports = run;
