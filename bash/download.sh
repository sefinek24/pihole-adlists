#!/bin/bash

# Each blocklist is stored in a directory named after its author.
# The downloaded file is saved with the suffix "fork" to indicate that it is a modified copy.
# Below is a list of blocklist URLs along with their respective destination paths.
urls=(
  # Abuse
  "https://blocklistproject.github.io/Lists/abuse.txt abuse/blocklistproject/hosts.fork.txt"
  "https://urlhaus.abuse.ch/downloads/hostfile abuse/urlhaus.abuse.ch/hostfile.fork.txt"

  # Advertising
  "https://adaway.org/hosts.txt ads/adaway/hosts.fork.txt"
  "https://blocklistproject.github.io/Lists/ads.txt ads/blocklistproject/hosts.fork.txt"
  "https://blocklistproject.github.io/Lists/youtube.txt ads/blocklistproject/youtube.fork.txt"
  "https://pgl.yoyo.org/adservers/serverlist.php?hostformat=hosts&mimetype=plaintext&useip=0.0.0.0 ads/yoyo/ads-trackers-etc.fork.txt"
  "https://raw.githubusercontent.com/0Zinc/easylists-for-pihole/master/easylist.txt ads/0Zinc/easylist.fork.txt"
  "https://raw.githubusercontent.com/anudeepND/blacklist/master/adservers.txt ads/anudeepND/adservers.fork.txt"
  "https://raw.githubusercontent.com/craiu/mobiletrackers/master/list.txt ads/craiu/mobiletrackers.fork.txt"
  "https://raw.githubusercontent.com/crazy-max/WindowsSpyBlocker/master/data/hosts/spy.txt ads/crazy-max/spy.fork.txt"
  "https://raw.githubusercontent.com/FadeMind/hosts.extras/master/UncheckyAds/hosts ads/FadeMind/UncheckyAds.fork.txt"
  "https://raw.githubusercontent.com/jerryn70/GoodbyeAds/master/Hosts/GoodbyeAds.txt ads/jerryn70/GoodbyeAds.fork.txt"
  "https://raw.githubusercontent.com/kboghdady/youTube_ads_4_pi-hole/master/youtubelist.txt ads/kboghdady/youtubelist.fork.txt"
  "https://raw.githubusercontent.com/MajkiIT/polish-ads-filter/master/polish-pihole-filters/SmartTV_ads.txt ads/MajkiIT/SmartTV-ads.fork.txt"
  "https://raw.githubusercontent.com/r-a-y/mobile-hosts/master/AdguardMobileAds.txt ads/r-a-y/AdguardMobileAds.fork.txt"
  "https://raw.githubusercontent.com/ShadowWhisperer/BlockLists/master/Lists/Ads ads/ShadowWhisperer/Ads.fork.txt"
  "https://s3.amazonaws.com/lists.disconnect.me/simple_ad.txt ads/disconnectme/simple-ad.fork.txt"
  "https://v.firebog.net/hosts/AdguardDNS.txt ads/firebog/AdguardDNS.fork.txt"
  "https://v.firebog.net/hosts/Admiral.txt ads/firebog/Admiral.fork.txt"
  "https://v.firebog.net/hosts/Easylist.txt ads/firebog/Easylist.fork.txt"
  "https://v.firebog.net/hosts/Prigent-Ads.txt ads/firebog/Prigent-Ads.fork.txt"

  # AMP hosts
  "https://ente.dev/api/blocklist/google-amp-hosts amp/ente-dev/google-amp-hosts.fork.txt"
  "https://www.github.developerdan.com/hosts/lists/amp-hosts-extended.txt amp/developerdan/amp-hosts-extended.fork.txt"

  # CryptoJacking
  "https://raw.githubusercontent.com/hoshsadiq/adblock-nocoin-list/master/hosts.txt crypto/cryptojacking/hoshsadiq/adblock-nocoin-list.fork.txt"
  "https://raw.githubusercontent.com/Snota418/Youtube-spam-host-list/main/Crypto%20streams crypto/cryptojacking/Snota418/Crypto-streams.fork.txt"
  "https://v.firebog.net/hosts/Prigent-Crypto.txt crypto/cryptojacking/firebog/Prigent/Crypto.fork.txt"

  # Dating services
  "https://raw.githubusercontent.com/ShadowWhisperer/BlockLists/master/Lists/Dating dating-services/ShadowWhisperer/dating.fork.txt"
  "https://www.github.developerdan.com/hosts/lists/dating-services-extended.txt dating-services/developerdan/extended.fork.txt"

  # Drugs
  "https://blocklistproject.github.io/Lists/drugs.txt drugs/blocklistproject/drugs.fork.txt"

  # Fake news
  "https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/fakenews-only/hosts fakenews/StevenBlack/hosts.fork.txt"
  "https://raw.githubusercontent.com/marktron/fakenews/master/fakenews fakenews/marktron/hosts.fork.txt"

  # Gambling
  "https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/gambling-only/hosts gambling/StevenBlack/hosts.fork.txt"
  "https://blocklistproject.github.io/Lists/gambling.txt gambling/blocklistproject/hosts.fork.txt"
  "https://raw.githubusercontent.com/alsyundawy/TrustPositif/main/gambling_indonesia.txt gambling/TrustPositif/gambling-indonesia.fork.txt"
  "https://raw.githubusercontent.com/MajkiIT/polish-ads-filter/master/polish-pihole-filters/gambling-hosts.txt gambling/MajkiIT/gambling-hosts.fork.txt"

  # Hate and junk
  "https://www.github.developerdan.com/hosts/lists/hate-and-junk-extended.txt hate-and-junk/developerdan/extended.fork.txt"

  # Malicious
  "https://blocklistproject.github.io/Lists/malware.txt malicious/blocklistproject/malware.fork.txt"
  "https://gitlab.com/quidsup/notrack-blocklists/raw/master/malware.list malicious/quidsup/notrack-malware.fork.txt"
  "https://malware-filter.gitlab.io/malware-filter/urlhaus-filter-hosts-online.txt malicious/malware-filter/urlhaus-filter-hosts-online.fork.txt"
  "https://osint.digitalside.it/Threat-Intel/lists/latestdomains.txt malicious/digitalside/latestdomains.fork.txt"
  "https://raw.githubusercontent.com/AssoEchap/stalkerware-indicators/master/generated/hosts malicious/AssoEchap/stalkerware-indicators.fork.txt"
  "https://raw.githubusercontent.com/bigdargon/hostsVN/master/hosts malicious/bigdargon/hostsVN.fork.txt"
  "https://raw.githubusercontent.com/DandelionSprout/adfilt/master/Alternate%20versions%20Anti-Malware%20List/AntiMalwareHosts.txt malicious/DandelionSprout-AntiMalwareHosts.fork.txt"
  "https://raw.githubusercontent.com/RPiList/specials/master/Blocklisten/malware malicious/RPiList/Malware.fork.txt"
  "https://raw.githubusercontent.com/ShadowWhisperer/BlockLists/master/Lists/Malware malicious/ShadowWhisperer/malware.fork.txt"
  "https://raw.githubusercontent.com/Spam404/lists/master/main-blacklist.txt malicious/Spam404/main-blacklist.fork.txt"
  "https://s3.amazonaws.com/lists.disconnect.me/simple_malvertising.txt malicious/disconnectme/simple-malvertising.fork.txt"

  # Phishing
  "https://blocklistproject.github.io/Lists/phishing.txt phishing/blocklistproject/phishing.fork.txt"
  "https://phishing.army/download/phishing_army_blocklist_extended.txt phishing/phishing.army/blocklist-extended.fork.txt"
  "https://raw.githubusercontent.com/Dogino/Discord-Phishing-URLs/main/pihole-phishing-adlist.txt phishing/Dogino/Discord-Phishing-URLs-phishing.fork.txt"
  "https://raw.githubusercontent.com/RPiList/specials/master/Blocklisten/Phishing-Angriffe phishing/RPiList/Phishing-Angriffe.fork.txt"

  # Piracy
  "https://blocklistproject.github.io/Lists/piracy.txt piracy/blocklistproject/piracy.fork.txt"

  # Porn & Adult
  "https://blocklistproject.github.io/Lists/porn.txt porn/blocklistproject/porn.fork.txt"
  "https://nsfw.oisd.nl/domainswild2 porn/oisd/nsfw.fork.txt"
  "https://raw.githubusercontent.com/4skinSkywalker/Anti-Porn-HOSTS-File/master/HOSTS.txt porn/4skinSkywalker/hosts.fork.txt"
  "https://raw.githubusercontent.com/chadmayfield/my-pihole-blocklists/master/lists/pi_blocklist_porn_all.list porn/chadmayfield/pi-blocklist-porn-all.fork.txt"
  "https://raw.githubusercontent.com/ShadowWhisperer/BlockLists/master/Lists/Adult porn/ShadowWhisperer/adult.fork.txt"
  "https://raw.githubusercontent.com/Sinfonietta/hostfiles/master/pornography-hosts porn/Sinfonietta/pornography-hosts.fork.txt"
  "https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/porn-only/hosts porn/StevenBlack/porn.fork.txt"

  # Ransomware
  "https://blocklistproject.github.io/Lists/ransomware.txt ransomware/blocklistproject/ransomware.fork.txt"

  # Redirects
  "https://blocklistproject.github.io/Lists/redirect.txt redirect/blocklistproject/redirect.fork.txt"

  # Scam
  "https://blocklistproject.github.io/Lists/scam.txt scam/blocklistproject/scam.fork.txt"
  "https://raw.githubusercontent.com/Dogino/Discord-Phishing-URLs/main/scam-urls.txt scam/Dogino/Discord-Phishing-URLs-scam.fork.txt"
  "https://raw.githubusercontent.com/durablenapkin/scamblocklist/master/hosts.txt scam/durablenapkin/scamblocklist.fork.txt"
  "https://raw.githubusercontent.com/jarelllama/Scam-Blocklist/main/lists/wildcard_domains/scams.txt scam/jarelllama/scam.fork.txt"
  "https://raw.githubusercontent.com/ShadowWhisperer/BlockLists/master/Lists/Scam scam/ShadowWhisperer/scam.fork.txt"

  # Polish filters
  "https://hole.cert.pl/domains/v2/domains.txt other/polish-blocklists/cert.pl/domains-hosts.fork.txt"
  "https://raw.githubusercontent.com/MajkiIT/polish-ads-filter/master/polish-pihole-filters/hostfile.txt other/polish-blocklists/MajkiIT/hostfile.fork.txt"
  "https://raw.githubusercontent.com/PolishFiltersTeam/KADhosts/master/KADhosts.txt other/polish-blocklists/PolishFiltersTeam/KADhosts.fork.txt"

  # Spam
  "https://raw.githubusercontent.com/FadeMind/hosts.extras/master/add.Spam/hosts spam/FadeMind/add-Spam.fork.txt"
  "https://raw.githubusercontent.com/RPiList/specials/master/Blocklisten/spam.mails spam/RPiList/spam-mails.fork.txt"
  "https://www.stopforumspam.com/downloads/toxic_domains_whole.txt spam/stopforumspam/toxic-domains-whole.fork.txt"

  # Tracking and telemetry
  "https://ente.dev/api/blocklist/tv tracking-and-telemetry/ente-dev/tv.fork.txt"
  "https://gitlab.com/quidsup/notrack-blocklists/-/raw/master/trackers.hosts tracking-and-telemetry/quidsup/trackers-hosts.fork.txt"
  "https://hostfiles.frogeye.fr/firstparty-trackers-hosts.txt tracking-and-telemetry/frogeye/firstparty-trackers-hosts.txt"
  "https://raw.githubusercontent.com/0Zinc/easylists-for-pihole/master/easyprivacy.txt tracking-and-telemetry/0Zinc/easyprivacy.fork.txt"
  "https://raw.githubusercontent.com/MajkiIT/polish-ads-filter/master/polish-pihole-filters/adguard_mobile_host.txt tracking-and-telemetry/MajkiIT/adguard-mobile-host.fork.txt"
  "https://raw.githubusercontent.com/neodevpro/neodevhost/master/host tracking-and-telemetry/neodevpro/host.fork.txt"
  "https://raw.githubusercontent.com/ShadowWhisperer/BlockLists/master/Lists/Tracking tracking-and-telemetry/ShadowWhisperer/tracking.fork.txt"

  # Suspicious
  "https://raw.githubusercontent.com/FadeMind/hosts.extras/master/add.Risk/hosts suspicious/FadeMind/add-Risk.fork.txt"
  "https://v.firebog.net/hosts/static/w3kbl.txt suspicious/firebog/w3kbl.fork.txt"

  # Extension
  "https://big.oisd.nl/domainswild2 extensions/oisd/big.fork.txt"
  "https://justdomains.github.io/blocklists/lists/adguarddns-justdomains.txt extensions/justdomains/adguarddns-justdomains.fork.txt"
  "https://raw.githubusercontent.com/deathbybandaid/piholeparser/master/Subscribable-Lists/CountryCodesLists/France.txt extensions/deathbybandaid/CountryCodesLists-France.fork.txt"
  "https://raw.githubusercontent.com/deathbybandaid/piholeparser/master/Subscribable-Lists/ParsedBlacklists/EasyList-Liste-FR.txt extensions/deathbybandaid/ParsedBlacklists-EasyList-Liste-FR.fork.txt"
  "https://raw.githubusercontent.com/deathbybandaid/piholeparser/master/Subscribable-Lists/ParsedBlacklists/EasyList.txt extensions/deathbybandaid/ParsedBlacklists-EasyList.fork.txt"
  "https://raw.githubusercontent.com/FadeMind/hosts.extras/master/add.2o7Net/hosts extensions/FadeMind/add-2o7Net.fork.txt"
  "https://raw.githubusercontent.com/hagezi/dns-blocklists/main/hosts/pro.txt extensions/hagezi/pro.fork.txt"
  "https://raw.githubusercontent.com/MajkiIT/polish-ads-filter/master/polish-pihole-filters/adguard_host.txt extensions/MajkiIT/adguard-host.fork.txt"
  "https://raw.githubusercontent.com/MajkiIT/polish-ads-filter/master/polish-pihole-filters/easy_privacy_host.txt extensions/MajkiIT/easy-privacy-host.fork.txt"
  "https://raw.githubusercontent.com/r-a-y/mobile-hosts/master/AdguardApps.txt extensions/r-a-y/AdguardApps.fork.txt"
  "https://raw.githubusercontent.com/r-a-y/mobile-hosts/master/AdguardMobileSpyware.txt extensions/r-a-y/AdguardMobileSpyware.fork.txt"

  # Fraud
  "https://blocklistproject.github.io/Lists/fraud.txt fraud/blocklistproject/hosts.fork.txt"

  # StevenBlack hosts
  "https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts other/StevenBlack/hosts.fork.txt"
  "https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/fakenews-gambling-porn/hosts other/StevenBlack/fakenews-gambling-porn.fork.txt"

  # Useless websites
  "https://raw.githubusercontent.com/jarelllama/Scam-Blocklist/main/data/parked_domains.txt useless-websites/jarelllama/parked-domains.fork.txt"

  # Dead domains
  "https://raw.githubusercontent.com/jarelllama/Scam-Blocklist/main/data/dead_domains.txt dead-domains/jarelllama/dead-domains.fork.txt"
)

# Verify required dependencies are installed
for cmd in curl node; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "❌ '$cmd' is not installed."
    exit 1
  fi
done

# Set base directory for downloads
base_output_dir="blocklists/templates"
if [ ! -d "$base_output_dir" ]; then
  mkdir -p "$base_output_dir"
  echo "🔵 Created directory: $base_output_dir"
fi

# Read version from package.json to build User-Agent
if [ -f "./package.json" ]; then
  version=$(node -p "require('./package.json').version")
  user_agent="Mozilla/5.0 (compatible; SefinekBlocklists/${version}; +https://blocklist.sefinek.net)"
else
  echo "🔴 package.json not found."
  exit 1
fi

# Function: format file size
format_size() {
  local bytes=$1
  if ((bytes >= 1048576)); then
    printf "%.2f MB" "$(awk "BEGIN {print $bytes/1048576}")"
  elif ((bytes >= 1024)); then
    printf "%.2f KB" "$(awk "BEGIN {print $bytes/1024}")"
  else
    printf "%d B" "$bytes"
  fi
}

# Function to download a single file
download_file() {
  local entry="$1"
  local download_url="${entry%% *}"
  local relative_path="${entry#* }"
  local full_path="$base_output_dir/$relative_path"
  local file_dir
  file_dir=$(dirname "$full_path")

  mkdir -p "$file_dir"

  local file_size
  if file_size=$(curl --silent --show-error --location --user-agent "$user_agent" --retry 3 --retry-delay 2 --retry-max-time 30 --output "$full_path" --write-out "%{size_download}" "$download_url"); then
    local formatted_size
    formatted_size=$(format_size "$file_size")
    echo "✔️ Downloaded: $download_url [$formatted_size]"
  else
    echo "❌ Failed to download: $download_url"
  fi
}

echo "🔵 Starting to download ${#urls[@]} files..."
max_jobs=4
current_jobs=0

for entry in "${urls[@]}"; do
  download_file "$entry" &
  ((current_jobs++))

  if (( current_jobs >= max_jobs )); then
    wait -n
    ((current_jobs--))
  fi
done

wait
