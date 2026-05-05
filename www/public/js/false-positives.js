(() => {
	'use strict';

	const scriptEl = document.currentScript;

	const form = document.getElementById('reportForm');
	const submitBtn = document.getElementById('checkBtn');
	const domainsEl = document.getElementById('domains');
	const reasonsContainer = document.getElementById('reasons-container');
	const modal = document.getElementById('fpModal');
	const modalBackdrop = document.getElementById('fpModalBackdrop');
	const modalTitle = document.getElementById('fpModalTitle');
	const modalStatus = document.getElementById('fpModalStatus');
	const modalMatches = document.getElementById('fpModalMatches');
	const modalIcon = document.getElementById('fpModalIcon');
	const modalClose = document.getElementById('fpModalClose');
	const modalCancel = document.getElementById('fpModalCancel');
	const modalClearClose = document.getElementById('fpModalClearClose');

	const DOMAIN_REGEX = /^(\*\.)?([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
	const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

	// ── Domain parsing ────────────────────────────────────────────────────────
	const parseDomains = () =>
		domainsEl.value.split(/[\n,]+/).map(d => d.trim().toLowerCase()).filter(Boolean);

	// ── Per-domain state ──────────────────────────────────────────────────────
	// Map<domain, { status: 'checking'|'found'|'notfound'|'error', matches: [], error: string|null }>
	const domainCheckState = new Map();

	// Map<domain, reasonString>
	const reasonValues = new Map();

	// ── URL params persistence ─────────────────────────────────────────────────

	let syncTimer;
	const syncToUrl = () => {
		clearTimeout(syncTimer);
		syncTimer = setTimeout(() => {
			const params = new URLSearchParams();
			const domains = domainsEl.value.trim();
			const email = form.email.value.trim();
			if (domains) params.set('domains', btoa(domains));
			if (reasonValues.size) params.set('reasons', btoa(JSON.stringify(Object.fromEntries(reasonValues))));
			if (email) params.set('email', btoa(email));
			const qs = params.toString();
			history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
		}, 400);
	};

	const restoreFromUrl = () => {
		const params = new URLSearchParams(location.search);
		const raw = params.get('domains') ?? params.get('domain');
		if (raw) try { domainsEl.value = atob(raw); } catch { /* ignore */ }
		if (params.has('reasons')) {
			try {
				const saved = JSON.parse(atob(params.get('reasons')));
				for (const [domain, reason] of Object.entries(saved)) reasonValues.set(domain, reason);
			} catch { /* ignore */ }
		}
		if (params.has('email')) try { form.email.value = atob(params.get('email')); } catch { /* ignore */ }
	};

	// ── Render domain rows ────────────────────────────────────────────────────

	const buildRowHtml = (domain, state) => {
		const e = esc(domain);
		const status = state?.status;

		if (!status || status === 'checking') {
			return `<div class="report-form__domain-row report-form__domain-row--checking" data-domain="${e}" data-status="checking">
				<div class="report-form__domain-header">
					<span class="fp-status-icon fp-status-icon--checking" aria-label="Checking"><span class="fp-spinner"></span></span>
					<span class="fp-domain-name">${e}</span>
					<span class="fp-domain-info">Checking...</span>
				</div>
			</div>`;
		}

		if (status === 'error') {
			return `<div class="report-form__domain-row report-form__domain-row--error" data-domain="${e}" data-status="error">
				<div class="report-form__domain-header">
					<span class="fp-status-icon fp-status-icon--error" aria-hidden="true">✗</span>
					<span class="fp-domain-name">${e}</span>
					<span class="fp-domain-info">${esc(state.error ?? 'Check failed')}</span>
				</div>
			</div>`;
		}

		if (status === 'notfound') {
			return `<div class="report-form__domain-row report-form__domain-row--notfound" data-domain="${e}" data-status="notfound">
				<div class="report-form__domain-header">
					<span class="fp-status-icon fp-status-icon--notfound" aria-hidden="true">✗</span>
					<span class="fp-domain-name">${e}</span>
					<span class="fp-domain-info">Not found in any blocklist</span>
				</div>
			</div>`;
		}

		// found
		const matches = state.matches ?? [];
		const count = matches.length;
		const matchId = `fp-matches-${domain.replace(/[^a-z0-9]/g, '-')}`;
		const matchItems = matches.map(m => `
			<li class="fp-match">
				<span class="fp-match__path">
					<span class="fp-match__category">${esc((m.category ?? '').replaceAll('-', ' '))}</span>
					${m.source ? `<span class="fp-match__sep">/</span><span class="fp-match__source">${esc(m.source)}</span>` : ''}
					${m.file ? `<span class="fp-match__sep">/</span><span class="fp-match__file">${esc(m.file)}</span>` : ''}
				</span>
				<span class="fp-match__links">
					<a href="${esc(m.siteUrl)}" target="_blank" rel="noopener">Site</a>
					<a href="${esc(m.githubUrl)}" target="_blank" rel="noopener">GitHub</a>
				</span>
			</li>`).join('');

		return `<div class="report-form__domain-row report-form__domain-row--found" data-domain="${e}" data-status="found">
			<div class="report-form__domain-header">
				<span class="fp-status-icon fp-status-icon--found" aria-hidden="true">✓</span>
				<span class="fp-domain-name">${e}</span>
				<span class="fp-domain-info">Found in ${count} list${count !== 1 ? 's' : ''}</span>
				<button class="fp-matches-toggle" type="button" aria-expanded="false" aria-controls="${matchId}">Show lists ▾</button>
			</div>
			<ul class="fp-matches-list" id="${matchId}" hidden>${matchItems}</ul>
			<div class="report-form__reason-item">
				<label class="report-form__label" for="reason-${e}">
					Reason for <span class="report-form__reason-domain">${e}</span>
					<span class="report-form__label-hint report-form__label-hint--reason" data-domain="${e}" aria-live="polite">*</span>
				</label>
				<textarea class="report-form__textarea report-form__reason-textarea"
					id="reason-${e}"
					data-domain="${e}"
					placeholder="Explain why ${e} should not be blocked (screenshots on Imgur are welcome)..."
					minlength="10" maxlength="2000" rows="3"></textarea>
			</div>
		</div>`;
	};

	// ── Submit button state ───────────────────────────────────────────────────
	const updateSubmitButton = () => {
		const domains = parseDomains().filter(d => DOMAIN_REGEX.test(d));

		if (!domains.length) {
			submitBtn.disabled = true;
			submitBtn.textContent = 'Send report';
			return;
		}

		const anyChecking = domains.some(d => {
			const s = domainCheckState.get(d)?.status;
			return !s || s === 'checking';
		});

		if (anyChecking) {
			submitBtn.disabled = true;
			submitBtn.textContent = 'Checking...';
			return;
		}

		const hasReady = domains
			.filter(d => domainCheckState.get(d)?.status === 'found')
			.some(d => (reasonValues.get(d) ?? '').trim().length >= 10);

		submitBtn.disabled = !hasReady;
		submitBtn.textContent = 'Send report';
	};

	const attachRowListeners = (domain, row) => {
		const toggle = row.querySelector('.fp-matches-toggle');
		if (toggle) {
			const list = document.getElementById(toggle.getAttribute('aria-controls'));
			toggle.addEventListener('click', () => {
				const expanded = toggle.getAttribute('aria-expanded') === 'true';
				toggle.setAttribute('aria-expanded', String(!expanded));
				toggle.textContent = expanded ? 'Show lists ▾' : 'Hide lists ▴';
				if (list) list.hidden = expanded;
			});
		}

		const textarea = row.querySelector(`textarea[data-domain="${domain}"]`);
		if (textarea) {
			if (reasonValues.has(domain)) textarea.value = reasonValues.get(domain);
			textarea.addEventListener('input', () => {
				reasonValues.set(domain, textarea.value);
				syncToUrl();
				updateSubmitButton();
			});
		}
	};

	const renderDomainRows = () => {
		const domains = parseDomains();

		// Clean up state for removed domains
		for (const key of reasonValues.keys()) {
			if (!domains.includes(key)) reasonValues.delete(key);
		}
		for (const key of domainCheckState.keys()) {
			if (!domains.includes(key)) domainCheckState.delete(key);
		}

		// Remove rows for domains no longer present
		for (const row of [...reasonsContainer.querySelectorAll('.report-form__domain-row')]) {
			if (!domains.includes(row.dataset.domain)) row.remove();
		}

		if (!domains.length) {
			updateSubmitButton();
			return;
		}

		for (let i = 0; i < domains.length; i++) {
			const domain = domains[i];
			const state = domainCheckState.get(domain);
			const newStatus = state?.status ?? 'checking';

			const row = reasonsContainer.querySelector(`.report-form__domain-row[data-domain="${domain}"]`);

			if (row && row.dataset.status === newStatus) {
				// Status unchanged — preserve DOM node, only fix order if needed
				const current = [...reasonsContainer.children].indexOf(row);
				if (current !== i) reasonsContainer.insertBefore(row, reasonsContainer.children[i] ?? null);
				continue;
			}

			// Status changed or row is new — replace/insert
			const tmp = document.createElement('div');
			tmp.innerHTML = buildRowHtml(domain, state);
			const newRow = tmp.firstElementChild;

			if (row) {
				row.replaceWith(newRow);
			} else {
				reasonsContainer.insertBefore(newRow, reasonsContainer.children[i] ?? null);
			}

			attachRowListeners(domain, newRow);
		}

		updateSubmitButton();
	};

	// ── Domain checking ───────────────────────────────────────────────────────
	let checkDebounceTimer;

	const checkAllDomains = () => {
		const domains = parseDomains();
		const toFetch = [];

		for (const domain of domains) {
			if (domainCheckState.has(domain)) continue;
			if (!DOMAIN_REGEX.test(domain)) {
				domainCheckState.set(domain, { status: 'error', matches: [], error: 'Invalid domain format' });
			} else {
				domainCheckState.set(domain, { status: 'checking', matches: [], error: null });
				toFetch.push(domain);
			}
		}

		renderDomainRows();

		for (const domain of toFetch) {
			fetch(`/api/v1/blocklist/check?domain=${encodeURIComponent(domain)}`)
				.then(res => res.json().then(json => ({ res, json })))
				.then(({ res, json }) => {
					domainCheckState.set(domain, {
						status: res.ok ? (json.data?.found ? 'found' : 'notfound') : 'error',
						matches: json.data?.matches ?? [],
						error: res.ok ? null : (json.message ?? 'Check failed'),
					});
				})
				.catch(() => {
					domainCheckState.set(domain, { status: 'error', matches: [], error: 'Network error' });
				})
				.finally(() => {
					renderDomainRows();
				});
		}
	};

	const scheduleCheck = () => {
		clearTimeout(checkDebounceTimer);
		checkDebounceTimer = setTimeout(checkAllDomains, 700);
	};

	// ── Validation helpers ────────────────────────────────────────────────────
	const domainsHint = document.getElementById('domains-hint');
	const emailHint = document.getElementById('email-hint');

	const setFieldError = (input, hint, origText, msg, timerRef) => {
		clearTimeout(timerRef.val);
		if (msg) {
			hint.textContent = `(${msg})`;
			hint.classList.add('report-form__label-hint--error');
			input.classList.add('report-form__input--error');
			timerRef.val = setTimeout(() => setFieldError(input, hint, origText, '', timerRef), 4000);
		} else {
			hint.textContent = origText;
			hint.classList.remove('report-form__label-hint--error');
			input.classList.remove('report-form__input--error');
		}
	};

	const domainsHintOrig = domainsHint.textContent;
	const emailHintOrig = emailHint.textContent;
	const domainsTimer = { val: null };
	const emailTimer = { val: null };

	const setReasonError = (domain, msg) => {
		const textarea = reasonsContainer.querySelector(`textarea[data-domain="${domain}"]`);
		const hint = reasonsContainer.querySelector(`.report-form__label-hint--reason[data-domain="${domain}"]`);
		if (!textarea || !hint) return;
		if (msg) {
			hint.textContent = `(${msg})`;
			hint.classList.add('report-form__label-hint--error');
			textarea.classList.add('report-form__input--error');
			setTimeout(() => setReasonError(domain, ''), 4000);
		} else {
			hint.textContent = '*';
			hint.classList.remove('report-form__label-hint--error');
			textarea.classList.remove('report-form__input--error');
		}
	};

	// ── Modal ─────────────────────────────────────────────────────────────────
	const openModal = () => {
		modal.hidden = false;
		modalClose.focus();
	};

	const closeModal = () => {
		modal.hidden = true;
		submitBtn.focus();
	};

	const setModalState = ({ title, status, statusClass, showClearClose = false }) => {
		if (title) modalTitle.textContent = title;
		modalStatus.textContent = status ?? '';

		const ok = statusClass === 'success';
		modalIcon.hidden = !statusClass;
		if (statusClass) {
			modalIcon.textContent = ok ? '✓' : '✗';
			modalIcon.className = ok ? 'fp-modal-icon--ok' : 'fp-modal-icon--err';
		}

		modalMatches.hidden = true;
		modalMatches.innerHTML = '';
		modalClearClose.hidden = !showClearClose;
	};

	modalClose.addEventListener('click', closeModal);
	modalCancel.addEventListener('click', closeModal);
	modalClearClose.addEventListener('click', () => {
		form.reset();
		reasonValues.clear();
		domainCheckState.clear();
		renderDomainRows();
		syncToUrl();
		closeModal();
	});
	modalBackdrop.addEventListener('click', closeModal);
	document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

	// ── Form submit ───────────────────────────────────────────────────────────
	form.addEventListener('submit', async e => {
		e.preventDefault();

		const domains = parseDomains();
		if (!domains.length) {
			setFieldError(domainsEl, domainsHint, domainsHintOrig, 'at least one domain is required', domainsTimer);
			return;
		}

		if (domains.length > 10) {
			setFieldError(domainsEl, domainsHint, domainsHintOrig, 'maximum 10 domains per report', domainsTimer);
			return;
		}

		const invalidDomain = domains.find(d => !DOMAIN_REGEX.test(d));
		if (invalidDomain) {
			setFieldError(domainsEl, domainsHint, domainsHintOrig, `invalid domain: ${invalidDomain}`, domainsTimer);
			return;
		}

		setFieldError(domainsEl, domainsHint, domainsHintOrig, '', domainsTimer);

		const email = form.email.value.trim();
		if (email && !EMAIL_REGEX.test(email)) {
			setFieldError(form.email, emailHint, emailHintOrig, 'invalid email address', emailTimer);
			return;
		}
		setFieldError(form.email, emailHint, emailHintOrig, '', emailTimer);

		const reports = domains
			.filter(d => domainCheckState.get(d)?.status === 'found')
			.map(domain => ({ domain, reason: (reasonValues.get(domain) ?? '').trim() }));

		let reasonValid = true;
		for (const { domain, reason } of reports) {
			if (!reason) {
				setReasonError(domain, 'reason is required');
				reasonValid = false;
			} else if (reason.length < 10) {
				setReasonError(domain, 'at least 10 characters');
				reasonValid = false;
			} else {
				setReasonError(domain, '');
			}
		}
		if (!reasonValid || !reports.length) return;

		submitBtn.disabled = true;
		submitBtn.textContent = 'Sending...';

		const t0 = performance.now();

		try {
			const res = await fetch('/api/v1/reports/false-positive', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ reports, email }),
			});

			const json = await res.json();
			const ms = Math.round(performance.now() - t0);

			if (json.success) {
				setModalState({ title: 'Report sent', status: `${json.message} Completed in ${ms}ms.`, statusClass: 'success' });
				form.reset();
				reasonValues.clear();
				domainCheckState.clear();
				renderDomainRows();
				syncToUrl();
			} else {
				setModalState({
					title: 'Something went wrong',
					status: `${json.message} The request took ${ms}ms.`,
					statusClass: 'error',
					showClearClose: res.status === 429,
				});
			}

			openModal();
		} catch {
			setModalState({ title: 'Error', status: 'Network error. Please try again.', statusClass: 'error' });
			openModal();
		} finally {
			submitBtn.disabled = false;
			updateSubmitButton();
		}
	});

	// ── Init ──────────────────────────────────────────────────────────────────
	restoreFromUrl();

	domainsEl.addEventListener('input', () => {
		const current = new Set(parseDomains());
		for (const key of domainCheckState.keys()) {
			if (!current.has(key)) domainCheckState.delete(key);
		}
		renderDomainRows();
		scheduleCheck();
		syncToUrl();
	});

	form.email.addEventListener('input', syncToUrl);

	if (domainsEl.value.trim()) {
		checkAllDomains();
	} else {
		renderDomainRows();
	}

	// ── Dev: autofill test data (AI-generated) ───────────────────────────────
	if (scriptEl?.dataset.env === 'development') {
		const pool = [
			// ads
			{ domain: 'googletagmanager.com', reason: 'I noticed that googletagmanager.com is on the blocklist but this domain is used by countless legitimate websites to load analytics scripts. It\'s operated by Google and doesn\'t serve malicious content — I think it was added too broadly.' },
			{ domain: 'doubleclick.net', reason: 'I run a small blog and rely on Google AdSense to cover hosting costs. Doubleclick.net is the domain that actually delivers the ad creatives. Blocking it kills my only source of income from the site and it\'s not a harmful domain by itself.' },
			{ domain: 'criteo.com', reason: 'Criteo.com is blocked on my setup and it\'s breaking a webshop I help maintain. It\'s a retargeting platform that loads only with cookie consent. It\'s not malware and I\'d like it reviewed.' },
			// tracking-and-telemetry
			{ domain: 'sentry.io', reason: 'Sentry.io is blocked but I use it for error monitoring in my personal projects. It only receives stack traces when something crashes — no user data, no ads. Without it I can\'t debug production issues at all.' },
			{ domain: 'sentry.medal.tv', reason: 'I use Medal.tv to clip highlights from games I play. After adding this blocklist the app started throwing errors on launch. I traced it back to sentry.medal.tv being blocked — it\'s just their crash reporter, nothing harmful.' },
			{ domain: 'devlog-upload.mihoyo.com', reason: 'Since I started using this blocklist, Genshin Impact\'s launcher keeps showing upload errors on startup. Turns out devlog-upload.mihoyo.com is blocked — it\'s only used to send anonymous crash reports to HoYoverse, not to spy on players.' },
			// crypto
			{ domain: 'binance.com', reason: 'I use Binance to manage my crypto portfolio and the block is preventing me from accessing the site entirely. Binance is a licensed exchange in multiple countries — it\'s not a scam or phishing domain. Please remove it from the list.' },
			{ domain: 'coinbase.com', reason: 'Coinbase is a publicly traded company on NASDAQ and one of the most regulated crypto platforms in the world. I can\'t access my account with this blocklist active. I really don\'t think it belongs on a list of harmful domains.' },
			{ domain: 'kraken.com', reason: 'Kraken is a regulated cryptocurrency exchange operating under FinCEN and EU licensing. I\'ve been a customer for years without any issues. Blocking it on the same list as scam sites seems like a mistake.' },
			// gambling
			{ domain: 'bet1000.com', reason: 'Bet1000 is a fully licensed sportsbook with an MGA licence. I\'m an adult and I use it for sports betting which is legal where I live. I understand the category exists but a licensed operator shouldn\'t be treated like a malicious site.' },
			{ domain: 'wintomato.com', reason: 'Wintomato is a licensed casino operating legally in the EU with responsible gambling tools in place. I\'m being blocked from a site I chose to use as an adult. Could you at least separate licensed operators from clearly illegal ones?' },
			// dating-services
			{ domain: 'szukamrandki.pl', reason: 'I signed up on szukamrandki.pl — it\'s just a regular Polish dating site, nothing sketchy. It has a cookie consent banner, GDPR notices, and standard registration. I don\'t see why it\'s blocked alongside scam sites.' },
			{ domain: 'erodate.pl', reason: 'Erodate.pl is a legal adult dating platform registered in Poland. It verifies age at registration and doesn\'t run any malware or phishing. I\'d understand a content-based category but it\'s not a harmful domain in the security sense.' },
			// piracy
			{ domain: 'allwarez.cz', reason: 'I tried visiting allwarez.cz out of curiosity and it just redirects to a blank page — there\'s no content there at all. It looks like the site has been dead for years. I think the block entry is outdated at this point.' },
			{ domain: 'blackpirate.cz', reason: 'Blackpirate.cz appears to be completely inactive — it shows a parked page with no links or content. I\'m not sure when the original site went down but blocking a dead domain seems unnecessary.' },
			// suspicious
			{ domain: 'instaboostlikes.com', reason: 'I\'ve used instaboostlikes.com for legitimate social media consulting and never encountered anything malicious. I suspect it was flagged because of the name rather than actual harmful behaviour. Could you double-check the classification?' },
			{ domain: 'click-1.pl', reason: 'I keep seeing click-1.pl blocked when I click affiliate links on Polish shopping sites. It\'s just a redirect domain used by e-commerce stores to track referral sales — it\'s not doing anything harmful, just a middleman URL.' },
			// useless-websites
			{ domain: 'returnyoutubedislikeapi.com', reason: 'I use the Return YouTube Dislike browser extension and this domain is its API backend. It only returns a number — the dislike count. There\'s no tracking, no ads, nothing harmful. I think "useless" is a bit harsh for a tool millions of people use.' },
			{ domain: 'placeit.net', reason: 'Placeit is an Envato-owned design tool used by our marketing team to create mockups and promotional materials. It is a paid SaaS product widely used by legitimate businesses. Blocking it disrupts our creative workflow.' },
			{ domain: 'weedmaps.com', reason: 'Weedmaps is a legal cannabis dispensary directory operating in US states and Canadian provinces where recreational cannabis is fully legalised. It functions similarly to Google Maps for a regulated industry and does not target EU users.' },
			// scam (borderline cases)
			{ domain: 'hardbin.com', reason: 'Hardbin is an encrypted pastebin service using client-side AES encryption. It is used by security researchers and developers to securely share code snippets and configuration files. The encryption means the server never sees the plaintext content.' },
			// not in blocklist — user mistakenly thinks it's blocked (notfound state test)
			{ domain: 'github.com', reason: 'GitHub is blocked on my network and I can\'t access any repositories. I\'m a developer and losing access to GitHub completely breaks my workflow. Please remove it.' },
			{ domain: 'stackoverflow.com', reason: 'Stack Overflow is showing as blocked and I genuinely can\'t figure out why. It\'s a programming Q&A site — there\'s nothing harmful about it. I use it every day for work.' },
			{ domain: 'cloudflare.com', reason: 'Cloudflare.com itself seems to be blocked. It\'s a CDN and security provider used by a huge chunk of the internet. I\'m not sure if this is intentional but it\'s breaking a lot of things for me.' },
			{ domain: 'npmjs.com', reason: 'The npm registry is blocked and I can\'t install any packages. I thought maybe it got caught by a broad rule. It\'s the official JavaScript package registry — definitely not malicious.' },
			{ domain: 'wikipedia.org', reason: 'I noticed Wikipedia is blocked. I use it regularly for research and reference. It\'s a non-profit encyclopaedia — I can\'t imagine why it would end up on a security blocklist.' },
			{ domain: 'discord.com', reason: 'Discord is blocked and I\'m cut off from my community servers and friends. It\'s a chat platform used by millions — I honestly have no idea how it ended up on this list.' },
		];
		const shuffle = arr => arr.slice().sort(() => Math.random() - 0.5);
		const pick = (arr, n) => shuffle(arr).slice(0, n);

		setTimeout(() => {
			if (domainsEl.value.trim()) return;
			const picked = pick(pool, Math.floor(Math.random() * 7) + 4);
			for (const { domain, reason } of picked) reasonValues.set(domain, reason);
			domainsEl.value = picked.map(p => p.domain).join('\n');
			form.email.value = 'postmaster@sefinek.net';
			checkAllDomains();
		}, 0);
	}
})();
