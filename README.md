# ErebusCipher

Pseudonymous investment tooling portfolio: market dashboards, AI-assisted research workflows, event studies, and signal extraction systems for crypto and public-market analysis.

This repository is intentionally sanitized. It contains representative sample data and public-market examples, not private holdings, employer material, Telegram group lists, API keys, or personal identity metadata.

## Review Path

For fund or analyst-role review, start here:

1. [`application-packet/README.md`](application-packet/README.md) - concise overview of the application package.
2. [`application-packet/anonymous-cv.md`](application-packet/anonymous-cv.md) - pseudonymous CV.
3. [`research-samples/short-theses/neoclouds-ai-cycle-miners.md`](research-samples/short-theses/neoclouds-ai-cycle-miners.md) - AI infrastructure thesis written for a post-AI public/private markets lens.
4. [`market-systems/README.md`](market-systems/README.md) - live market dashboard systems.
5. [`memo-pipeline/README.md`](memo-pipeline/README.md) - AI-assisted investment memo pipeline.

## Contents

### `application-packet`

Pseudonymous analyst application materials:

- Anonymized CV
- Curated review path
- DeFiLlama contribution links

### `market-systems`

Public-facing live market systems:

- Perp Momentum + Funding Engine
- Market Structure Monitor
- Factor-Driven BTC Long / Alt Short
- BTC Options Intelligence
- Mock Weekly Risk Memo

### `alpha-terminal`

Private investment workflow terminal, sanitized for public review:

- Portfolio tracker and backtester
- Allocation drift and correlation matrix
- Crypto alpha dashboard
- Catalyst calendar with event playbooks
- Opportunity-set tracker
- Claude-powered research and writing generators

### `memo-pipeline`

Multi-agent investment memo pipeline:

- Fetches CoinGecko and DefiLlama data
- Uses Claude for synthesis, thesis extraction, and memo drafts
- Uses GPT for critique, bear-case generation, final IC summary, and scoring
- Produces a full audit trail from raw data to final memo

### `unlock-event-study`

Token unlock event study:

- Infers unlocks from circulating supply changes
- Pulls price data from Binance and supply data from CoinGecko
- Computes abnormal returns around unlock windows
- Outputs CSV, JSON summary, and chart artifacts

### `telegram-signal-monitor`

Telegram signal extraction prototype:

- Watches configured Telegram groups
- Filters noisy messages
- Sends high-signal content to Claude
- Returns structured JSON classification: macro, narrative shift, flow, catalyst, risk, or noise

### `research-samples`

Selected market and protocol research samples covering:

- Virtuals ACP revenue analysis
- Crypto price factor hierarchy
- Derivatives positioning signals
- Catalyst scenario planning
- Market cascade mechanics
- AI-agent knowledge infrastructure
- formatted PDF essays from the `published-writing/` subfolder, including AI-agent token value capture and RWA market structure notes
- Markdown short theses on AI-agent token economics, neocloud infrastructure, and RWA market structure

## Anonymity Note

The author is applying anonymously because the packet touches recent and current professional work.

## Safety

Before publishing, run:

```bash
rg -n "real-name|personal-email|old-github-handle|api_key|secret|private_key|BEGIN"
find . -name ".env*" -o -name "*.session" -o -name ".DS_Store"
```

The included examples are designed to be inspectable without exposing live credentials.
