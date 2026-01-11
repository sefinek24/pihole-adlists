(() => {
	'use strict';

	const requestCache = new Map();
	const CACHE_TTL = 60000;

	const formatTimestamp = element => {
		const timestamp = Number(element.dataset.timestamp);
		if (!Number.isNaN(timestamp) && timestamp > 0) {
			const date = new Date(timestamp);
			element.textContent = date.toLocaleString(undefined, {
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

	const attachAjaxListeners = handleClick => {
		document.querySelectorAll('a[data-ajax-link]').forEach(link => {
			link.removeEventListener('click', handleClick);
			link.addEventListener('click', handleClick);
		});
	};

	const renderDirectory = (data, tbody, pathElement, pushState) => {
		tbody.innerHTML = '';

		const basePath = window.location.pathname.split('/').slice(0, 3).join('/');
		const parentRow = createParentRow(data.currentPath, basePath);
		if (parentRow) tbody.appendChild(parentRow);

		data.files.forEach(file => {
			tbody.appendChild(createTableRow(file, data.currentPath.replace(/\/$/, '')));
		});

		tbody.querySelectorAll('.explorer__cell--date[data-timestamp]').forEach(formatTimestamp);

		if (pathElement) pathElement.textContent = data.currentPath;

		if (pushState) {
			const newUrl = data.currentPath.endsWith('/') ? data.currentPath : `${data.currentPath}/`;
			window.history.pushState({ path: newUrl }, '', newUrl);
		}

		attachAjaxListeners(handleAjaxClick);
	};

	const loadDirectory = async (url, pushState = true) => {
		const tbody = document.querySelector('.explorer__tbody');
		const pathElement = document.querySelector('.explorer__path');
		if (!tbody) return;

		const cached = requestCache.get(url);
		const now = Date.now();

		if (cached && (now - cached.timestamp) < CACHE_TTL) {
			renderDirectory(cached.data, tbody, pathElement, pushState);
			return;
		}

		tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:2rem;color:rgba(255,255,255,0.6)">Loading...</td></tr>';

		try {
			const response = await fetch(url, {
				headers: { 'X-Requested-With': 'XMLHttpRequest' },
			});

			if (!response.ok) throw new Error('Failed to load directory');

			const data = await response.json();
			if (!data.success) throw new Error(data.error || 'Unknown error');

			requestCache.set(url, { data, timestamp: Date.now() });

			if (requestCache.size > 50) {
				const firstKey = requestCache.keys().next().value;
				requestCache.delete(firstKey);
			}

			renderDirectory(data, tbody, pathElement, pushState);
		} catch (err) {
			console.error('Error loading directory:', err);
			tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:2rem;color:rgba(255,100,100,0.8)">Error: ${err.message}</td></tr>`;
		}
	};

	function handleAjaxClick(e) {
		if (window.history.length <= 1) return;

		e.preventDefault();
		void loadDirectory(e.currentTarget.href);
	}

	const initializeExplorer = () => {
		document.querySelectorAll('.explorer__cell--date[data-timestamp]').forEach(formatTimestamp);

		const reloadButton = document.getElementById('reloadPage');
		if (reloadButton) {
			reloadButton.addEventListener('click', () => {
				const currentPath = document.querySelector('.explorer__path')?.textContent || window.location.pathname;
				void loadDirectory(currentPath, false);
			}, { passive: false });
		}

		attachAjaxListeners(handleAjaxClick);

		window.addEventListener('popstate', e => {
			if (e.state?.path) {
				void loadDirectory(e.state.path, false);
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
