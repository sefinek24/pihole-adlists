[//]: # (Canonical: /docs/CHANGELOG.md)

## Update v0.18.0 - 27.04.2025
1. Added new domain lists collected using regular expressions. See [this file](https://github.com/sefinek/Sefinek-Blocklist-Collection/blob/main/scripts/generate/file-processor/scripts/data.js) for more details.
   - `anime/main.txt`
   - `sites/lgbtqplus2.txt`
   - `gambling/sefinek.hosts2.txt`
   - `porn/sefinek.hosts2.txt`
   - `piracy/sefinek.hosts.txt`
   - `hate-and-junk/sefinek.hosts.txt`
   - `sites/esport.txt`
   - `sites/social-media.txt`
2. Updated Express.js to version 5.
3. Implemented own file-serving solution. Files are now served about 500ms faster!
4. Optimized statistics collection and reduced database load.
5. Minor quality fixes and performance improvements.
6. Enhanced the list generator UI ([sefinek.net](https://sefinek.net/blocklist-generator)).

## Update v0.17.0 - 14.07.2024
1. Added:
   - `dating-services/ShadowWhisperer/dating.fork.txt`
   - `malicious/ShadowWhisperer/malware.fork.txt`
   - `porn/ShadowWhisperer/adult.fork.txt`
   - `scam/ShadowWhisperer/scam.fork.txt`
   - `tracking-and-telemetry/ShadowWhisperer/tracking.fork.txt`
   - `dating-services/sefinek.hosts.txt`
2. The code responsible for gathering statistics has been optimized. From now on, the statistics will not impact the file serving time, etc.
3. Code cleanup and other improvements.
4. Updated dependencies to the latest versions.
5. Other fixes.

## Update v0.16.0 - 28.05.2024
1. Removed `ads/kboghdady/youtubelist.fork.txt` from the lists.
2. Added:
    - `fakenews/StevenBlack/hosts.fork.txt`
    - `gambling/StevenBlack/hosts.fork.txt`
    - `porn/StevenBlack/porn.fork.txt`
3. Pixiv will now be `checked` by default in the blocklist generator.
4. Other improvements.

## Update v0.15.1 - 22.05.2024
1. Updated all dependencies.
2. Updated Eslint to version 9.
3. Performed code cleanup.
4. Added Unbound and RPZ formats to the [lists/Index.md](lists/Index.md) file.
5. Other improvements and fixes.

## Update v0.15.0 - 18.05.2024
1. Added support for RPZ format and Unbound. [#25](https://github.com/sefinek/Sefinek-Blocklist-Collection/issues/26)
2. Added a new blocklist `gambling/TrustPositif/gambling-indonesia.fork.txt`. [#26](https://github.com/sefinek/Sefinek-Blocklist-Collection/issues/25)
3. The scripts responsible for generating block lists have been significantly improved
4. Other quality fixes.

## Update v0.14.0 - 10.03.2024
1. The repository has been equipped with a [whitelist](https://github.com/sefinek/Sefinek-Blocklist-Collection/blob/main/whitelists/main.txt). Domains or subdomains on this list will NEVER appear in the selected blocklists.
2. Blocklists have been organized by category (the links to these lists have been changed).
3. Scripts responsible for generating the blocklists have been corrected.
4. Additional improvements have been made.

## Update v0.13.1 - 30.01.2024
1. Added [LICENSE](https://github.com/sefinek/Sefinek-Blocklist-Collection/blob/main/LICENSE).
2. Updated all dependencies.
3. Updated blocklists.
4. Other fixes and improvements.

## Update v0.13.0 - 10.12.2023
1. Updated node modules. [[59c80cf](https://github.com/sefinek/Sefinek-Blocklist-Collection/commit/59c80cf6a2aa2d786b03a2b8fdec9d47012592bd)]
2. Improved responsiveness of the block list generator.
3. Enhanced the appearance of modals.
4. Now you can download the generated collection of URL addresses.
5. Users can also send the generated collection to their email address.
6. Other fixes and improvements have been made.

## Update v-.-.- - 30.11.2023
1. Added a few missing urls.
2. Removed deprecated links.
