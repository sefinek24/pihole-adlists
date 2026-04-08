(() => {
	'use strict';

	const form = document.getElementById('reportForm');
	const checkBtn = document.getElementById('checkBtn');
	const modal = document.getElementById('fpModal');
	const modalBackdrop = document.getElementById('fpModalBackdrop');
	const modalTitle = document.getElementById('fpModalTitle');
	const modalStatus = document.getElementById('fpModalStatus');
	const modalMatches = document.getElementById('fpModalMatches');
	const modalIcon = document.getElementById('fpModalIcon');
	const modalClose = document.getElementById('fpModalClose');
	const modalCancel = document.getElementById('fpModalCancel');
	const modalClearClose = document.getElementById('fpModalClearClose');
	const modalConfirm = document.getElementById('fpModalConfirm');

	const DOMAIN_REGEX = /^(\*\.)?([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
	const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	// ── URL params persistence ─────────────────────────────────────────────────

	let syncTimer;
	const syncToUrl = () => {
		clearTimeout(syncTimer);
		syncTimer = setTimeout(() => {
			const params = new URLSearchParams();
			const domain = form.domain.value.trim();
			const reason = form.reason.value.trim();
			const email = form.email.value.trim();
			if (domain) params.set('domain', btoa(domain));
			if (reason) params.set('reason', reason);
			if (email) params.set('email', btoa(email));
			const qs = params.toString();
			history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
		}, 400);
	};

	const restoreFromUrl = () => {
		const params = new URLSearchParams(location.search);
		if (params.has('domain')) try { form.domain.value = atob(params.get('domain')); } catch { /* invalid base64 */ }
		if (params.has('reason')) form.reason.value = params.get('reason');
		if (params.has('email')) try { form.email.value = atob(params.get('email')); } catch { /* invalid base64 */ }
	};

	restoreFromUrl();
	form.domain.addEventListener('input', syncToUrl);
	form.reason.addEventListener('input', syncToUrl);
	form.email.addEventListener('input', syncToUrl);

	// ── Validation ────────────────────────────────────────────────────────────

	const errorEls = {
		domain: { hint: document.getElementById('domain-hint'), input: document.getElementById('domain') },
		reason: { hint: document.getElementById('reason-hint'), input: document.getElementById('reason') },
		email: { hint: document.getElementById('email-hint'), input: document.getElementById('email') },
	};
	for (const v of Object.values(errorEls)) v.orig = v.hint.textContent;

	const errorTimers = {};
	const setError = (id, msg) => {
		const { hint, input, orig } = errorEls[id];
		clearTimeout(errorTimers[id]);
		if (msg) {
			hint.textContent = `(${msg})`;
			hint.classList.add('report-form__label-hint--error');
			input.classList.add('report-form__input--error');
			errorTimers[id] = setTimeout(() => setError(id, ''), 4000);
		} else {
			hint.textContent = orig;
			hint.classList.remove('report-form__label-hint--error');
			input.classList.remove('report-form__input--error');
		}
	};

	const validate = (data) => {
		let valid = true;

		if (!data.domain) {
			setError('domain', 'domain is required');
			valid = false;
		} else if (!DOMAIN_REGEX.test(data.domain)) {
			setError('domain', 'invalid domain format');
			valid = false;
		} else {
			setError('domain', '');
		}

		if (!data.reason) {
			setError('reason', 'reason is required');
			valid = false;
		} else if (data.reason.length < 10) {
			setError('reason', 'reason must be at least 10 characters');
			valid = false;
		} else {
			setError('reason', '');
		}

		if (data.email && !EMAIL_REGEX.test(data.email)) {
			setError('email', 'invalid email address');
			valid = false;
		} else {
			setError('email', '');
		}

		return valid;
	};

	// ── Form data helper ──────────────────────────────────────────────────────

	const getFormData = () => ({
		domain: form.domain.value.trim(),
		reason: form.reason.value.trim(),
		email:  form.email.value.trim(),
	});

	// ── Modal ─────────────────────────────────────────────────────────────────

	const openModal = () => {
		modal.hidden = false;
		modalClose.focus();
	};

	const closeModal = () => {
		modal.hidden = true;
		checkBtn.focus();
	};

	const setModalState = ({ title, status, statusClass, matches, showConfirm, showClearClose }) => {
		if (title) modalTitle.textContent = title;

		modalStatus.textContent = status ?? '';

		const ok = statusClass === 'found' || statusClass === 'success';
		modalIcon.hidden = !statusClass;
		if (statusClass) {
			modalIcon.textContent = ok ? '✓' : '✗';
			modalIcon.className = ok ? 'fp-modal-icon--ok' : 'fp-modal-icon--err';
		}

		modalMatches.hidden = !matches?.length;
		modalMatches.innerHTML = matches?.length
			? matches.map(m => `
				<li class="fp-match">
					<span class="fp-match__path">
						<span class="fp-match__category">${(m.category ?? '').replaceAll('-', ' ')}</span>
						${m.source ? `<span class="fp-match__sep">/</span><span class="fp-match__source">${m.source}</span>` : ''}
						${m.file ? `<span class="fp-match__sep">/</span><span class="fp-match__file">${m.file}</span>` : ''}
					</span>
					<span class="fp-match__links">
						<a href="${m.siteUrl}"   target="_blank" rel="noopener">Site</a>
						<a href="${m.githubUrl}" target="_blank" rel="noopener">GitHub</a>
					</span>
				</li>`).join('')
			: '';

		modalClearClose.hidden = !showClearClose;
		modalConfirm.hidden = !showConfirm;
	};

	modalClose.addEventListener('click', closeModal);
	modalCancel.addEventListener('click', closeModal);
	modalClearClose.addEventListener('click', () => {
		form.reset();
		syncToUrl();
		closeModal();
	});
	modalBackdrop.addEventListener('click', closeModal);
	document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

	// ── Step 1: check domain ──────────────────────────────────────────────────

	form.addEventListener('submit', async e => {
		e.preventDefault();

		const data = getFormData();
		if (!validate(data)) return;

		checkBtn.disabled = true;
		checkBtn.textContent = 'Checking...';

		const t0 = performance.now();

		try {
			const res = await fetch(`/api/v1/blocklist/check?domain=${encodeURIComponent(data.domain)}`);
			const json = await res.json();
			const ms = Math.round(performance.now() - t0);

			if (!res.ok) {
				setModalState({ title: `Check failed (status ${res.status})`, status: `${json.message || 'An error occurred.'} Took ${ms}ms.`, statusClass: 'error' });
			} else if (json.data.found) {
				const count = json.data.matches.length;
				setModalState({
					title: 'Domain check results',
					status: `Great! The domain '${data.domain}' was found in ${count} list${count !== 1 ? 's' : ''}. You can now submit a false positive report. The check took ${ms}ms.`,
					statusClass: 'found',
					matches: json.data.matches,
					showConfirm: true,
				});
			} else {
				setModalState({
					title: 'Domain check results',
					status: `Not this time... The domain you provided, '${data.domain}', was not found in any blocklist. You cannot report it as a false positive. If you believe this is an error, please get in touch. The check took ${ms}ms.`,
					statusClass: 'notfound',
					showConfirm: false,
				});
			}

			openModal();
		} catch {
			setModalState({ title: 'Error', status: 'Network error. Please try again.', statusClass: 'error' });
			openModal();
		} finally {
			checkBtn.disabled = false;
			checkBtn.textContent = 'Check domain';
		}
	});

	// ── Step 2: send report ───────────────────────────────────────────────────

	modalConfirm.addEventListener('click', async () => {
		const data = getFormData();

		modalConfirm.disabled = true;
		modalConfirm.textContent = 'Sending...';
		modalCancel.disabled = true;
		modalClose.disabled = true;

		const t0 = performance.now();

		try {
			const res = await fetch('/api/v1/reports/false-positive', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });

			const json = await res.json();
			const ms = Math.round(performance.now() - t0);
			if (json.success) {
				setModalState({
					title: 'Report sent',
					status: `${json.message} Completed in ${ms}ms`,
					statusClass: 'success',
					showConfirm: false,
				});
				form.reset();
				syncToUrl();
			} else {
				setModalState({
					title: 'Something went wrong',
					status: `${json.message} The request took ${ms}ms.`,
					statusClass: 'error',
					showConfirm: res.status !== 422 && res.status !== 429,
					showClearClose: res.status === 429,
				});
			}
		} catch {
			setModalState({ title: 'Error', status: 'Network error. Please try again.', statusClass: 'error', showConfirm: true });
		} finally {
			modalConfirm.disabled = false;
			modalConfirm.textContent = 'Confirm & send report';
			modalCancel.disabled = false;
			modalClose.disabled = false;
		}
	});
})();
