module.exports = (title, description, count, { modifiedBy, source, homepage, license } = {}) => {
	const lines = [
		`# Tytuł: ${title || 'Nieznany'}`,
		...(description ? [`# Opis: ${description}`] : []),
		`# Entries: ${count != null ? `${Number(count).toLocaleString('en-US')} domains` : 'Unknown'}`,
		...(!source ? ['# Autor: Sefinek <contact@sefinek.net> (https://sefinek.net)'] : []),
	];

	if (source) lines.push(`# Źródło: ${homepage ? `${source} | ${homepage}` : source}`);
	if (modifiedBy) lines.push(`# Zmodyfikowane przez: ${modifiedBy}`);

	lines.push(`# Licencja: ${license || 'Nieznana, sprawdź źródło'}`);
	lines.push('# Format: {Format}');
	lines.push('# Wygasa: 1 dzień');
	lines.push('# Ostatnia aktualizacja: {LastUpdate}');

	return `#       _____   ______   ______   _____   _   _   ______   _  __        ____    _         ____     _____   _  __  _        _____    _____   _______
#      / ____| |  ____| |  ____| |_   _| | \\ | | |  ____| | |/ /       |  _ \\  | |       / __ \\   / ____| | |/ / | |      |_   _|  / ____| |__   __|
#     | (___   | |__    | |__      | |   |  \\| | | |__    | ' /        | |_) | | |      | |  | | | |      | ' /  | |        | |   | (___      | |
#      \\___ \\  |  __|   |  __|     | |   | . \` | |  __|   |  <         |  _ <  | |      | |  | | | |      |  <   | |        | |    \\___ \\     | |
#      ____) | | |____  | |       _| |_  | |\\  | | |____  | . \\        | |_) | | |____  | |__| | | |____  | . \\  | |____   _| |_   ____) |    | |
#     |_____/  |______| |_|      |_____| |_| \\_| |______| |_|\\_\\       |____/  |______|  \\____/   \\_____| |_|\\_\\ |______| |_____| |_____/     |_|
#
${lines.join('\n')}
#
# Ten plik jest częścią Sefinek Blocklist Collection, utrzymywanej przez Sefinek.
# Oficjalna strona: https://blocklist.sefinek.net
# Zgłoś fałszywe pozytywy: https://blocklist.sefinek.net/false-positives
# -------------------------------------------------------------------------------------------------------------------------------------------------------`;
};
