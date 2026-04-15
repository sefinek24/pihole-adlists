const createFormat = require('./runner.js');

const run = createFormat({
	format: 'adguard',
	release: 'AdGuard [adguard.com]',
	commentChar: '!',
	headerTransform: h => h.replace(/^#/gm, '!'),
	transform: d => `||${d}^`,
});

void run();
module.exports = run;
