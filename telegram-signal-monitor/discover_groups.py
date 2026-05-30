"""
Run this once to list all your Telegram groups/channels with their IDs.
Copy the IDs you want to watch into GROUPS in your .env
"""

import asyncio
import os
from dotenv import load_dotenv
from telethon import TelegramClient
from telethon.tl.types import Channel, Chat

load_dotenv()

API_ID = int(os.environ["TG_API_ID"])
API_HASH = os.environ["TG_API_HASH"]

client = TelegramClient("tg_signal_session", API_ID, API_HASH)


async def main():
    async for dialog in client.iter_dialogs():
        if isinstance(dialog.entity, (Channel, Chat)):
            print(f"{dialog.id:>15}  {dialog.name}")


with client:
    client.loop.run_until_complete(main())
