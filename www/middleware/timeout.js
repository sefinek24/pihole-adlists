const timeout = require('express-timeout-handler');
const { onTimeout } = require('./other/errors.js');

module.exports = () => timeout.handler({
	timeout: 10000,
	onTimeout,
	disable: ['write', 'setHeaders', 'send', 'json', 'end'],
});