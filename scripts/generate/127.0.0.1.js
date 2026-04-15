const createFormat = require('./runner.js');

const run = createFormat({
	format: '127.0.0.1',
	release: '127.0.0.1 before each domain',
	transform: d => `127.0.0.1 ${d}`,
});

void run();
module.exports = run;
