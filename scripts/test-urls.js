process.loadEnvFile();
const fs = require('node:fs/promises');
const axios = require('../www/services/axios.js');
const { version } = require('../package.json');

const markdownFiles = [
	'./docs/lists/md/127.0.0.1.md',
	'./docs/lists/md/AdGuard.md',
	'./docs/lists/md/dnsmasq.md',
	'./docs/lists/md/noip.md',
	'./docs/lists/md/Pi-hole.md',
	'./docs/lists/md/RPZ.md',
	'./docs/lists/md/Unbound.md',
];

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const URL_REGEX = /https:\/\/blocklist\.sefinek\.net\/generated\/v1\/(0\.0\.0\.0|127\.0\.0\.1|adguard|dnsmasq|noip|rpz|unbound)\/(?:[\w-]+\/)+[\w\\.-]+\.\w+/gi;
const headers = { headers: { 'User-Agent': `Mozilla/5.0 (compatible; SefinekBlocklists/${version}; +https://blocklist.sefinek.net)` } };

let failedLinks = 0, invalidFiles = 0, retriesFails = 0, successfulLinks = 0, totalLinks = 0;
const invalidLinks = [];

const serveUrl = link => process.env.NODE_ENV === 'production'
	? link
	: link.replace('https://blocklist.sefinek.net', `${process.env.DOMAIN}${process.env.PORT ? `:${process.env.PORT}` : ''}`);

const extractLinks = content => [...content.matchAll(URL_REGEX)].map(m => m[0]);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const testLinks = async () => {
	console.log('=== Testing URLs collection ===\n');
	const links = [];

	for (const markdownFile of markdownFiles) {
		try {
			const fileContent = await fs.readFile(markdownFile, 'utf-8');
			links.push(...extractLinks(fileContent));
		} catch {
			console.error('Error reading file:', markdownFile);
			invalidFiles++;
		}
	}

	totalLinks = links.length;

	for (const link of links) {
		const processedLink = serveUrl(link);
		if (!processedLink) {
			invalidLinks.push(link);
			continue;
		}
		try {
			console.log(processedLink);
			const response = await axios.head(processedLink, headers);
			console.log(`${response.status}: Status: ${response.statusText}`);
			successfulLinks++;
		} catch {
			retriesFails++;
			let retries = 0, success = false;
			while (retries < MAX_RETRIES) {
				if (retriesFails >= MAX_RETRIES * 4) process.exit(1);
				console.log(`> Waiting ${RETRY_DELAY_MS / 1000} seconds...`);
				await sleep(RETRY_DELAY_MS);

				try {
					const response = await axios.head(processedLink, headers);
					console.log(`${response.status}: Status: ${response.statusText}`);
					successfulLinks++;
					success = true;
					break;
				} catch (err) {
					console.warn(`${err.response?.status || err.message.toUpperCase()} (${err.response?.statusText || 'Unknown status'})`);
					retries++;
					retriesFails++;
				}
			}
			if (!success) failedLinks++;
		}
	}

	console.log('\n=== Test Summary ===');
	console.log(`Total links: ${totalLinks}`);
	console.log(`Successful links: ${successfulLinks}/${totalLinks}`);
	console.log(`Failed links: ${failedLinks}/${totalLinks}`);
	console.log(`Failed retries: ${retriesFails}`);
	console.log(`Invalid files: ${invalidFiles}`);
	console.log(`Invalid links: ${invalidLinks.length}`);
	console.log('Invalid links list:', invalidLinks);
};

(async () => {
	try {
		await testLinks();
	} catch (err) {
		console.error('An error occurred while testing links:', err);
		process.exit(1);
	}
})();