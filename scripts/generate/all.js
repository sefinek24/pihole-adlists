'use strict';

const formats = ['noip', '0.0.0.0', '127.0.0.1', 'adguard', 'dnsmasq', 'rpz', 'unbound'];

Promise.all(formats.map(f => require(`./formats/${f}.js`)())).catch(err => {
	console.error('Fatal:', err);
	process.exitCode = 1;
});
