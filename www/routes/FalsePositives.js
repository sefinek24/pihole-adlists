const router = require('express').Router();
const { body, query } = require('express-validator');
const FalsePositivesController = require('../controllers/FalsePositives.js');
const { blocklistCheck, falsePositiveSubmit } = require('../middleware/ratelimit.js');

const DOMAIN_REGEX = /^(\*\.)?([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

const domainValidation = field => field
	.trim()
	.toLowerCase()
	.notEmpty().withMessage('Domain is required.')
	.isLength({ max: 253 }).withMessage('Domain is too long.')
	.matches(DOMAIN_REGEX).withMessage('Invalid domain format.');

const domainQueryValidation = [domainValidation(query('domain'))];

const submitValidation = [
	body('reports')
		.isArray({ min: 1, max: 10 }).withMessage('Provide between 1 and 10 reports.'),
	domainValidation(body('reports.*.domain')),
	body('reports.*.reason')
		.trim()
		.notEmpty().withMessage('Reason is required.')
		.isLength({ min: 10, max: 2000 }).withMessage('Reason must be between 10 and 2000 characters.'),
	body('email')
		.trim()
		.optional({ values: 'falsy' })
		.isEmail().withMessage('Invalid email address.')
		.normalizeEmail(),
];

router.get('/false-positives', FalsePositivesController.page);
router.get('/api/v1/blocklist/check', blocklistCheck, domainQueryValidation, FalsePositivesController.check);
router.post('/api/v1/reports/false-positive', falsePositiveSubmit, submitValidation, FalsePositivesController.submit);

module.exports = router;
