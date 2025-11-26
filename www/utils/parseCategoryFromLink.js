const types = {
	'0.0.0.0': 'hosts',
	'127.0.0.1': 'localhost',
};

module.exports = url => {
	const segments = url.split('/');
	const isVersioned = segments[2] === 'v1';
	const rawType = segments[isVersioned ? 3 : 2] || '';

	return {
		url,
		array: segments,
		type: types[rawType] || rawType,
	};
};