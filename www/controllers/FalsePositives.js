const { validationResult } = require('express-validator');
const mailer = require('../services/mailer.js');
const domainSearch = require('../services/domainSearch.js');
const redis = require('../services/redis.js');

const FP_TTL = 5 * 24 * 60 * 60; // 5 days in seconds
const fpKey = domain => `fp:reported:${domain}`;

exports.page = (req, res) => res.render('false-positives.ejs');

exports.check = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ success: false, status: 400, message: errors.array()[0].msg });

	const domain = req.query.domain;

	try {
		const result = await domainSearch.searchDomain(domain);
		const count = result.matches.length;
		const message = result.found
			? `Domain found in ${count} source${count !== 1 ? 's' : ''}.`
			: 'Domain not found in any blocklist.';

		res.json({ success: true, status: 200, message, data: { domain, ...result } });
	} catch (err) {
		console.error('Domain lookup failed:', err.message);
		res.status(500).json({ success: false, status: 500, message: 'Lookup failed. Please try again later.' });
	}
};

exports.submit = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ success: false, status: 400, message: errors.array()[0].msg });

	const { domain, reason, email } = req.body;

	try {
		const [{ found, matches }, alreadyReported] = await Promise.all([
			domainSearch.searchDomain(domain),
			redis.exists(fpKey(domain)),
		]);

		if (!found) return res.status(422).json({ success: false, status: 422, message: 'Domain is not present in any blocklist. Only blocked domains can be reported.' });
		if (alreadyReported) return res.status(429).json({ success: false, status: 429, message: 'This domain has already been reported recently by you or someone else. Please wait about 5 days before submitting another report for the same domain. If you believe further action is necessary, please get in touch.' });

		const defanged = domain.replace(/\./g, '[.]');
		await mailer.sendMail({
			from: `Sefinek Blocklists <${process.env.MAILER_AUTH_USER}>`,
			to: process.env.MAILER_AUTH_USER,
			replyTo: email || undefined,
			subject: `False Positive Report - ${defanged}`,
			text: `A false positive report has been received for the domain ${defanged} through the form available at https://blocklist.sefinek.net/false-positives.

Reported domain:
${defanged}

Found in (${matches.length} matches):
${matches.map(m => `- https://blocklist.sefinek.net${m.siteUrl}`).join('\n')}

Report submitted: ${(d => `${d.toLocaleString('en-GB', { timeZone: 'Europe/Warsaw', dateStyle: 'full', timeStyle: 'medium' })} (${d.toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw', dateStyle: 'full', timeStyle: 'medium' })})`)(new Date())}

Reason provided by the reporter:
${reason}

Reply required: ${email ? 'Yes (note for recipient: your email address has not been stored anywhere and will never be processed by sefinek.net)' : 'No'}`,
		});

		await redis.set(fpKey(domain), '1', { EX: FP_TTL });
		res.json({ success: true, status: 200, message: 'Thank you! Your report has been submitted successfully.' });
	} catch (err) {
		console.error('Failed to send false positive report:', err.message);
		res.status(500).json({ success: false, status: 500, message: 'Failed to send the report. Please try again or report this issue.' });
	}
};
