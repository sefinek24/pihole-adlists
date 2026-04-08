const ipaddr = require('ipaddr.js');

module.exports = ip => {
	if (!ip || ip === '::' || ip === '::1') return true;

	try {
		const range = ipaddr.parse(ip).range();
		return ['loopback', 'private', 'linkLocal', 'unspecified', 'multicast', 'reserved', 'carrierGradeNat', 'broadcast', 'benchmarking'].includes(range);
	} catch (err) {
		console.warn(`⚠️ Error checking if IP is private (${ip}): ${err.message}`);
		return false;
	}
};
