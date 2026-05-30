"""
Claude-powered signal analyser.
Returns structured JSON for each message, or SKIP_SIGNAL sentinel for noise.
"""

import os
import json
import anthropic

SKIP_SIGNAL = "__SKIP__"
_client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are a signal extraction engine for a crypto fund analyst.

You receive raw messages from high-signal Telegram groups and must classify them.

Return ONLY valid JSON — no prose, no markdown fences.

Schema:
{
  "signal_type": one of ["MACRO", "NARRATIVE_SHIFT", "FLOW", "CATALYST", "RISK", "NOISE"],
  "assets": ["list of tickers or protocol names mentioned — empty array if none"],
  "direction": "LONG" | "SHORT" | "NEUTRAL" | null,
  "conviction": "HIGH" | "MEDIUM" | "LOW",
  "summary": "one sentence, what is actually being said",
  "action": "specific action to consider, or null if no immediate trade signal",
  "skip": true | false  // true if this is pure noise, shilling, or irrelevant
}

Rules:
- MACRO: macro data, rates, regulatory, geopolitical
- NARRATIVE_SHIFT: the market conversation is moving to or away from a theme
- FLOW: specific wallet flows, exchange inflows/outflows, positioning data
- CATALYST: specific named event, integration, launch, partnership
- RISK: liquidation risk, contagion, leverage unwind signals
- NOISE: price commentary without insight, generic hype, memes

Be ruthless — most messages are noise. Only return skip=false if there is genuine information content."""


async def analyse_message(text: str, source: str, timestamp: str) -> dict | str:
    """
    Returns parsed signal dict, or SKIP_SIGNAL if noise.
    """
    try:
        response = _client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=400,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": f"Source: {source}\nTimestamp: {timestamp}\n\nMessage:\n{text[:2000]}",
                }
            ],
        )
        raw = response.content[0].text.strip()

        # Strip markdown fences if model slips
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        data = json.loads(raw)

        if data.get("skip"):
            return SKIP_SIGNAL

        return data

    except json.JSONDecodeError:
        return SKIP_SIGNAL
    except Exception as e:
        print(f"  Analyser error: {e}")
        return SKIP_SIGNAL
