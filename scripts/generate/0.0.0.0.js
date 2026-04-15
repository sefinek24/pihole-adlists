const createFormat = require('./runner.js');

const run = createFormat({
	format: '0.0.0.0',
	release: '0.0.0.0 before each domain',
	transform: d => `0.0.0.0 ${d}`,
});

void run();
module.exports = run;
