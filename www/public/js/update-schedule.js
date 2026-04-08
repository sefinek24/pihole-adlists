(() => {
	'use strict';

	const { cronGh, cronRemote } = document.currentScript.dataset;

	const FORMATTER_OPTIONS = {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	};

	const formatCountdown = ms => {
		if (ms <= 0) return 'now';

		const totalSeconds = Math.floor(ms / 1000);
		const days = Math.floor(totalSeconds / 86400);
		const hours = Math.floor((totalSeconds % 86400) / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;
		const parts = [];

		if (days) parts.push(`${days}d`);
		parts.push(`${hours}h`, `${minutes}m`, `${seconds}s`);

		return `in ${parts.join(' ')}`;
	};

	const showCronInfo = () => {
		try {
			const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
			const timezoneElement = document.getElementById('user-timezone');
			if (timezoneElement) timezoneElement.textContent = userTimezone || '?';
			if (userTimezone) FORMATTER_OPTIONS.timeZone = userTimezone;

			const formatter = new Intl.DateTimeFormat(undefined, FORMATTER_OPTIONS);
			const githubDate = new Date(cronGh);
			const remoteDate = new Date(cronRemote);

			const githubElement = document.getElementById('github');
			if (githubElement) githubElement.textContent = formatter.format(githubDate);

			const remoteElement = document.getElementById('remote');
			if (remoteElement) remoteElement.textContent = formatter.format(remoteDate);

			const githubCountdown = document.getElementById('github-countdown');
			const remoteCountdown = document.getElementById('remote-countdown');

			const updateCountdowns = () => {
				if (githubCountdown) githubCountdown.textContent = formatCountdown(githubDate.getTime() - Date.now());
				if (remoteCountdown) remoteCountdown.textContent = formatCountdown(remoteDate.getTime() - Date.now());
			};

			updateCountdowns();
			setInterval(updateCountdowns, 1000);
		} catch (err) {
			console.error('Failed to load schedule information:', err);
		}
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', showCronInfo);
	} else {
		showCronInfo();
	}
})();