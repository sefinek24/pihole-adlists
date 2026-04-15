const createFormat = require('./runner.js');

const run = createFormat({
	format: 'noip',
	release: 'No IP (only domains)',
	transform: d => d,
});

void run();
module.exports = run;
