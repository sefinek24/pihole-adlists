const createFormat = require('../runner.js');

const run = createFormat({
	format: 'adguard',
	release: 'AdGuard [adguard.com]',
	commentChar: '!',
	headerTransform: h => h.replace(/^#/gm, '!'),
	transform: d => `||${d}^`,
	codeFile: __filename,
});

if (require.main === module) void run();
module.exports = run;
