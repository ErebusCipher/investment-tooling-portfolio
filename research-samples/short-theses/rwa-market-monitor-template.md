# RWA Market Monitor — Sample Issue + Template

*This document shows both a live instance (week of May 18, 2026) and the template architecture beneath it. Fields marked* `[DATA]` *can be populated from RWA.xyz data exports or API and refresh weekly with no editorial input. Fields marked* `[EDITORIAL]` *require analyst judgment. The intent is a publishing cadence where most of the document assembles itself and the analyst's time concentrates on the three editorial sections: Notable Flows, Protocol Spotlight, and One Call.*

---

## RWA Market Monitor | Week of May 18, 2026

### Market Snapshot `[DATA — app.rwa.xyz]`

```
# Illustrative data pull (field names subject to RWA.xyz export schema)
source:  app.rwa.xyz → Market Overview export / API
fields:  distributed_value | 30d_pct_change | holder_count
filter:  asset_type IN (treasuries, private-credit, commodities, equities)
refresh: weekly — no editorial input required
```

| Metric | Value | Change Window | Change |
|---|---|---|---|
| Total distributed RWA | $33.71B | 30d | ▼0.17% |
| Tokenized Private Credit (public chains) | $5.14B | 30d | ▼9.80% |
| Total holders (Treasuries) | 62,300 | 7d | ▼0.34% |

---

### Category Breakdown `[DATA — app.rwa.xyz/treasuries, /private-credit]`

| Category | Distributed Value | Largest Product | Analyst Note |
|---|---|---|---|
| US Treasuries | $15.49B | USYC (Circle) $2.97B | Largest category |
| Commodities | ~$9.0B | PAXG (Paxos) $4.2B | Store-of-value exposure |
| Private Credit (public chains) | $5.14B | Syrup USDC (Maple) $1.38B | 30d contraction |
| Equities / Other | ~$4.2B | CRCLon $159M | Early-stage / fragmented |

**Top 5 treasury products by AUM:** USYC $2.97B · BUIDL $2.68B · USDY $2.14B · iBENJI $1.48B · JTRSY $1.07B

---

### Notable Flows `[EDITORIAL — analyst selects 2–3 moves worth explaining]`

- **Franklin Templeton iBENJI +24.9% (30d, now $1.48B).** The largest 30-day gain among major treasury products. iBENJI's multi-chain expansion onto BNB Chain in Q1 appears to be driving inflows from Asia-Pacific institutional allocators — a distribution pattern distinct from the Ethereum-native products. Watch whether BENJI's holder count (currently 1,104) grows proportionally or whether these are large single allocations.

- **Janus Henderson JTRSY via Centrifuge ▼29.4% (30d, now $1.07B).** The steepest decline among top-10 treasury products. JTRSY launched as a flagship TradFi-to-DeFi bridge — a $360B AUM manager tokenizing a fund through Centrifuge. The drawdown is worth watching: it may reflect one large institutional redemption rather than structural outflow, but it also tests whether tokenized fund structures have secondary liquidity to absorb redemptions cleanly or route them back to the underlying fund.

- **Private credit distributed TVL down 9.8% (30d).** The public-chain private credit segment is contracting at the same time the treasury segment is roughly flat. Maple's Syrup USDC remains the largest product at $1.38B, but the sector-wide decline suggests capital is rotating toward yield certainty (Treasuries) over yield premium (private credit). The rotation has precedent: it tends to precede rate cut cycles when T-bill yields compress and private credit spreads widen in relative terms.

---

### Protocol Spotlight `[EDITORIAL — analyst picks one protocol for deeper context]`

**Circle USYC — $2.97B, largest tokenized treasury product**

USYC quietly passed BlackRock BUIDL to become the largest single tokenized treasury product this quarter — notable because BUIDL received far more institutional attention at launch and has the larger brand. The difference is distribution architecture. USYC is natively deployed on Solana, Ethereum, and BNB Chain simultaneously, with a lower minimum subscription than BUIDL's institutional-only access tier. USDY (Ondo), the second-highest holder-count product at 14,796, takes a similar approach. The pattern suggests that tokenized treasury growth is currently a distribution and accessibility story as much as a product story — the products with lower friction and multi-chain reach are compounding faster than those with higher institutional pedigree but narrower access.

The implication for market structure: as minimums compress and chain coverage expands, the institutional vs. retail boundary in tokenized treasuries is becoming less fixed than the original product designs assumed.

---

### One Call `[EDITORIAL — one forward-looking analytical thesis, max 100 words]`

**The OUSG fee waiver ends July 1. That date is a sentiment indicator, not just a revenue event.**

Ondo has waived OUSG's 0.15% management fee since launch. When the waiver lifts, the fee is small (~$1.2M annualised at current TVL) — but the market reaction will reveal something larger: whether institutional holders are in tokenized treasuries for the yield net of all fees, or whether they are there for the infrastructure and will absorb the fee without flinching. Significant outflow around July 1 implies the former. Stability implies the latter — and changes the total addressable market calculus for every fee-bearing tokenized product in the sector.

---

*Next issue: May 25, 2026*

---

**Template architecture summary**

| Section | Input type | Refresh cadence | Time required |
|---|---|---|---|
| Market Snapshot | Data pull (app.rwa.xyz) | Weekly, automated | 0 min |
| Category Breakdown | Data pull (app.rwa.xyz) | Weekly, automated | 0 min |
| Notable Flows | Editorial | Weekly | ~30 min |
| Protocol Spotlight | Editorial | Weekly / rotating | ~45 min |
| One Call | Editorial | Weekly | ~20 min |
| **Total** | | | **~95 min/week** |

*The template is designed so that a single analyst can produce a polished institutional-grade market digest in under two hours weekly. The data scaffolding is consistent enough that regular readers build a mental model of what to track; the editorial sections are where the differentiation lives.*
