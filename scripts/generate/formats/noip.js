const createFormat = require('../runner.js');

const run = createFormat({
	format: 'noip',
	release: 'No IP (only domains)',
	transform: d => d,
	codeFile: __filename,
});

if (require.main === module) void run();
module.exports = run;
