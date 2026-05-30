import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are a senior analyst at a crypto-native institutional investment fund, writing in the exact style of Spartan Group research. Your output is direct, analytical, dense, and honest. You do not use hype language. You do not hedge with vague disclaimers. You name specific competitors, cite specific numbers, and state exactly what would invalidate the thesis.

You will be given structured inputs about a protocol and you will write each section of the investment pitch as instructed. Write in continuous prose for narrative sections. Use no markdown headers — those are added by the UI. Do not write section titles. Just write the content of each section.

VOICE GUIDELINES:
- Open the executive summary by stating the key tension or mispricing immediately — revenue vs. multiple, narrative vs. fundamentals, whatever the core contradiction is
- Bold the single most important sentence in the executive summary using **bold**
- In the valuation section, write one paragraph per scenario, starting with the scenario name in bold: **Bear**, **Reversion**, **Adoption**, **Bull**
- State probabilities and probability-weighted expected values explicitly
- In "What Would Invalidate the Thesis", frame invalidation around data and fundamentals, not price action
- In "Why Now", always structure as three numbered conditions: First:, Second:, Third:
- In "Positioning & Monitoring Plan", use bullet points with bold labels: **Initial position:**, **Review window:**, **Escalate if:**, **Exit if:**
- In "Key Risks", use bullet points with bold labels for each risk
- In "Protocol Mechanics", use bullet points with bold labels for each mechanism
- Write the conclusion as a single tight paragraph that synthesises the thesis without repeating the body verbatim
- Never write "it's important to note" or "it's worth mentioning" or any filler
- Use em dashes (—) not hyphens for asides
- Use ~ before approximate numbers
- Percentages and multiples should always be precise (not "significant" or "substantial")`;

const SECTION_PROMPTS: Record<string, string> = {
  executiveSummary: `Write the Executive Summary section. Open with the core tension or mispricing (2–3 sentences). Then bold the single specific investment question. Then state the bear case downside explicitly if the thesis fails. Keep to 3–4 tight paragraphs maximum.`,

  currentState: `Write a brief narrative (2–3 sentences) contextualising the metrics table. Do not list the metrics — those are in the table. Comment on what the multiples imply the market is pricing in, and whether that is rational given the fundamentals.`,

  whatChanged: `Write the What Changed section. Open with what the protocol looked like before the catalyst. Explain the structural change introduced by the catalyst using a Before/After formula (literally write "Before [catalyst]:" and "After [catalyst]:" as bold labels). Explain the critical distinction that determines whether the change matters. Be honest about what is unproven. Close by framing the time horizon for the thesis to resolve.`,

  protocolMechanics: `Write the Protocol Mechanics section as a brief intro sentence followed by bullet points, each with a bold label for the mechanism and a concise description. Cover all provided token utility points. End with a brief observation on whether demand is structural or speculative given these mechanics, and name the key weakness honestly.`,

  tractionAndFinancials: `Write the Traction and Financials narrative. Cover the tokenomics (interpret what they mean structurally — is there overhang? are there upcoming unlocks?). Cover the revenue history as a narrative arc — where did it peak, why, what happened after, what the current baseline implies. End with a single sentence on what the live protocol data says about whether this protocol is dead or merely in trough.`,

  competitivePositioning: `Write the Competitive Positioning section. Compare against each named competitor using specific mechanical differences — how does each monetize, what is the fee capture model, what is the token utility. Identify where margin structurally accrues in this vertical and why this protocol is or isn't positioned to capture it. Use specific FDV or revenue comparisons where provided.`,

  valuationFramework: `Write the Valuation Framework narrative. Write one paragraph per scenario (Bear, Reversion, Adoption, Bull) starting with the scenario name in bold. After the four scenarios, write a paragraph on multiple sensitivity — what assumption changes compress or expand the multiple. Then write a probability-weighted EV paragraph, using the probabilities provided or deriving reasonable ones. End with a sentence on whether this is a core position or a tail bet.`,

  keyRisks: `Write the Key Risks section as a bullet list. Each bullet has a bold label (the risk name) followed by a colon and a concise explanation. Include structural risks, narrative risks, competitive risks, and token-specific risks. Be direct — do not soften risks.`,

  invalidationCriteria: `Write the What Would Invalidate the Thesis section. Open with one sentence framing when to exit (e.g. "Exit or deprioritize if, by [timeframe]:"). Then write a bullet list of specific, measurable, data-driven invalidation conditions. Close with one sentence distinguishing what does NOT invalidate the thesis (usually: price weakness, sentiment).`,

  dataGapAndEdge: `Write the Data Gap and Edge section. Identify what data does not yet exist in clean public form. Explain where the first clean signal will come from and when. Be explicit about whether the current entry is data-confirmed or probabilistic. Identify whether the edge is temporal (positioning before widespread recognition) or informational (access to data others lack).`,

  whyNow: `Write the Why Now section. Structure it as three conditions converging. Use "First:", "Second:", "Third:" as sentence openers (bold them). Each condition should be a distinct reason why this specific moment is the right entry — not general investment wisdom, but specific to the current state of this protocol and market.`,

  positioningPlan: `Write the Positioning & Monitoring Plan as a bullet list with bold labels: Initial position, Review window, Escalate if, Exit if. Include one final bold bullet for the most important single principle governing additional allocation. Be specific about conditions, not vague.`,

  conclusion: `Write the Conclusion as a single tight paragraph (4–6 sentences). Restate what makes the protocol not obviously cheap and the single condition under which it is cheap. Name the structural prerequisites that exist and the single missing variable. State the return range (bear to bull). Close by classifying the position type (core vs. monitored allocation, conviction bet vs. optionality purchase).`,
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { inputs, metrics, scenarios } = body;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not set in .env.local" }, { status: 500 });
    }

    const client = new Anthropic({ apiKey });

    // Build the user context block passed to every section call
    const context = `
PROTOCOL: ${inputs.protocol} (${inputs.ticker})
REPORT TYPE: ${inputs.reportType}

CURRENT METRICS:
- Price: ${metrics.price}
- FDV: ${metrics.fdv}
- Circulating Market Cap: ${metrics.circMarketCap}
- Price Drawdown from ATH: ${metrics.drawdownFromAth}
- Daily Revenue (current): ${metrics.dailyRevenueCurrent}
- Daily Revenue (peak): ${metrics.dailyRevenuePeak}
- Revenue Drawdown from Peak: ${metrics.revenueDrawdown}
- Annualized Revenue Run Rate: ${metrics.annualizedRevenue}
- Forward P/S Multiple: ${metrics.forwardPS}
- Other Protocol KPIs: ${metrics.otherKpis}

CATALYST / WHAT CHANGED: ${inputs.whatChanged}

PROTOCOL MECHANICS (token utility points): ${inputs.protocolMechanics}

TOKENOMICS: ${inputs.tokenomics}

REVENUE HISTORY: ${inputs.revenueHistory}

COMPETITORS: ${inputs.competitors}

VALUATION SCENARIOS:
${scenarios.map((s: { scenario: string; annualRevenue: string; multiple: string; impliedFdv: string; returnPct: string }) =>
  `- ${s.scenario}: ${s.annualRevenue} revenue × ${s.multiple} = ${s.impliedFdv} FDV (${s.returnPct})`
).join("\n")}
SCENARIO PROBABILITIES: ${inputs.scenarioProbabilities}

KEY RISKS: ${inputs.keyRisks}

INVALIDATION CRITERIA: ${inputs.invalidationCriteria}

DATA GAP / EDGE: ${inputs.dataGapAndEdge}

WHY NOW (3 conditions): ${inputs.whyNow}

POSITIONING PLAN: ${inputs.positioningPlan}
`.trim();

    // Generate all sections in parallel
    const sectionKeys = Object.keys(SECTION_PROMPTS);
    const results = await Promise.all(
      sectionKeys.map(async (key) => {
        const message = await client.messages.create({
          model: "claude-opus-4-6",
          max_tokens: 800,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: `${context}\n\n---\n\nNow write ONLY the following section. Do not include a title. Just the content:\n\n${SECTION_PROMPTS[key]}`,
            },
          ],
        });
        const text = message.content[0].type === "text" ? message.content[0].text : "";
        return [key, text.trim()] as [string, string];
      })
    );

    const sections = Object.fromEntries(results);

    return NextResponse.json({ sections });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
