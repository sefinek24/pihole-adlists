<div align="center"><h1>The best Blocklist Collection ✋<br>made by Sefinek</h1></div>
<img width="37%" align="right" src="images/kitten.png" alt="Orange cat">
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


## 📦 How to Acquire the Blocklist
- The first option is to [generate your own list](https://sefinek.net/blocklist-generator), recommended for users who want to customize the list based on their specific needs and preferences.
- The second option is to use the [default list](https://github.com/sefinek/Sefinek-Blocklist-Collection/tree/main/docs/lists/md) provided, ideal for those who prefer a quick, straightforward solution without customization.

> [!IMPORTANT]  
> I do not allow commercial use of my lists. Lists I did not create are shared under the licensing terms set by their original authors.
> If you wish to use the Sefinek Blocklist Collection for commercial purposes, please contact me via email.
> Do not download the lists every hour either. Click [here](https://blocklist.sefinek.net/update-schedule) to learn more.

<a href="https://stormserverhosting.com">
  <img src="https://cdn.sefinek.net/images/stormserverhosting/banner-white-gh.png" align="center" alt="Storm Server Hosting">
</a>


## ❌ How to Report a False Positive? ([more info](https://blocklist.sefinek.net/false-positives))
False positives can be reported by creating a new [Issue](https://github.com/sefinek/Sefinek-Blocklist-Collection/issues), submitting a [new PR](https://github.com/sefinek/Sefinek-Blocklist-Collection/pulls) (just remember to follow the required syntax, see [whitelists/main.txt](https://github.com/sefinek/Sefinek-Blocklist-Collection/blob/main/whitelists/main.txt#L10)), on our [Discord](https://sefinek.net) server, or by contacting me via [email](https://sefinek.net/contact-me).  
Within 96 hours, I will add the domain to the [whitelist](whitelists/main.txt). Shortly after, the false positive will be automatically removed from the blocklist by [GitHub Actions](.github/workflows/update-blocklists.yml).


## 📥 Update Schedule
- **This repository:**  
  The blocklists in this repository are updated every `3 hours` by [GitHub Actions](.github/workflows/download-blocklists.yml).
- **Remote ([blocklist.sefinek.net](https://blocklist.sefinek.net)):**  
  Synchronization occurs daily at `01:00` and `06:00` (24-hour clock, Poland time zone: `GMT+01:00`).  
  Cron expression: `0 1,6 * * *` (at minute 0, past hours 1 and 6).

> [!IMPORTANT]  
Visit [this page](https://blocklist.sefinek.net/update-schedule) to check the timing of the next repository synchronization in your time zone.  
This will help you schedule the cron job for optimal timing.


## 🌍 Links
- [Blocklist generator (for Pi-hole, AdGuard, etc.)](https://sefinek.net/blocklist-generator)
- [Homepage of blocklist.sefinek.net (stats, update schedule, etc.)](https://blocklist.sefinek.net)
- [File explorer (Index of /generated/v1)](https://blocklist.sefinek.net/generated/v1)
- [Git pull logs (Synchronization)](https://blocklist.sefinek.net/logs/v1): `Remote` [github.com] → `Local` [blocklist.sefinek.net]


## ✨ Default Blocklist
<details>
  <summary>Click here to see 👀</summary>

  - **Abuse:** Blocks known domains related to harassment or online violence.
  - **Ads:** Blocks domains serving advertisements.
  - **AMP Hosts:** Blocks Accelerated Mobile Pages hosts, which often display ads and track users.
  - **Cryptomining:** Blocks domains hijacking devices for cryptocurrency mining.
  - **Dating Services:** Blocks dating services and associated scams.
  - **Drugs:** Blocks domains selling or promoting drugs.
  - **Fake News:** Blocks domains known for publishing fake or misleading content.
  - **Gambling:** Blocks domains of online gambling sites.
  - **Hate Speech and Trash Sites:** Blocks domains promoting hate speech or disinformation.
  - **Malware:** Blocks dangerous or harmful domains.
  - **Phishing:** Blocks domains used for phishing attempts.
  - **Piracy:** Blocks domains sharing illegal content.
  - **Pornography:** Blocks adult content domains.
  - **Ransomware:** Blocks domains associated with ransomware attacks.
  - **Redirects:** Blocks domains that redirect users to unwanted pages.
  - **Scams:** Blocks domains promoting scams or fraudulent activities.
  - **Spam:** Blocks domains sending unsolicited emails.
  - **Spyware:** Blocks domains distributing spyware or adware.
  - **Telemetry and Tracking:** Blocks domains tracking user activity for analytics.
  - **Useless Sites:** Blocks low-value or parked domains with no real content.
  - **Social Media and Games:** Blocks TikTok, Snapchat, OmeTV, Riot Games, Valorant, League of Legends, etc.
</details>

<h3 align="right">
    📃 <a href="docs/lists/Index.md">Select your DNS server and copy the URLs »</a><br>
    🔡 <a href="docs/lists/Regex.md">View the regex list »</a>
</h3>


## ✅ Good to Know
- New lists are added periodically. You can also install the [Sefinek Blocklists](https://apps.microsoft.com/detail/9p3tnt3pjd0j) app from the Microsoft Store for quick and convenient access to these lists.
- Regularly checking this repository for updates and possible changes is recommended.
- While this blocklist can improve your privacy and security, it may occasionally block legitimate content or services unintentionally.


## 🤝 Contributing
If you have any suggestions or ideas that could improve this project, please don't hesitate to share them with me.
I encourage you to contribute by submitting a [Pull request](https://github.com/sefinek/Sefinek-Blocklist-Collection/pulls) with your proposed changes.
Your efforts and insights are greatly appreciated and will help make this project even better and more valuable for others.
Thank you in advance for your valuable contributions!


## 📥 How to Clone?
```bash
git clone --branch main --single-branch https://github.com/sefinek/Sefinek-Blocklist-Collection.git
```


## 🤝 Support & Questions
Join our [Discord server](https://discord.gg/53DBjTuzgZ) or open a new [Issue](https://github.com/sefinek/Blacklisted-Emails/issues).


## 🌠 Other Useful Repositories
[Cloudflare-WAF-Expressions](https://github.com/sefinek/Cloudflare-WAF-Expressions) | [Malicious-IP-Addresses](https://github.com/sefinek/Malicious-IP-Addresses) | [Blacklisted-Emails](https://github.com/sefinek/Blacklisted-Emails)


## 🐈 Sources of Images Used
| pinterest.com | freepik.com |
|---------------|-------------|


## 📝 CC BY-NC-ND 4.0 License
Copyright © 2023–2026 [Sefinek](https://sefinek.net)
