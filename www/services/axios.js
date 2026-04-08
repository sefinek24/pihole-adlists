const axios = require('axios');
const { name, version, homepage } = require('../../package.json');

axios.defaults.headers.common = {
	'User-Agent': `Mozilla/5.0 (compatible; ${name}/${version}; +${homepage})`,
	'Accept': 'application/json',
	'Content-Type': 'application/json',
};

axios.defaults.timeout = 25000;

module.exports = axios;