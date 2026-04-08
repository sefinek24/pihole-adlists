const pad = y => (y > 9 ? y : '0' + y);

exports.getFullDate = seconds => {
	const days = (seconds / 86400) | 0;
	const hours = ((seconds % 86400) / 3600) | 0;
	const minutes = ((seconds % 3600) / 60) | 0;
	const remainingSeconds = (seconds % 60) | 0;

	const parts = [];
	if (days) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
	if (hours) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
	if (minutes) parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
	if (remainingSeconds) parts.push(`${remainingSeconds} ${remainingSeconds === 1 ? 'second' : 'seconds'}`);

	return parts.join(', ');
};

exports.getDate = () => {
	const now = new Date();
	const day = now.getDate();
	const month = now.getMonth() + 1;
	const year = now.getFullYear();
	const hour = now.getHours();

	return {
		dateKey: `${pad(day)}-${pad(month)}-${year}`,
		yearKey: year.toString(),
		monthKey: pad(month),
		hourKey: pad(hour),
	};
};