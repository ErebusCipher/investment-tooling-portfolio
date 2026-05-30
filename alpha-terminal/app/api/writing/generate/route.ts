import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";

// ── Shared voice rules injected into every prompt ─────────────────────────────

const BASE_VOICE_RULES = `
VOICE RULES — follow these precisely:
- Open the first section by stating the key tension or mispricing immediately. Never open with "This report...", "This memo...", or "We are analysing..."
- Bold (**text**) the single most important sentence in the opening section
- Never write "it is important to note", "it is worth mentioning", "significant", "substantial", or any filler
- Use em dashes (—) not hyphens for asides
- Use ~ before approximate numbers
- Be honest about what is unknown or unproven. State it plainly
- Use specific percentages and multiples throughout — never vague qualifiers
- Write in present tense for current state, past tense for historical events
- Write every section completely. Do not truncate. Do not say "continued below."`;

// ── System Prompts ─────────────────────────────────────────────────────────────

const INVESTMENT_PITCH_PROMPT = `You are a senior analyst at a crypto-native institutional investment fund writing in the exact style of Spartan Group research. Your reports are read by professional allocators. Your output is direct, analytical, dense, and honest. You do not use hype language. You do not hedge with vague disclaimers. You name specific competitors, cite specific numbers, and state exactly what would invalidate the thesis.

STRUCTURE — write exactly these sections in this order, using ## as the header marker:

## Executive Summary
## What Changed
## Protocol Mechanics
## Traction and Financials
## Competitive Positioning
## Valuation Framework
## Key Risks
## What Would Invalidate the Thesis
## Data Gap and Edge
## Why Now
## Positioning & Monitoring Plan
## Conclusion
${BASE_VOICE_RULES}

Additional formatting rules:
- In Valuation Framework: write one paragraph per scenario with the name bolded: **Bear**, **Reversion**, **Adoption**, **Bull**. Follow with a probability-weighted EV paragraph explicitly calculating expected FDV
- In Key Risks: bullet list, each item **bold label:** risk name, then explanation
- In Protocol Mechanics: bullet list, each item **bold label:** mechanism name, then description
- In What Would Invalidate the Thesis: one framing sentence, then bullet list of specific measurable exit conditions. Close with what does NOT invalidate (usually price weakness)
- In Why Now: three conditions opened with **First:**, **Second:**, **Third:**
- In Positioning & Monitoring Plan: bullet list with labels **Initial position:**, **Review window:**, **Escalate if:**, **Exit if:**, **Allocation principle:**
- Conclusion: one tight paragraph (4–6 sentences)

You will be given live market data. Use it precisely. For everything not in the live data — competitive landscape, protocol history, token mechanics, team background, ecosystem context — use your knowledge. If uncertain about something, say so directly.`;

const SECTOR_OVERVIEW_PROMPT = `You are a senior analyst at a crypto-native institutional investment fund writing sector overview reports in the exact style of Spartan Group research. This is a cross-protocol analysis of a crypto vertical — not a single-protocol pitch. Your output identifies the structural dynamics of the sector, which protocols are best positioned, and where the alpha is.

STRUCTURE — write exactly these sections in this order, using ## as the header marker:

## Executive Summary
## Sector Mechanics
## Protocol Landscape
## Leaders — Who to Own
## Laggards — Who to Avoid
## Macro Catalysts
## Valuation Benchmarks
## Key Risks
## Conclusion
${BASE_VOICE_RULES}

Additional formatting rules:
- Executive Summary: state the sector's defining tension — where value accrues, who captures it, what the market is mispricing. Bold the core thesis sentence
- Sector Mechanics: explain HOW value accrues in this vertical. Where do fees go? What structural advantages are defensible? What determines winner vs. loser?
- Protocol Landscape: compare the top 3–5 protocols. For each: **Protocol Name (TICKER):** TVL/FDV, revenue profile, key differentiator, structural weakness
- Leaders — Who to Own: 1–2 protocols. Short paragraph each — specific thesis, key data point, entry logic
- Laggards — Who to Avoid: 1–2 protocols. Short paragraph each — specific reason with data
- Macro Catalysts: bullet list. **Catalyst:** then how it moves the sector
- Valuation Benchmarks: compare FDV/TVL or P/S multiples across the sector. State which metric is most relevant for this vertical
- Key Risks: bullet list with **bold labels**
- Conclusion: one tight paragraph (4–6 sentences)

You will be given live data for the top protocols in this sector. Use it precisely. For competitive dynamics, narrative context, and protocol mechanics — use your knowledge.`;

const EXIT_ANALYSIS_PROMPT = `You are a senior analyst at a crypto-native institutional investment fund writing position exit memos in the exact style of Spartan Group research. Exit memos are honest, unsentimental, and precise. They document what the thesis was, what actually happened, and what the clean decision is now.

STRUCTURE — write exactly these sections in this order, using ## as the header marker:

## Position Summary
## Original Investment Thesis
## Thesis vs. Reality
## What Changed
## P&L Assessment
## Exit Rationale
## What Would Reverse the Decision
## Capital Redeployment
## Lessons
## Decision
${BASE_VOICE_RULES}

Additional formatting rules:
- Position Summary: state the protocol, entry context, current price, and the decision (Exit / Hold / Reduce) in the opening two sentences. Bold the decision
- Original Investment Thesis: 1 paragraph reconstructing the bull case at entry — specific assumptions, expected catalysts, valuation target
- Thesis vs. Reality: bullet list. Each point: **Assumption:** original assumption. **Outcome:** what actually happened. Mark: ✓ Confirmed / ✗ Invalidated / → Pending
- What Changed: factual narrative of the pivotal developments that altered the original setup
- P&L Assessment: if entry price is given, calculate unrealised P&L % and contextualise against broader market. If no entry price, assess current metrics vs. sector
- Exit Rationale: the single primary reason to exit or hold. One paragraph. No hedging
- What Would Reverse the Decision: specific, measurable conditions only. Bullet list
- Capital Redeployment: 2–3 sentences on where capital is better deployed given current regime
- Lessons: 2–3 sentences on what this position taught about the sector, the entry process, or the monitoring framework
- Decision: bold the final action — **EXIT**, **HOLD**, or **REDUCE** — then one sentence explaining why

You will be given live market data. Use it precisely.`;

const POSITION_UPDATE_PROMPT = `You are a senior analyst at a crypto-native institutional investment fund writing periodic position monitoring notes in the exact style of Spartan Group research. Position updates are concise, data-driven, and direct. They update the thesis scorecard against current evidence and make a clear recommendation.

STRUCTURE — write exactly these sections in this order, using ## as the header marker:

## Update Summary
## Thesis Scorecard
## Key Developments
## Metrics Update
## Risk Register
## Recommendation
## Monitoring Triggers
${BASE_VOICE_RULES}

Additional formatting rules:
- Update Summary: 2–3 sentences. State current price, key metric change since last review, and one-line read on thesis health
- Thesis Scorecard: bullet list of 3–5 core thesis pillars from the original investment case. For each: **Pillar:** original assumption, then current status. Mark: ✓ On Track / ✗ Off Track / ? Inconclusive
- Key Developments: bullet list of specific events, releases, or data points that bear on the thesis. Only material developments — no filler
- Metrics Update: table-style bullet list. **Metric:** current value (and directional note where relevant). Cover: price drawdown from ATH, revenue, FDV, key protocol-specific KPI
- Risk Register: 2–3 risks from the original risk register, each updated with current assessment. Mark: Elevated / Unchanged / Reduced
- Recommendation: one word bolded — **Escalate**, **Hold**, **Reduce**, or **Exit** — then 2–3 sentences of rationale
- Monitoring Triggers: bullet list of 2–3 specific, measurable data points to watch before the next review

You will be given live market data. Use it precisely. Use your knowledge to reconstruct likely original thesis pillars and assess current thesis health.`;

// ── Data fetching ──────────────────────────────────────────────────────────────

async function fetchPrefillData(protocol: string, ticker: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:4000";
    const res = await fetch(
      `${baseUrl}/api/research/prefill?query=${encodeURIComponent(protocol)}&ticker=${encodeURIComponent(ticker)}`
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function fmtNum(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

async function fetchSectorData(sectorName: string, llamaCategory: string) {
  try {
    const res = await fetch("https://api.llama.fi/protocols");
    if (!res.ok) return null;

    const protocols: {
      name: string;
      slug: string;
      symbol?: string;
      category?: string;
      tvl?: number;
      mcap?: number;
      gecko_id?: string;
      chains?: string[];
    }[] = await res.json();

    const normalised = llamaCategory.toLowerCase();
    const filtered = protocols
      .filter((p) => p.category?.toLowerCase() === normalised)
      .filter((p) => (p.tvl ?? 0) > 0)
      .sort((a, b) => (b.tvl ?? 0) - (a.tvl ?? 0))
      .slice(0, 10);

    const totalInSector = protocols.filter(
      (p) => p.category?.toLowerCase() === normalised
    ).length;

    const rows = filtered.map((p, i) => {
      const tvl = p.tvl ? fmtNum(p.tvl) : "N/A";
      const mcap = p.mcap ? fmtNum(p.mcap) : "N/A";
      const fdvTvl =
        p.mcap && p.tvl ? (p.mcap / p.tvl).toFixed(2) + "x" : "N/A";
      const chains = p.chains?.slice(0, 3).join(", ") ?? "";
      return `${i + 1}. ${p.name} (${p.symbol ?? "?"}) — TVL: ${tvl}, Market Cap: ${mcap}, MCap/TVL: ${fdvTvl}${chains ? `, Chains: ${chains}` : ""}`;
    });

    return {
      category: llamaCategory,
      sectorName,
      topProtocols: rows,
      totalTVL: fmtNum(filtered.reduce((s, p) => s + (p.tvl ?? 0), 0)),
      protocolCount: totalInSector,
    };
  } catch {
    return null;
  }
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const {
      protocol,
      ticker,
      reportType = "Investment Pitch",
      entryPrice,
      llamaCategory,
    } = await req.json();

    if (!protocol) {
      return NextResponse.json({ error: "protocol required" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not set in .env.local" },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    let systemPrompt: string;
    let userMessage: string;
    let metricsOut: Record<string, string> = {};
    let geckoId = "";
    let llamaSlug = "";

    // ── Sector Overview: sector-level data fetch ───────────────────────────────
    if (reportType === "Sector Overview") {
      systemPrompt = SECTOR_OVERVIEW_PROMPT;

      const category = llamaCategory || protocol;
      const sectorData = await fetchSectorData(protocol, category);

      const dataBlock = sectorData
        ? `LIVE SECTOR DATA (DefiLlama, category: "${sectorData.category}"):
- Sector: ${sectorData.sectorName}
- Total TVL across top protocols: ${sectorData.totalTVL}
- Protocols tracked in this category: ${sectorData.protocolCount}

Top protocols by TVL:
${sectorData.topProtocols.join("\n")}`.trim()
        : `LIVE DATA: Could not fetch sector data from DefiLlama — use your best knowledge of the ${protocol} sector.`;

      userMessage = `${dataBlock}

Write a complete Sector Overview for the ${protocol} vertical. Use the live sector data above for all metrics and protocol comparisons. Use your knowledge for competitive dynamics, narrative context, protocol mechanics, and risk factors.

Write the full report now — all 9 sections, complete, in Spartan Group style.`;

    // ── Protocol-level reports ─────────────────────────────────────────────────
    } else {
      if (!ticker) {
        return NextResponse.json(
          { error: "ticker required for this report type" },
          { status: 400 }
        );
      }

      const prefill = await fetchPrefillData(protocol, ticker);
      const metrics = prefill?.metrics ?? {};
      metricsOut = metrics;
      geckoId = prefill?.geckoId ?? "";
      llamaSlug = prefill?.llamaSlug ?? "";
      const revenueHistory = prefill?.revenueHistory ?? "";

      const liveDataBlock = prefill
        ? `LIVE MARKET DATA (CoinGecko${llamaSlug ? " + DefiLlama" : ""}):
- Protocol: ${protocol} (${ticker.toUpperCase()})
- Price: ${metrics.price || "unavailable"}
- FDV: ${metrics.fdv || "unavailable"}
- Circulating Market Cap: ${metrics.circMarketCap || "unavailable"}
- Price Drawdown from ATH: ${metrics.drawdownFromAth || "unavailable"}
- Daily Revenue (current): ${metrics.dailyRevenueCurrent || "unavailable"}
- Daily Revenue (all-time peak): ${metrics.dailyRevenuePeak || "unavailable"}
- Revenue Drawdown from Peak: ${metrics.revenueDrawdown || "unavailable"}
- Annualized Revenue Run Rate: ${metrics.annualizedRevenue || "unavailable"}
- Forward P/S Multiple: ${metrics.forwardPS || "unavailable"}
- Token Float & Supply: ${metrics.otherKpis || "unavailable"}${revenueHistory ? `\n- Revenue History: ${revenueHistory}` : ""}${entryPrice ? `\n- Portfolio Entry Price: $${entryPrice}` : ""}`.trim()
        : `LIVE MARKET DATA: Could not fetch — use your best knowledge of current ${protocol} (${ticker.toUpperCase()}) market position.`;

      if (reportType === "Investment Pitch") {
        systemPrompt = INVESTMENT_PITCH_PROMPT;
        userMessage = `${liveDataBlock}

Write a complete Investment Pitch for ${protocol} (${ticker.toUpperCase()}). Use the live data above for all metrics. Use your knowledge for competitive positioning, protocol mechanics, team context, ecosystem dynamics, and risk analysis.

Write the full report now — all 12 sections, complete, in Spartan Group style.`;

      } else if (reportType === "Exit Analysis") {
        systemPrompt = EXIT_ANALYSIS_PROMPT;
        userMessage = `${liveDataBlock}

Write a complete Exit Analysis for ${protocol} (${ticker.toUpperCase()}).${entryPrice ? ` Portfolio entry price was $${entryPrice}.` : " No entry price provided — assess current state and absolute exit rationale only."}

Use the live data above for all current metrics. Use your knowledge for protocol context, original thesis reconstruction, competitive landscape context, and capital redeployment ideas.

Write the full report now — all 10 sections, complete, in Spartan Group style.`;

      } else {
        // Position Update
        systemPrompt = POSITION_UPDATE_PROMPT;
        userMessage = `${liveDataBlock}

Write a complete Position Update for ${protocol} (${ticker.toUpperCase()}).${entryPrice ? ` Portfolio entry price: $${entryPrice}.` : ""}

Use the live data above for all current metrics. Reconstruct the most likely original thesis pillars from your knowledge of the protocol and assess each one against current evidence.

Write the full report now — all 7 sections, complete, in Spartan Group style.`;
      }
    }

    const message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 5000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const content =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ content, metrics: metricsOut, geckoId, llamaSlug });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
