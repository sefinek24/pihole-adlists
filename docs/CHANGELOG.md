[//]: # (Canonical: /docs/CHANGELOG.md)

# 📦 Changelog - Sefinek Blocklist Collection
To stay up to date with the latest changes, list updates, and information about added or removed sources, we encourage you to join our [Discord server](https://discord.gg/38gCM3agfa).
On the server, we publish upcoming changes, technical details about updates, as well as information about potential issues and their resolutions.
It is also a place where you can suggest new lists, report bugs, false positives, and share your feedback about the project.
The project uses semantic versioning. Thank you for choosing Sefinek Blocklists!


## Version 0.21.0 from 08.04.2026
1. Generated blocklists have been moved to a dedicated `blocklists` orphan branch, keeping the `main` branch history clean and free from automated commits.
2. Sefinek's curated domain lists have been moved from `blocklists/templates/` to a new `lists/` directory directly on `main`, making them easy to browse and manage.
3. The `update-blocklists` workflow now triggers only on changes to `lists/**` instead of any `.txt` file.
4. Updated `pull.sh` to sync both `main` and the `blocklists` branch via git worktree.


## Version 0.20.0 from 17.03.2026
1. Added the ability to report false positives at [/false-positives](https://blocklist.sefinek.net/false-positives).
2. Added a sound when navigating to folders in File Explorer.
3. Fixed an issue with last modified dates in File Explorer.
4. Improved security measures.
5. Various performance improvements.
6. Fixed rate limiter counters not being shared across cluster workers.
7. Minor fixes.


## Version 0.19.0 from 3.03.2026
1. Improved the design of https://sefinek.net/blocklist-generator.
2. Added a new list: https://blocklist.sefinek.net/generated/v1/0.0.0.0/tracking-and-telemetry/sefinek.hosts.txt
3. Completely redesigned the project frontend to make it more modern and intuitive.
4. Added a new subpage [/metrics](https://blocklist.sefinek.net/metrics) with extended statistics.
5. Templates no longer use the `0.0.0.0` prefix and are now saved as standard hosts files for greater convenience.
6. Renamed: `malicious/sefinek.hosts2.txt`, `malicious/sefinek.hosts1.txt` to `malicious/sefinek.hosts.txt`.
7. Moved `crypto/sites/sefinek.hosts.txt` to `crypto/sefinek.hosts.txt`.
8. Removed the following lists:
   - malicious/digitalside/latestdomains.fork.txt
   - ads/blocklistproject/youtube.fork.txt
   - hate-and-junk/developerdan/extended.fork.txt
   - hate-and-junk/sefinek.hosts.txt
   - developerdan/amp-hosts-extended.fork.txt
   - piracy/sefinek.hosts.txt
   - malicious/suspicious.txt
9. Introduced additional improvements and optimizations.
10. And many more changes and fixes!


## Version 0.18.0 from 27.04.2025
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


## Version 0.17.0 from 14.07.2024
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


## Version 0.16.0 from 28.05.2024
1. Removed `ads/kboghdady/youtubelist.fork.txt` from the lists.
2. Added:
    - `fakenews/StevenBlack/hosts.fork.txt`
    - `gambling/StevenBlack/hosts.fork.txt`
    - `porn/StevenBlack/porn.fork.txt`
3. Pixiv will now be `checked` by default in the blocklist generator.
4. Other improvements.


## Version 0.15.1 - 22.05.2024
1. Updated all dependencies.
2. Updated Eslint to version 9.
3. Performed code cleanup.
4. Added Unbound and RPZ formats to the [lists/Index.md](https://blocklist.sefinek.net/docs/lists/Index.md) file.
5. Other improvements and fixes.


## Version 0.15.0 from 18.05.2024
1. Added support for RPZ format and Unbound. [#25](https://github.com/sefinek/Sefinek-Blocklist-Collection/issues/26)
2. Added a new blocklist `gambling/TrustPositif/gambling-indonesia.fork.txt`. [#26](https://github.com/sefinek/Sefinek-Blocklist-Collection/issues/25)
3. The scripts responsible for generating block lists have been significantly improved
4. Other quality fixes.


## Version 0.14.0 from 10.03.2024
1. The repository has been equipped with a [whitelist](https://github.com/sefinek/Sefinek-Blocklist-Collection/blob/main/whitelists/main.txt). Domains or subdomains on this list will NEVER appear in the selected blocklists.
2. Blocklists have been organized by category (the links to these lists have been changed).
3. Scripts responsible for generating the blocklists have been corrected.
4. Additional improvements have been made.


## Version 0.13.1 from 30.01.2024
1. Added [LICENSE](https://github.com/sefinek/Sefinek-Blocklist-Collection/blob/main/LICENSE).
2. Updated all dependencies.
3. Updated blocklists.
4. Other fixes and improvements.


## Version 0.13.0 from 10.12.2023
1. Updated node modules. [[59c80cf](https://github.com/sefinek/Sefinek-Blocklist-Collection/commit/59c80cf6a2aa2d786b03a2b8fdec9d47012592bd)]
2. Improved responsiveness of the block list generator.
3. Enhanced the appearance of modals.
4. Now you can download the generated collection of URL addresses.
5. Users can also send the generated collection to their email address.
6. Other fixes and improvements have been made.


## Version -.-.- from 30.11.2023
1. Added a few missing URLs.
2. Removed deprecated links.
