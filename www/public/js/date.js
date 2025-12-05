const clientLanguage = navigator.language || 'en-US';

console.log(`Client language: ${clientLanguage}`);

export const dateFormatOptions = {
	year: 'numeric',
	month: 'long',
	day: 'numeric',
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit',
	timeZoneName: 'short',
};

export const dateOnlyOptions = {
	year: 'numeric',
	month: 'long',
	day: 'numeric',
};

export const dateShortOptions = {
	year: 'numeric',
	month: 'short',
	day: 'numeric',
	hour: '2-digit',
	minute: '2-digit',
	timeZone: 'UTC',
	timeZoneName: 'short',
};

export const formatDate = dateString => {
	if (!dateString) return '';
	return new Date(dateString).toLocaleDateString(clientLanguage, dateFormatOptions);
};

export const formatDateOnly = dateString => {
	if (!dateString) return '';
	return new Date(dateString).toLocaleDateString(clientLanguage, dateOnlyOptions);
};

export const formatDateShort = dateString => {
	if (!dateString) return '';
	return new Date(dateString).toLocaleString(clientLanguage, dateShortOptions);
};

export const formatToYYYYMMDD = date => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

export const updateElementDate = elementId => {
	const element = document.getElementById(elementId);
	if (!element) return;

	const value = element.getAttribute('datetime') || element.textContent;
	if (!value) return;

	element.textContent = formatDate(value);
};

export const updateElementDateOnly = (elementId, datetime) => {
	const element = document.getElementById(elementId);
	if (!element) return;

	const value = datetime || element.getAttribute('datetime');
	if (!value) return;

	element.textContent = formatDateOnly(value);
};
