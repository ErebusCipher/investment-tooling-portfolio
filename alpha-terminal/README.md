# ErebusCipher Alpha Terminal

Sanitized private investment terminal for public equities, crypto market structure, catalysts, portfolio monitoring, and AI-assisted research production.

## Modules

- Portfolio tracker: live pricing, P&L, allocation drift, historical backtest, drawdown, and correlation matrix.
- Crypto alpha dashboard: BTC dominance, CoinGecko trending, float/FDV screens, funding rates, and liquidation proxy.
- Catalyst calendar: event cards with likely reaction, contrarian reaction, pre-trade plan, execution notes, exit condition, and risk case.
- Opportunity set: annual regime themes with conviction scores, tickers, entry thesis, exit thesis, and risk thesis.
- Research generator: Claude-powered institutional investment pitch workflow with structured inputs and live CoinGecko/DefiLlama prefill.
- Writing generator: investment pitch, sector overview, exit memo, and position update generation from live data.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Recharts
- Anthropic SDK
- Yahoo Finance, CoinGecko, DefiLlama, Binance, Bybit

## Data Hygiene

This repository uses sample portfolio and catalyst data. It does not include real holdings, private Telegram groups, API keys, or personal identity metadata.

## Run

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

The AI generation routes require `ANTHROPIC_API_KEY`.
