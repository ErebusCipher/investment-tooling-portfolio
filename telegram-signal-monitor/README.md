# Telegram Signal Monitor

Prototype for extracting actionable market signals from high-volume Telegram groups.

## What It Does

- Connects to Telegram with Telethon.
- Watches configured groups.
- Filters short/noisy messages.
- Sends candidate messages to Claude.
- Returns structured JSON with signal type, affected assets, direction, conviction, summary, and action.

## Run

```bash
pip install -r requirements.txt
cp .env.example .env
python discover_groups.py
python monitor.py
```

No Telegram groups, session files, or logs are included in this repository.
