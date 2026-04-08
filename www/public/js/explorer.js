(() => {
	'use strict';

	const requestCache = new Map();
	const CACHE_TTL = 60000;
	const navSound = new Audio('/sounds/navigate.wav');
	const playNavSound = () => {
		navSound.currentTime = 0;
		navSound.play().catch(() => {/* ... */});
	};

	const formatTimestamp = element => {
		const timestamp = Number(element.dataset.timestamp);
		if (!Number.isNaN(timestamp) && timestamp > 0) {
			const date = new Date(timestamp);
			element.textContent = date.toLocaleString(navigator.languages, {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
			});
			element.setAttribute('datetime', date.toISOString());
		}
	};

	const createTableRow = (file, currentPath) => {
		const row = document.createElement('tr');
		row.className = `explorer__row ${file.isDirectory ? 'explorer__row--folder' : 'explorer__row--file'}`;

		const href = `${currentPath}/${file.name}`;
		const label = file.isDirectory ? 'Folder' : 'File';
		const ajaxAttr = file.isDirectory ? 'data-ajax-link' : '';

		row.innerHTML = `
			<td class="explorer__cell explorer__cell--name">
				<a href="${href}" class="explorer__link" aria-label="${label}: ${file.name}" ${ajaxAttr}>
					<img src="/images/flaticon/${file.icon}" alt="" class="explorer__img" width="24" height="24" loading="lazy">
					<span class="explorer__name">${file.name}</span>
				</a>
			</td>
			<td class="explorer__cell explorer__cell--date" data-timestamp="${file.lastModified}"></td>
			<td class="explorer__cell explorer__cell--size">${file.formattedSize}</td>`;

		return row;
	};

	const createParentRow = (currentPath, basePath) => {
		if (currentPath === basePath) return null;

		const parentPath = currentPath.replace(/\/$/, '').split('/').slice(0, -1).join('/') || basePath;
		const row = document.createElement('tr');
		row.className = 'explorer__row explorer__row--parent';
		row.innerHTML = `
			<td class="explorer__cell explorer__cell--name">
				<a href="${parentPath}/" class="explorer__link" aria-label="Parent directory" data-ajax-link>
					<img src="/images/flaticon/back.png" alt="" class="explorer__img" width="24" height="24" loading="lazy">
					<span class="explorer__name">../</span>
				</a>
			</td>
			<td class="explorer__cell explorer__cell--date"></td>
			<td class="explorer__cell explorer__cell--size"></td>`;

		return row;
	};

	const renderDirectory = (data, tbody, pathElement, pushState) => {
		tbody.innerHTML = '';

		const basePath = window.location.pathname.split('/').slice(0, 3).join('/');
		const parentRow = createParentRow(data.currentPath, basePath);
		if (parentRow) tbody.appendChild(parentRow);

		const trimmedPath = data.currentPath.replace(/\/$/, '');
		data.files.forEach(file => tbody.appendChild(createTableRow(file, trimmedPath)));

		tbody.querySelectorAll('.explorer__cell--date[data-timestamp]').forEach(formatTimestamp);

		if (pathElement) pathElement.textContent = data.currentPath;

		if (pushState) {
			const newUrl = data.currentPath.endsWith('/') ? data.currentPath : `${data.currentPath}/`;
			window.history.pushState({ path: newUrl }, '', newUrl);
		}
	};

	const loadDirectory = async (url, pushState = true, playSound = false) => {
		const tbody = document.querySelector('.explorer__tbody');
		const pathElement = document.querySelector('.explorer__path');
		if (!tbody) return;

		const cached = requestCache.get(url);
		if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
			if (playSound) playNavSound();
			renderDirectory(cached.data, tbody, pathElement, pushState);
			return;
		}

		const reloadBtn = document.getElementById('reloadPage');
		if (reloadBtn) reloadBtn.disabled = true;

		const showError = msg => {
			tbody.innerHTML = `<tr><td colspan="3" class="explorer__status explorer__status--error"><div class="explorer__status__inner"><img src="https://cdn.sefinek.net/images/error.gif" alt="Error" class="explorer__status__gif"><span class="explorer__status__label">${msg}</span></div></td></tr>`;
		};

		tbody.innerHTML = '<tr><td colspan="3" class="explorer__status explorer__status--loading"><div class="explorer__status__inner"><img src="https://cdn.sefinek.net/images/loading.gif" alt="Loading..." class="explorer__status__gif"><span class="explorer__status__label">Loading...</span></div></td></tr>';

		let data, response;
		try {
			response = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
			data = await response.json();
		} catch (err) {
			console.error('Error loading directory:', err);
			const msg = !navigator.onLine
				? 'No internet connection'
				: err instanceof TypeError
					? 'Unable to connect to the server'
					: err.message;
			showError(msg);
			if (reloadBtn) reloadBtn.disabled = false;
			return;
		}

		if (!response.ok) {
			showError(data?.error || `HTTP ${response.status} ${response.statusText}`);
			if (reloadBtn) reloadBtn.disabled = false;
			return;
		}

		if (!data.success) {
			showError(data.error || 'Unknown error');
			if (reloadBtn) reloadBtn.disabled = false;
			return;
		}

		requestCache.set(url, { data, timestamp: Date.now() });
		if (requestCache.size > 50) {
			requestCache.delete(requestCache.keys().next().value);
		}

		if (playSound) playNavSound();
		renderDirectory(data, tbody, pathElement, pushState);
		if (reloadBtn) reloadBtn.disabled = false;
	};

	const handleAjaxClick = e => {
		const link = e.target.closest('a[data-ajax-link]');
		if (!link) return;
		if (window.history.length <= 1) return;

		e.preventDefault();
		const row = link.closest('tr');
		const isEnter = row?.classList.contains('explorer__row--folder') || row?.classList.contains('explorer__row--parent');
		void loadDirectory(link.href, true, isEnter);
	};

	const initializeExplorer = () => {
		document.querySelectorAll('.explorer__cell--date[data-timestamp]').forEach(formatTimestamp);

		const reloadButton = document.getElementById('reloadPage');
		if (reloadButton) {
			reloadButton.addEventListener('click', () => {
				const currentPath = document.querySelector('.explorer__path')?.textContent || window.location.pathname;
				requestCache.delete(currentPath);
				void loadDirectory(currentPath, false);
			});
		}

		document.addEventListener('click', handleAjaxClick);

		window.addEventListener('popstate', e => {
			if (e.state?.path) {
				void loadDirectory(e.state.path, false, true);
			} else {
				window.location.reload();
			}
		});

		const currentPath = document.querySelector('.explorer__path')?.textContent || window.location.pathname;
		window.history.replaceState({ path: currentPath }, '', currentPath);
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initializeExplorer);
	} else {
		initializeExplorer();
	}
})();
