"""
Telegram Signal Monitor
-----------------------
Listens to high-signal Telegram groups and pipes messages to Claude for structured analysis.

Setup:
    pip install telethon anthropic python-dotenv
    Create .env with: TG_API_ID, TG_API_HASH, ANTHROPIC_API_KEY, GROUPS (comma-separated chat IDs or usernames)

First run will prompt for phone number + 2FA code to create a Telethon session file.
"""

import asyncio
import os
import json
from datetime import datetime, timezone
from dotenv import load_dotenv
from telethon import TelegramClient, events
from telethon.tl.types import Channel, Chat
from analyser import analyse_message, SKIP_SIGNAL

load_dotenv()

API_ID = int(os.environ["TG_API_ID"])
API_HASH = os.environ["TG_API_HASH"]
GROUPS_RAW = os.environ.get("GROUPS", "")  # comma-separated: @username or numeric ID
MIN_LENGTH = int(os.environ.get("MIN_LENGTH", "80"))  # ignore short messages

# Parse group list — numeric strings become ints (required by Telethon for private groups)
def parse_groups(raw: str) -> list:
    groups = []
    for g in raw.split(","):
        g = g.strip()
        if not g:
            continue
        try:
            groups.append(int(g))
        except ValueError:
            groups.append(g)
    return groups

WATCH_GROUPS = parse_groups(GROUPS_RAW)

client = TelegramClient("tg_signal_session", API_ID, API_HASH)


def get_chat_name(event) -> str:
    try:
        return event.chat.title or event.chat.username or str(event.chat_id)
    except Exception:
        return str(event.chat_id)


@client.on(events.NewMessage(chats=WATCH_GROUPS if WATCH_GROUPS else None))
async def handler(event):
    text = event.message.text
    if not text or len(text) < MIN_LENGTH:
        return

    chat_name = get_chat_name(event)
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    print(f"\n[{timestamp}] [{chat_name}] {len(text)} chars — analysing...")

    result = await analyse_message(text, source=chat_name, timestamp=timestamp)

    if result == SKIP_SIGNAL:
        print("  → skipped (noise)")
        return

    # Print structured output
    print(f"  SIGNAL: {result.get('signal_type', 'UNKNOWN')}")
    print(f"  Assets: {', '.join(result.get('assets', []))}")
    print(f"  Summary: {result.get('summary', '')}")
    if result.get("action"):
        print(f"  ⚡ Action: {result['action']}")

    # Append to log file
    log_entry = {
        "timestamp": timestamp,
        "source": chat_name,
        "raw": text[:500],
        **result,
    }
    with open("signal_log.jsonl", "a") as f:
        f.write(json.dumps(log_entry) + "\n")


async def main():
    if not WATCH_GROUPS:
        print("⚠️  No GROUPS set in .env — listening to ALL messages (noisy, use for discovery only)")
    else:
        print(f"Watching {len(WATCH_GROUPS)} groups: {WATCH_GROUPS}")
    print("Running. Ctrl+C to stop.\n")
    await client.run_until_disconnected()


with client:
    client.loop.run_until_complete(main())
