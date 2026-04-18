# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DNS blocklist aggregation and distribution platform. Curates domains across categories (ads, malware, phishing, gambling, tracking, etc.), processes them through a cleaning pipeline, generates output in 7+ DNS server formats, and serves them via a Node.js/Express web interface with real-time metrics.

## Commands

```bash
# Linting & validation (runs in CI on list changes)
node scripts/prepare-templates.js   # Merge list categories into templates
node scripts/lint.js                # Validate domain format (lowercase, no whitespace)

# URL testing
npm test                            # scripts/test-urls.js

# Dependency management
npm run m                           # ncu -u && npm i && npm update && npm audit fix

# Branch sync
npm run pull                        # Hard reset main branch from origin
npm run pull:blocklists             # Sync blocklists worktree branch
```

## Architecture

### Two-branch model
- **`main`** — source lists (`lists/`) and processing scripts
- **`blocklists`** — generated output files, mounted as a git worktree at `blocklists/`

### Data flow
1. External blocklists downloaded by `bash/download.sh` (via GH Actions every 3h)
2. `scripts/prepare-templates.js` merges `lists/` categories into `blocklists/templates/`
3. Cleaning pipeline: deduplication, line-ending normalization, lowercase, whitelist applied (`whitelists/main.txt`)
4. `scripts/generate/runner.js` dispatches to format-specific generators in `scripts/generate/formats/` producing 7 output formats (NoIP, 0.0.0.0, 127.0.0.1, AdGuard, DNSmasq, RPZ, Unbound)
5. Generated files committed to `blocklists` branch

### Web server (`www/`)
- **`server.js`** — Express app; in production runs as PM2 cluster (workers per CPU)
- **Primary process** handles MongoDB/Redis connections, stats aggregation (Redis → MongoDB every 5 min), and the cron job
- **Worker processes** handle HTTP requests
- **`websocket.js`** — Real-time metrics broadcast (max 100 clients, 2s interval)
- Routes: `/`, `/metrics`, `/update-schedule`, `/api/v1/blocklist/check`, `/api/v1/reports/false-positive`, `/docs/`
- Controllers in `www/controllers/`; file listings cached in-memory for 5 hours

### Key infrastructure
- **MongoDB** — request stats, false positive reports
- **Redis** — short-term stats cache
- **PM2** — process management with cluster mode in production (`ecosystem.config.js`)

## Code Style

ESLint enforced (`eslint.config.mjs`):
- CommonJS modules (`require`/`module.exports`)
- Tabs for indentation, single quotes, semicolons required
- Max 4 nested callbacks

## Environment Variables (`.env`)

```
NODE_ENV=development|production
DOMAIN=http://127.0.0.1
PORT=8080
WS_ADDRESS=ws://127.0.0.1
WS_PORT=8095
MONGODB_URL=mongodb://...
REDIS_HOST=...
REDIS_PASSWD=...
```

## CI/CD Workflows

| Workflow | Trigger | Purpose |
|---|---|---|
| `lint.yml` | Push to `lists/` | Validate domain format |
| `download-blocklists.yml` | Cron `0 */3 * * *` | Download external lists, regenerate all formats |
| `update-blocklists.yml` | Push to `lists/` on main | Process manual list changes, push to blocklists branch |

## List Categories

User-submitted domains in `lists/` are organized by: `ads`, `crypto`, `dating`, `drugs`, `gambling`, `hate-and-junk`, `malicious`, `phishing`, `piracy`, `porn`, `scam`, `suspicious`, `tracking-and-telemetry`, `useless-websites`.

False positives are added to `whitelists/main.txt`; file-specific exceptions are supported.
