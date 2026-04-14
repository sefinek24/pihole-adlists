<div align="center"><h1>The best Blocklist Collection ✋<br>made by Sefinek</h1></div>
<img width="37%" align="right" src="images/orange-cat.png" alt="Orange cat">
<div align="center">
    <br><br>
    <img src="https://api.sefinek.net/api/v2/moecounter/@Sefinek-Blocklist-Collection" alt="README.md views" title="Repository views">
    <br>
    <img src="https://img.shields.io/github/stars/sefinek/Sefinek-Blocklist-Collection?label=STARS&style=for-the-badge" alt="Stars">
    <img src="https://img.shields.io/github/commit-activity/m/sefinek/Sefinek-Blocklist-Collection?label=COMMIT+ACTIVITY&style=for-the-badge" alt="Commit activity">
    <br>
    <a href="https://blocklist.sefinek.net">Official website</a> | <a href="https://blocklist.sefinek.net/#stats">More stats</a> | <a href="https://discord.gg/53DBjTuzgZ">Discord server</a>
    <br><br>
    <p>If you find this repository useful, consider giving it a star. You can also support my work by clicking <a href="https://sefinek.net/donate">here</a>. Thank you so much! ⭐</p>
</div>
<br>


## 📃 How to Acquire the Blocklist
- The first option is to generate your own list using the [blocklist generator](https://sefinek.net/blocklist-generator) - recommended for users who want to tailor the list to their specific needs and preferences.
- The second option is to use the [default list](https://github.com/sefinek/Sefinek-Blocklist-Collection/tree/main/docs/lists/md) - ideal for those who prefer a quick and straightforward solution without any configuration.

> [!TIP]  
> Do you have questions or want to receive notifications about important changes or new features in my repositories?
> Join my [Discord server](https://discord.gg/S7NDzCzQTg)! If you do not use Discord, you can also open an [issue on GitHub](https://github.com/sefinek/Sefinek-Blocklist-Collection/issues).

<a href="https://stormserverhosting.com">
  <img src="https://cdn.sefinek.net/images/stormserverhosting/banner-white-gh.png" align="center" alt="Storm Server Hosting">
</a>

> [!IMPORTANT]  
> I do not allow commercial use of my lists. Lists that I did not create are distributed in accordance with the licensing terms set by their original authors.  
> If you wish to use the Sefinek Blocklist Collection for commercial purposes, please contact me via email.

> [!IMPORTANT]  
> Please do not download the lists too frequently (e.g., every few hours). It is recommended to download them no more than once per day. Frequent downloads are unnecessary, as the lists are updated only twice during the night (Polish time). More information can be found [here](https://blocklist.sefinek.net/update-schedule).


## ❌ How to Report a False Positive?
Please visit https://blocklist.sefinek.net/false-positives.
Within 2 days after the analysis is completed, the specified domain will be added to the [whitelist](whitelists/main.txt).
Subsequently, usually within 1 day, the false positive entry will be automatically removed from the blocklist via [GitHub Actions](.github/workflows/update-blocklists.yml).

## 📥 Update Schedule
- **This repository:**  
  The blocklists in this repository are updated every `3 hours` via [GitHub Actions](.github/workflows/download-blocklists.yml).
- **Remote ([blocklist.sefinek.net](https://blocklist.sefinek.net)):**  
  Synchronization takes place daily at `01:00` and `06:00` (24-hour format, Poland time `CET, UTC+1`).  
  Cron expression: `0 1,6 * * *` (at minute 0, at hours 1 and 6).

> [!IMPORTANT]  
> Visit [this page](https://blocklist.sefinek.net/update-schedule) to check the time of the next repository synchronization in your time zone.  
> This will help you schedule your cron job more effectively.


## 🌍 Links
- [Blocklist generator (for Pi-hole, AdGuard, etc.)](https://sefinek.net/blocklist-generator)
- [Homepage of blocklist.sefinek.net (metrics, update schedule, etc.)](https://blocklist.sefinek.net)
- [File explorer (/generated/v1)](https://blocklist.sefinek.net/generated/v1)
- [Git pull logs (synchronization)](https://blocklist.sefinek.net/logs/v1): `Remote` [github.com] → `Local` [blocklist.sefinek.net]


## ✨ Default Blocklist
<details>
  <summary>Click here to view 👀</summary>

  - **Abuse:** Blocks domains associated with harassment or online abuse.
  - **Ads:** Blocks domains serving advertisements.
  - **AMP Hosts:** Blocks Accelerated Mobile Pages hosts, which often display ads and track users.
  - **Cryptomining:** Blocks domains that exploit devices for cryptocurrency mining.
  - **Dating Services:** Blocks dating platforms and related scam domains.
  - **Drugs:** Blocks domains promoting or selling drugs.
  - **Fake News:** Blocks domains known for publishing misleading or false information.
  - **Gambling:** Blocks online gambling websites.
  - **Hate Speech and Low-Quality Sites:** Blocks domains promoting hate speech, disinformation, or low-quality content.
  - **Malware:** Blocks malicious and harmful domains.
  - **Phishing:** Blocks domains used for phishing attacks.
  - **Piracy:** Blocks domains distributing illegal content.
  - **Pornography:** Blocks adult content domains.
  - **Ransomware:** Blocks domains associated with ransomware activity.
  - **Redirects:** Blocks domains that redirect users to unwanted or deceptive pages.
  - **Scams:** Blocks domains involved in fraudulent or scam activities.
  - **Spam:** Blocks domains associated with unsolicited communications.
  - **Spyware:** Blocks domains distributing spyware or adware.
  - **Telemetry and Tracking:** Blocks domains used for tracking and analytics.
  - **Useless Sites:** Blocks parked or low-value domains with no meaningful content.
  - **Social Media and Games:** Blocks platforms such as TikTok, Snapchat, OmeTV, Riot Games, Valorant, League of Legends, and similar services.
</details>

<h3 align="right">
    📃 <a href="https://blocklist.sefinek.net/docs/lists/Index.md">Select your DNS server and copy the URLs »</a><br>
    🔡 <a href="https://blocklist.sefinek.net/docs/lists/Regex.md">View the regex list »</a>
</h3>


## ✅ Good to Know
- New lists are added periodically. You can also install the [Sefinek Blocklists](https://apps.microsoft.com/detail/9p3tnt3pjd0j) app from the Microsoft Store for quick and convenient access to these lists.
- It is recommended to regularly check this repository for updates and potential changes.
- While this blocklist can improve your privacy and security, it may occasionally block legitimate content or services unintentionally.


## 🤝 Contributing
Contributions are welcome — if you have suggestions or ideas, open a [Pull request](https://github.com/sefinek/Sefinek-Blocklist-Collection/pulls) with your proposed changes.
Your efforts are greatly appreciated and help make this project better for everyone. Thank you!

### False positive
Add the incorrectly blocked domain to [whitelists/main.txt](whitelists/main.txt), following the existing entries as a reference, then submit a Pull request.
To report a false positive without opening a pull request, visit: https://blocklist.sefinek.net/false-positives.

### Submitting a new domain for blocking
Add the domain to the appropriate file in the [lists](lists) folder, matching the relevant category.
Make sure it is not already listed, then submit a Pull request with a brief explanation.

### Branches
The [blocklists](https://github.com/sefinek/Sefinek-Blocklist-Collection/tree/blocklists) branch is generated automatically and should not be modified manually.
Any changes made directly to this branch will be overwritten on the next GitHub Actions run.
Pull requests should target the `main` branch only.


## 📥 How to Clone?
```bash
git clone --branch main --single-branch https://github.com/sefinek/Sefinek-Blocklist-Collection.git
cd Sefinek-Blocklist-Collection
git fetch --depth=1 origin blocklists:blocklists
git worktree add blocklists blocklists
```


## 🌠 Other Useful Repositories
[Cloudflare-WAF-Expressions](https://github.com/sefinek/Cloudflare-WAF-Expressions) | [Malicious-IP-Addresses](https://github.com/sefinek/Malicious-IP-Addresses) | [Blacklisted-Emails](https://github.com/sefinek/Blacklisted-Emails)


## 🐈 Sources of Images Used
| pinterest.com | freepik.com |
|---------------|-------------|


## 📝 CC BY-NC-ND 4.0 License
Copyright © 2023–2026 [Sefinek](https://sefinek.net)
