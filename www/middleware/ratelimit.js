const rateLimit = require('express-rate-limit');
const error = require('./other/errors.js');

const limiter = rateLimit({
	windowMs: 2 * 60 * 1000,
	limit: 225,
	standardHeaders: 'draft-7',
	legacyHeaders: false,

	skip: () => process.env.NODE_ENV === 'development',
	handler: (req, res) => error.rateLimit(req, res),
});

module.exports = limiter;