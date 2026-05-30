# Unlock Event Study

Backtest for token unlock events inferred from circulating supply changes.

## What It Does

- Pulls daily price data from Binance.
- Pulls circulating-supply history from CoinGecko.
- Detects cliff unlocks using supply jumps.
- Computes abnormal returns relative to BTC across pre/post event windows.
- Writes event-level CSV, JSON summary, and a chart.

## Run

```bash
pip install -r requirements.txt
cp .env.example .env
python backtest.py
```

CoinGecko demo key is optional but recommended for reliable supply data.
