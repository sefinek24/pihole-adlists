const { validationResult } = require('express-validator');
const mailer = require('../services/mailer.js');
const domainSearch = require('../services/domainSearch.js');
const RedisClient = require('../services/redis.js');

const FP_TTL = 5 * 24 * 60 * 60; // 5 days in seconds
const fpKey = domain => `fp:reported:${domain}`;
const FROM = `Sefinek Blocklists <${process.env.MAILER_AUTH_USER}>`;

exports.page = (req, res) => res.render('false-positives.ejs');

exports.check = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(400).json({ success: false, status: 400, message: errors.array()[0].msg });

	const domain = req.query.domain;

	try {
		const result = await domainSearch.searchDomain(domain);
		const count = (result.matches ?? []).length;
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

	const { reports, email } = req.body;

	try {
		const results = await Promise.all(
			reports.map(async ({ domain, reason }) => {
				const [searchResult, alreadyReported] = await Promise.all([
					domainSearch.searchDomain(domain),
					RedisClient.exists(fpKey(domain)),
				]);
				return { domain, reason, ...searchResult, alreadyReported };
			})
		);

		const reportable = results.filter(r => r.found && !r.alreadyReported);
		if (!reportable.length) {
			const foundDomains = results.filter(r => r.found);
			const allAlreadyReported = foundDomains.length > 0 && foundDomains.every(r => r.alreadyReported);
			const status = allAlreadyReported ? 429 : 422;
			const message = allAlreadyReported
				? 'All provided domains have already been reported recently. Please wait about 5 days before submitting another report.'
				: 'None of the provided domains are present in any blocklist. Only blocked domains can be reported.';
			return res.status(status).json({ success: false, status, message });
		}

		const now = new Date();
		const dateStr = `${now.toLocaleString('en-GB', { timeZone: 'Europe/Warsaw', dateStyle: 'full', timeStyle: 'medium' })} (${now.toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw', dateStyle: 'full', timeStyle: 'medium' })})`;

		const domainBlocksHtml = reportable.map(r => {
			const defanged = r.domain.replace(/\./g, '[.]');
			const matches = r.matches ?? [];
			const matchListHtml = matches.map(m => `<li><a href="https://blocklist.sefinek.net${m.siteUrl}">https://blocklist.sefinek.net${m.siteUrl}</a></li>`).join('');
			return `<b>Domain:</b> ${defanged}<br><b>Found in (${matches.length} ${matches.length !== 1 ? 'matches' : 'match'}):</b><ul>${matchListHtml}</ul><b>Reason:</b><br>${r.reason.replace(/\n/g, '<br>')}`;
		}).join('<hr>');

		const confirmationMessageId = email
			? `<fp-${Date.now()}-${Math.random().toString(36).slice(2)}@blocklist.sefinek.net>`
			: undefined;

		await mailer.sendMail({
			from: FROM,
			to: process.env.MAILER_AUTH_USER,
			replyTo: email || undefined,
			subject: `False Positive Report (${reportable.length} ${reportable.length !== 1 ? 'domains' : 'domain'})`,
			...(confirmationMessageId && {
				headers: {
					'In-Reply-To': confirmationMessageId,
					'References': confirmationMessageId,
				},
			}),
			html: `<p>A false positive report for ${reportable.length} ${reportable.length !== 1 ? 'domains' : 'domain'} has been received via <a href="https://blocklist.sefinek.net/false-positives">blocklist.sefinek.net/false-positives</a>.</p>
<b>Date:</b> ${dateStr}<br>
<b>Reply required:</b> ${email ? 'Yes' : 'No'}<br>
<br><br>
${domainBlocksHtml}`,
		});

		Promise.all(reportable.map(r => RedisClient.set(fpKey(r.domain), '1', { EX: FP_TTL })))
			.catch(err => console.error('Failed to set FP dedup keys in Redis:', err.message));

		if (email) {
			mailer.sendMail({
				from: FROM,
				to: email,
				messageId: confirmationMessageId,
				subject: 'Your false positive report has been received',
				html: `<p>Hi!</p>
<p>Thank you for submitting a false positive report to <a href="https://blocklist.sefinek.net">Sefinek Blocklist Collection</a>. We have received your submission and will review it as soon as possible.</p>
<b>What happens next?</b><br>
<p>
	We will analyze each reported domain (${reportable.length}) to determine whether blocking it is actually justified. If your report turns out to be valid, the ${reportable.length !== 1 ? 'domains will be removed from the blocklist' : 'domain will be removed from the blocklist'}. If we have any doubts, we may reach out to you for additional information — that is exactly why it was worth providing your email address. 😊<br><br>
	No further action is required on your end. Please be patient — verification may take anywhere from a few hours to a few days depending on the current volume of reports.<br><br>
	Have questions or want to add something? Feel free to reply to this email or join our <a href="https://discord.gg/53DBjTuzgZ">Discord server</a>.
</p>
<p><small><b>P.S.</b> Your email address was used solely to send this confirmation. It will not be stored in any database, will not be processed by <a href="https://sefinek.net">sefinek.net</a> in any other way, and will not be used for any other purpose.</small></p>
<hr>
${domainBlocksHtml}`,
			}).catch(err => console.error('Failed to send FP confirmation email:', err.message));
		}

		const count = reportable.length;
		res.json({ success: true, status: 200, message: `Thank you! Your report for ${count} domain${count !== 1 ? 's' : ''} has been submitted successfully.` });
	} catch (err) {
		console.error('Failed to send false positive report:', err.message);
		res.status(500).json({ success: false, status: 500, message: 'Failed to send the report. Please try again or report this issue.' });
	}
};
