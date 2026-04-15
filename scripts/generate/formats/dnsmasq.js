const createFormat = require('../runner.js');

const run = createFormat({
	format: 'dnsmasq',
	release: 'Dnsmasq',
	transform: d => `server=/${d}/`,
});

void run();
module.exports = run;
