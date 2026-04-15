module.exports = (title, description, count, { modifiedBy, source, license } = {}) => {
	const lines = [
		`# Title: ${title || 'Unknown'}`,
		`# Description: ${description || 'N/A'}`,
		'# Expires: 1 day',
		`# Count: ${count || 'Unknown'}`,
		'# Author: Sefinek (https://sefinek.net) <contact@sefinek.net>',
	];

	if (modifiedBy) lines.push(`# Modified by: ${modifiedBy}`);
	if (source) lines.push(`# Source: ${source}`);

	lines.push(`# License: ${license || 'MIT'}`);
	lines.push('# Release: {Release}');
	lines.push('# Last update: {LastUpdate}');

	return `#       _____   ______   ______   _____   _   _   ______   _  __        ____    _         ____     _____   _  __  _        _____    _____   _______
#      / ____| |  ____| |  ____| |_   _| | \\ | | |  ____| | |/ /       |  _ \\  | |       / __ \\   / ____| | |/ / | |      |_   _|  / ____| |__   __|
#     | (___   | |__    | |__      | |   |  \\| | | |__    | ' /        | |_) | | |      | |  | | | |      | ' /  | |        | |   | (___      | |
#      \\___ \\  |  __|   |  __|     | |   | . \` | |  __|   |  <         |  _ <  | |      | |  | | | |      |  <   | |        | |    \\___ \\     | |
#      ____) | | |____  | |       _| |_  | |\\  | | |____  | . \\        | |_) | | |____  | |__| | | |____  | . \\  | |____   _| |_   ____) |    | |
#     |_____/  |______| |_|      |_____| |_| \\_| |______| |_|\\_\\       |____/  |______|  \\____/   \\_____| |_|\\_\\ |______| |_____| |_____/     |_|
#
#                                            The best blocklist collection: https://blocklist.sefinek.net
${lines.join('\n')}
#
# This file is part of the Sefinek Blocklist Collection, maintained by Sefinek.
# If you encounter any false positives, please report them at: https://blocklist.sefinek.net/false-positives
# -------------------------------------------------------------------------------------------------------------------------------------------------------`;
};
