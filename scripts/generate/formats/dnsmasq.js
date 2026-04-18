const createFormat = require('../runner.js');

const run = createFormat({
	format: 'dnsmasq',
	release: 'Dnsmasq',
	transform: d => `server=/${d}/`,
	codeFile: __filename,
});

if (require.main === module) void run();
module.exports = run;
