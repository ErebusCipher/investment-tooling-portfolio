# Memo Pipeline

Multi-agent crypto investment memo pipeline that turns live market data into an institutional-style research packet.

## Workflow

1. Fetch project data from CoinGecko and DefiLlama.
2. Ask Claude to synthesize the data and identify the core investment question.
3. Generate a full investment memo.
4. Run adversarial critique.
5. Generate the strongest bear case.
6. Rewrite and compress into an investment committee summary.
7. Score the memo on clarity, rigor, falsifiability, and conviction.

## Run

```bash
pip install -r requirements.txt
export ANTHROPIC_API_KEY=...
export OPENAI_API_KEY=...
python memo_pipeline.py "Virtuals Protocol"
```

Outputs are written to `outputs/` so every step can be inspected.
