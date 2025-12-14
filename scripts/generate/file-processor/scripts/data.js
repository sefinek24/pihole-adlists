exports.CATEGORIES = [{
	title: 'Blocks everything related to anime, manga, or VTubers',
	description: 'Active, inactive, and parked domains. Blocks websites related to anime, manga, cosplay, vtubers, hentai, ecchi, etc.',
	category: 'Anime',
	// grex "anime" "rule34" "manga" "animeboobs" "nekomimi" "nekomusume" "crunchyroll" "hentai" "vtuber" "cosplay" "otaku" "shonen" "shoujo" "yuri" "yaoi" "ecchi" "isekai" "kawaii" "tsundere" "yandere" "yande.re" "waifu" "seinen" "doujinshi" "bishounen" "bishoujo" "chibi" "bishojo" "doujin" "seiyuu" "harem" "loli"
	regex: /c(?:runchyroll|osplay)|animeboobs|(?:nekomusum|yander)e|bisho(?:u(?:nen|jo)|jo)|(?:doujinsh|henta|iseka|kawai|chib|ecch|lol|y(?:ao|ur))i|nekomimi|yande\.re|tsundere|doujin|rule34|seiyuu|vtuber|shoujo|s(?:ei|ho)nen|anime|harem|manga|(?:otak|waif)u/i,
	file: 'anime/main.txt',
}, {
	title: 'Blocks websites with LGBTQ+ content or related discourse (both supportive and critical)',
	description: 'Active, inactive, and parked domains. Some of them may also share pornographic content.',
	category: 'LGBTQ+',
	// grex "lgbt" "gay" "geje" "gejowski" "lesbian" "lesbijka" "lesbijki" "lesbijek" "lesbijska" "bisexual" "biseksualny" "biseksualna" "biseksualni" "transflag" "genderflag" "transgender" "transseksualista" "transseksualistka" "transowa" "transseksualny" "transseksualna" "transexual" "transsexual" "transexual" "transowy" "tranzytowy" "nonbinary" "niebinarny" "niebinarna" "asexual" "aseksualny" "aseksualna" "aseksualni" "pansexual" "panseksualny" "panseksualna" "aromantic" "aromantyczny" "aromantyczna" "aromantyczni" "demisexual" "demiseksualny" "demiseksualna" "cisgender" "cispłciowy" "cispłciowa" "genderfluid" "genderqueer" "queer" "lesbijka" "lesbijki" "aseksualny" "aseksualna" "interseksualny" "interseksualna" "interseksualni" "bigender" "dwupłciowy" "agender" "bezpłciowy" "two-spirit" "dwuduchowy" "allosexual" "alloseksualny" "alloseksualna" "alloromantic" "alloromantyczny" "alloromantyczna" "nonconforming" "niekonformistyczny" "niekonformistyczna" "pangender" "pangenderowy" "demiboy" "demichłopiec" "demigirl" "demidziewczyna" "intergender" "interplciowy" "multisexual" "multi-seksualny" "omnisexual" "omniseksualny" "skoliosexual" "skolioseksualny" "third-gender" "trzecia-plec" "xenogender" "ksenoplciowy" "graysexual" "demigender" "neutrois" "androgyne" "biromantic" "panromantic"
	regex: /(?:nie(?:konformistycz|binar)|alloromantycz)n[ay]|t(?:rans(?:seksualistk?a|flag)|wo\\-spirit)|multi\\-seksualny|skoliose(?:ksualny|xual)|(?:demidziewczyn|lesbijsk)a|(?:trans(?:seksualn|ow)|cispłciow)[ay]|inter(?:seksualn[aiy]|gender)|(?:nonconformin|genderfla)g|(?:allo|demi)seksualn[ay]|omnise(?:ksualny|xual)|(?:a(?:llo)?romanti|demichłopie|trzecia\\-ple)c|pan(?:seksualn[ay]|romantic)|(?:(?:third\\-|(?:(?:trans|(?:bi|a))|cis))|xeno)gender|aromantyczn[aiy]|(?:pangenderow|interplciow|ksenoplciow|(?:dwuduch|tranzyt)ow|(?:dwu|bez)płciow|nonbinar|demibo|ga)y|ge(?:nderfluid|j(?:owski|e))|(?:gender)?queer|(?:bi|a)seksualn[aiy]|(?:(?:(?:(?:(?:(?:trans|(?:bi|a))|(?:allo|demi))|pan)|tran)|gray)|multi)sexual|biromantic|demigender|pangender|androgyne|lesbi(?:j(?:ek|k[ai])|an)|neutrois|demigirl|lgbt/i,
	file: 'sites/lgbtqplus2.txt',
}, {
	title: 'Blocks websites related to gambling, betting, and casinos, etc.',
	description: 'Active, inactive, and parked domains. Includes websites related to online casinos, poker, sports betting, lottery, slot machines, blackjack, roulette, and other forms of gambling and betting activities.',
	category: 'Gambling',
	// grex "casino" "poker" "betting" "keydrop" "csgo-skins" "roulette" "blackjack" "slots" "gambling" "lottery" "jackpot" "craps" "bookmaker" "keno" "betonline" "scratchcards" "crashgame" "rollbit"
	regex: /s(?:cratchcard|lot)s|c(?:sgo\\-skin|rap)s|b(?:lackjack|ookmaker)|(?:crashgam|betonlin)e|ro(?:ulette|llbit)|gambling|ke(?:ydrop|no)|lottery|jackpot|betting|casino|poker/i,
	file: 'gambling/sefinek.hosts2.txt',
}, {
	title: 'Blocks websites with adult content, pornography, and explicit material',
	description: 'Active, inactive, and parked domains. Includes websites featuring pornography, erotic material, camgirl platforms, escort services, BDSM communities, swingers, and other explicit content related to adult entertainment.',
	category: 'Adult',
	// grex "porn" "onlyfans" "xvideos" "redtube" "pornhub" "nudity" "camshow" "livesex" "sexcam" "xxx" "nude" "rule34" "sexual" "erotic" "bdsm" "voyeur" "camgirl" "escort" "prostitution" "stripclub" "lingerie" "adultsite" "adultcontent" "playboy" "hustler" "sexting" "pornstars" "adultchat" "erotism" "hardcoreporn" "hentai" "ecchi" "tribbing" "pegging" "bdsmcommunity" "swingers" "kink"
	regex: /(?:bdsmcommun|nud)ity|prostitution|h(?:ardcoreporn|entai)|adult(?:c(?:onten|ha)t|site)|s(?:tripclub|excam)|(?:pornstar|swinger|xvideo)s|onlyfans|tribbing|(?:lingeri|redtub)e|playboy|erotism|pornhub|hustler|cam(?:girl|show)|livesex|(?:pegg|sext)ing|erotic|rule34|voyeur|sexual|escort|ecchi|bdsm|porn|kink|nude|xxx/i,
	file: 'porn/sefinek.hosts2.txt',
}, {
	title: 'Blocks websites related to piracy, etc.',
	description: 'Active, inactive, and parked domains. Includes websites offering illegal downloads, torrent files, cracked software, serial keys, hacking tools, and other content related to copyright infringement and piracy.',
	category: 'Piracy',
	// grex "torrent" "pirate" "crack" "warez" "keygen" "serial" "hacking" "illegaldownload" "hacktools" "illegalstream" "crackme" "piratebay"
	regex: /illegal(?:download|stream)|piratebay|hack(?:tools|ing)|crackme|torrent|pirate|keygen|serial|crack|warez/i,
	file: 'piracy/sefinek.hosts.txt',
}, {
	title: 'Blocks websites promoting racism, hate speech, and extremist ideologies',
	description: 'Active, inactive, and parked domains. Includes websites promoting racism, white supremacy, xenophobia, homophobia, antisemitism, islamophobia, and other forms of hate speech and extremist ideologies, such as neo-Nazism and fascism.',
	category: 'Hate Speech',
	// grex "racism" "nazi" "whitesupremacy" "whitenationalism" "antisemitism" "antiislam" "kukluxklan" "neonazi" "extremism" "radicalism" "hatespeech" "holocaustdenial" "xenophobia" "homophobia" "islamophobia" "antisemite" "fascism" "supremacy" "whitepride" "alt-right" "neonazism" "ethnonationalism" "atomwaffen"
	regex: /ethnonationalism|white(?:nationalism|supremacy|pride)|h(?:olocaustdenial|atespeech)|antisemitism|islamophobia|a(?:ntisemite|lt\\-right)|atomwaffen|kukluxklan|radicalism|(?:hom|xen)ophobia|supremacy|(?:neonazis|antiisla)m|(?:extrem|(?:fas|ra)c)ism|neonazi|nazi/i,
	file: 'hate-and-junk/sefinek.hosts.txt',
}, {
	title: 'Blocks most websites related to e-sports, etc.',
	description: 'Active, inactive, and parked domains. Includes websites related to major e-sports tournaments, platforms for competitive gaming, and organizations such as ESL, FaceIT, The International, and Overwatch League.',
	category: 'E-Sport',
	// grex "esport" "e-sport" "hltv" "the-international" "overwatch-league" "esl-pro-league" "intel-extreme" "blast-premier" "pgl-major" "pubg-global-championship" "faceit" "esea.net" "challengermode" "sostronk" "gamersclub" "pvpro.com" "popflash.site" "gampre.pl" "repeat.gg" "playvs.com" "checkmategaming.com" "battlefy.com" "toornament.com" "communitygaming.io" "matcherino.com" "matcherino.com" "skillz.com"
	regex: /pubg\\-global\\-championship|(?:checkmategaming|matcherino|battlefy|skillz|playvs|pvpro)\.com|communitygaming\.io|t(?:he\\-international|oornament\.com)|overwatch\\-league|(?:challengermod|popflash\.sit|intel\\-extrem)e|esl\\-pro\\-league|blast\\-premier|gamersclub|repeat\.gg|pgl\\-major|gampre\.pl|e(?:s(?:ea\.ne|por)|\\-spor)t|sostronk|faceit|hltv/i,
	// grex "finesport" "livesport" "thesport" "familjenesport" "simplesport" "cyclesport" "teamsport" "worldsport" "allsport" "realsport" "prosport" "schoolsport" "football" "basketball" "volleyball" "baseball" "athletics" "olympics" "marathon" "runningsport" "watersport" "motorsport" "outdoorsport"
	whitelist: /(?:f(?:amilje|i)n|liv|th)esport|(?:running|(?:outdo|mot)or|w(?:ater|orld)|team|(?:rea|al)l|pro)sport|s(?:chool|imple)sport|(?:bas(?:ket|e)|foot)ball|volleyball|cyclesport|athletics|marathon|olympics/i,
	file: 'sites/esport.txt',
}, {
	title: 'Blocks most social media platforms and related websites (beta)',
	description: 'A mix of active, inactive, and parked domains. The list also includes phishing domains associated with popular social media platforms.',
	category: 'Social Media',
	// grex "facebook" "twitter" "instagram" "tiktok" "snapchat" "linkedin" "pinterest" "reddit" "tumblr" "mastodon" "ytcommunity"
	regex: /ytcommunity|instagram|pinterest|facebook|linkedin|mastodon|(?:snapcha|reddi)t|t(?:(?:witte|umbl)r|iktok)/i,
	file: 'sites/social-media.txt',
}, {
	title: 'Blocks video and audio streaming platforms (beta)',
	description: 'Active, inactive, and parked domains. Blocks websites for video and audio streaming services such as YouTube, Netflix, Spotify, Disney+, Hulu, and Twitch. The list also includes phishing domains.',
	category: 'Streaming Media',
	// grex "youtube" "netflix" "spotify" "disneyplus" "hulu" "twitch" "vimeo" "soundcloud" "hbo" "applemusic" "itunes" "primevideo" "crunchyroll" "hbomax"
	regex: /crunchyroll|s(?:oundcloud|potify)|applemusic|disneyplus|primevideo|netflix|youtube|twitch|hbomax|itunes|vimeo|hulu|hbo/i,
	file: 'sites/streaming-media.txt',
}, {
	title: 'Blocks e-commerce websites and online shopping platforms (beta)',
	description: 'Active, inactive, and parked domains. Blocks online shopping websites like Amazon, eBay, AliExpress, Etsy, Wish, and others. The list also includes phishing domains.',
	category: 'Shopping',
	// grex "amazon" "ebay" "aliexpress" "etsy" "wish" "shopify" "zalando" "ikea" "alibaba" "ebay-kleinanzeigen" "olx" "allegro" "vinted" "temu" "shein" "cdiscount"
	regex: /(?:ebay\\-kleinanzeige|shei)n|a(?:li(?:express|baba)|mazon)|cdiscount|shopify|allegro|zalando|vinted|ebay|temu|wish|etsy|ikea|olx/i,
	file: 'sites/shopping.txt',
}];

exports.GLOBAL_WHITELIST = [];

exports.fileUrls = [
	// Misc
	{ url: 'https://raw.githubusercontent.com/shreshta-labs/newly-registered-domains/main/nrd-1w.csv', name: 'shreshta-labs_nrd-1w.txt' },
	{ url: 'https://github.com/spaze/domains/raw/main/tld-cz.txt', name: 'spaze_tld-cz.txt' },

	// xRuffKez
	{ url: 'https://raw.githubusercontent.com/xRuffKez/NRD/main/lists/30-day/domains-only/nrd-30day_part1.txt', name: 'xRuffKez_nrd-30day-part1.txt' },
	{ url: 'https://raw.githubusercontent.com/xRuffKez/NRD/main/lists/30-day/domains-only/nrd-30day_part2.txt', name: 'xRuffKez_nrd-30day-part2.txt' },
	{ url: 'https://publicsuffix.org/list/public_suffix_list.dat', name: 'publicsuffix_public_suffix_list.txt' },

	// whoisds
	{ url: 'https://www.whoisds.com/whois-database/newly-registered-domains/MjAyNS0wNC0yMy56aXA=/nrd', name: 'whoisds1.zip' },
	{ url: 'https://www.whoisds.com/whois-database/newly-registered-domains/MjAyNS0wNC0yMi56aXA=/nrd', name: 'whoisds2.zip' },
	{ url: 'https://www.whoisds.com/whois-database/newly-registered-domains/MjAyNS0wNC0yMS56aXA=/nrd', name: 'whoisds3.zip' },
	{ url: 'https://www.whoisds.com/whois-database/newly-registered-domains/MjAyNS0wNC0yMC56aXA=/nrd', name: 'whoisds4.zip' },

	// tb0hdan
	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/generic_lgbt/domain2multi-lgbt00.txt.xz', name: 'tb0hdan_generic-lgbt.xz' },
	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/generic_gay/domain2multi-gay00.txt.xz', name: 'tb0hdan_generic-gay.xz' },

	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/germany/domain2multi-de00.txt.xz', name: 'tb0hdan_d2m-de00.xz' },
	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/germany/domain2multi-de01.txt.xz', name: 'tb0hdan_d2m-de01.xz' },
	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/germany/domain2multi-de02.txt.xz', name: 'tb0hdan_d2m-de02.xz' },
	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/germany/domain2multi-de03.txt.xz', name: 'tb0hdan_d2m-de03.xz' },
	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/germany/domain2multi-de04.txt.xz', name: 'tb0hdan_d2m-de04.xz' },
	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/germany/domain2multi-de05.txt.xz', name: 'tb0hdan_d2m-de05.xz' },
	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/germany/domain2multi-de06.txt.xz', name: 'tb0hdan_d2m-de06.xz' },
	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/germany/domain2multi-de07.txt.xz', name: 'tb0hdan_d2m-de07.xz' },

	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/poland/domain2multi-pl00.txt.xz', name: 'tb0hdan_d2m-pl00.xz' },
	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/poland/domain2multi-pl01.txt.xz', name: 'tb0hdan_d2m-pl01.xz' },
	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/poland/domain2multi-pl02.txt.xz', name: 'tb0hdan_d2m-pl02.xz' },

	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/united_states/domain2multi-us00.txt.xz', name: 'tb0hdan_d2m-us00.xz' },
	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/united_kingdom/domain2multi-uk00.txt.xz', name: 'tb0hdan_d2m-uk00.xz' },
	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/united_kingdom/domain2multi-uk01.txt.xz', name: 'tb0hdan_d2m-uk01.xz' },
	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/united_kingdom/domain2multi-uk02.txt.xz', name: 'tb0hdan_d2m-uk02.xz' },

	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/venezuela/domain2multi-ve00.txt.xz', name: 'tb0hdan_d2m-ve00.xz' },

	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/australia/domain2multi-au00.txt.xz', name: 'tb0hdan_d2m-au00.xz' },
	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/australia/domain2multi-au01.txt.xz', name: 'tb0hdan_d2m-au01.xz' },
	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/australia/domain2multi-au02.txt.xz', name: 'tb0hdan_d2m-au02.xz' },

	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/austria/domain2multi-at00.txt.xz', name: 'tb0hdan_d2m-at00.xz' },

	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/south_africa/domain2multi-za00.txt.xz', name: 'tb0hdan_d2m-za00.xz' },

	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/canada/domain2multi-ca00.txt.xz', name: 'tb0hdan_d2m-ca00.xz' },
	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/canada/domain2multi-ca01.txt.xz', name: 'tb0hdan_d2m-ca01.xz' },

	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/chile/domain2multi-cl00.txt.xz', name: 'tb0hdan_d2m-cl00.xz' },

	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/new_zealand/domain2multi-nz00.txt.xz', name: 'tb0hdan_d2m-nz00.xz' },

	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/philippines/domain2multi-ph00.txt.xz', name: 'tb0hdan_d2m-ph00.xz' },

	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/israel/domain2multi-il00.txt.xz', name: 'tb0hdan_d2m-il00.xz' },

	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/thailand/domain2multi-th00.txt.xz', name: 'tb0hdan_d2m-th00.xz' },

	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/brazil/domain2multi-br00.txt.xz', name: 'tb0hdan_d2m-br00.xz' },
	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/brazil/domain2multi-br01.txt.xz', name: 'tb0hdan_d2m-br01.xz' },
	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/brazil/domain2multi-br02.txt.xz', name: 'tb0hdan_d2m-br02.xz' },
	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/brazil/domain2multi-br03.txt.xz', name: 'tb0hdan_d2m-br03.xz' },

	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/sweden/domain2multi-se00.txt.xz', name: 'tb0hdan_d2m-se00.xz' },
	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/sweden/domain2multi-se01.txt.xz', name: 'tb0hdan_d2m-se01.xz' },

	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/spain/domain2multi-es00.txt.xz', name: 'tb0hdan_d2m-es00.xz' },
	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/spain/domain2multi-es01.txt.xz', name: 'tb0hdan_d2m-es01.xz' },

	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/france/domain2multi-fr00.txt.xz', name: 'tb0hdan_d2m-fr00.xz' },
	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/france/domain2multi-fr01.txt.xz', name: 'tb0hdan_d2m-fr01.xz' },
	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/france/domain2multi-fr02.txt.xz', name: 'tb0hdan_d2m-fr02.xz' },
	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/france/domain2multi-fr03.txt.xz', name: 'tb0hdan_d2m-fr03.xz' },

	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/netherlands/domain2multi-nl00.txt.xz', name: 'tb0hdan_d2m-nl00.xz' },
	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/netherlands/domain2multi-nl01.txt.xz', name: 'tb0hdan_d2m-nl01.xz' },

	{ url: 'https://github.com/tb0hdan/domains/raw/master/data/iceland/domain2multi-is00.txt.xz', name: 'tb0hdan_d2m-is00.xz' },
];