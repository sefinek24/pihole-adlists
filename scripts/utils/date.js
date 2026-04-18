const pad = value => String(value).padStart(2, '0');

const formatTimezoneOffset = date => {
	const offsetMinutes = -date.getTimezoneOffset();
	const sign = offsetMinutes >= 0 ? '+' : '-';
	const absMinutes = Math.abs(offsetMinutes);
	const hours = pad(Math.floor(absMinutes / 60));
	const minutes = pad(absMinutes % 60);

	return `GMT${sign}${hours}:${minutes}`;
};

const fullFormatter = new Intl.DateTimeFormat('en-US', {
	year: 'numeric',
	month: 'long',
	day: 'numeric',
	hour: 'numeric',
	minute: '2-digit',
	timeZone: 'UTC',
	timeZoneName: 'short',
});

module.exports = () => {
	const now = new Date();

	return {
		timestamp: now.getTime(),
		now: now.toISOString(),
		full: fullFormatter.format(now),
		serialNumber: `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}`,
		timezone: formatTimezoneOffset(now),
	};
};
