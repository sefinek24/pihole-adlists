module.exports = (title, description, count, { modifiedBy, source, homepage, license } = {}) => {
	const lines = [
		`# Title: ${title || 'Unknown'}`,
		...(description ? [`# Description: ${description}`] : []),
		`# Entries: ${count != null ? `${Number(count).toLocaleString('en-US')} domains` : 'Unknown'}`,
		...(!source ? ['# Author: Sefinek <contact@sefinek.net> (https://sefinek.net)'] : []),
	];

	if (source) lines.push(`# Source: ${homepage ? `${source} | ${homepage}` : source}`);
	if (modifiedBy) lines.push(`# Modified by: ${modifiedBy}`);

	lines.push(`# License: ${license || 'Unknown, check the source'}`);
	lines.push('# Format: {Format}');
	lines.push('# Expires: 1 day');
	lines.push('# Last updated: {LastUpdate}');

	return `#       _____   ______   ______   _____   _   _   ______   _  __        ____    _         ____     _____   _  __  _        _____    _____   _______
#      / ____| |  ____| |  ____| |_   _| | \\ | | |  ____| | |/ /       |  _ \\  | |       / __ \\   / ____| | |/ / | |      |_   _|  / ____| |__   __|
#     | (___   | |__    | |__      | |   |  \\| | | |__    | ' /        | |_) | | |      | |  | | | |      | ' /  | |        | |   | (___      | |
#      \\___ \\  |  __|   |  __|     | |   | . \` | |  __|   |  <         |  _ <  | |      | |  | | | |      |  <   | |        | |    \\___ \\     | |
#      ____) | | |____  | |       _| |_  | |\\  | | |____  | . \\        | |_) | | |____  | |__| | | |____  | . \\  | |____   _| |_   ____) |    | |
#     |_____/  |______| |_|      |_____| |_| \\_| |______| |_|\\_\\       |____/  |______|  \\____/   \\_____| |_|\\_\\ |______| |_____| |_____/     |_|
#
${lines.join('\n')}
#
# This file is part of the Sefinek Blocklist Collection, maintained by Sefinek.
# Homepage: https://blocklist.sefinek.net
# Report false positives: https://blocklist.sefinek.net/false-positives
# -------------------------------------------------------------------------------------------------------------------------------------------------------`;
};
