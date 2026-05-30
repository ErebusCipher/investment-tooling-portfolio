# Hyperliquid (HYPE) — Investment Memorandum
*Draft v2 | Post-Critique Revision | 2026-03-17 | Confidential*

---

## Executive Summary

Hyperliquid is the dominant on-chain perpetuals exchange and the most profitable DeFi protocol by protocol revenue in the current cycle. HYPE generates ~$659M in annualised revenue (30d run rate) at an 88.6% take rate, with no venture capital overhang and a structural buyback mechanism (Assistance Fund) that creates a sustained bid for the token.

The valuation case is two-sided. On a market cap basis ($9.68B), the P/S of 14.7x is broadly in line with public exchange comps, but this comparison uses only 23.8% of circulating supply. The correct long-duration multiple is FDV P/S of **59.3x** — pricing the full 1B token supply against current revenue. Justifying that number requires believing in either significant revenue growth or that the buyback mechanism meaningfully offsets the 76% supply overhang before full dilution is reached. Both are plausible; neither is guaranteed.

**Recommendation: Buy with controlled sizing. Entry at current market (~$40–41). Near-term target $41.16 (90d resistance). Medium-term target $59.30 (ATH). Thesis invalidation: sustained monthly revenue below $40M, or regulatory enforcement impacting front-end access.**

---

## 1. Business Overview

Hyperliquid is a purpose-built Layer 1 blockchain designed for on-chain financial markets at centralised exchange performance levels.

**Core infrastructure:**
- **HyperBFT consensus:** Proprietary BFT variant, <1 second block finality, 100,000 orders/second throughput
- **On-chain order book:** Every order, cancel, trade, and liquidation is transparent and verifiable on-chain in real time
- **HyperEVM:** EVM-compatible execution layer (launched 2025), enabling third-party financial application deployment natively on the same chain where liquidity resides
- **HLP (Hyperliquidity Provider):** Protocol-owned market-making vault that acts as counterparty and captures spread

**Token structure (November 2024 launch):** No VC allocation, no institutional pre-sale. ~31% distributed to community via airdrop. Team: ~23.8%, 4-year vest. This is the most community-aligned token structure in DeFi — the primary differentiator from every prior DeFi protocol that failed under VC distribution pressure.

---

## 2. Financial Performance

### Revenue

| Period | Fees | Protocol Revenue | Take Rate |
|---|---|---|---|
| 24h | $2.98M | $2.68M | 89.9% |
| 7d | $14.90M | $13.15M | 88.3% |
| 30d | $62.0M | $54.9M | 88.6% |
| All-Time | $1.16B | $1.05B | 90.5% |
| **Annualised (30d)** | **$744M** | **$659M** | — |
| **Annualised (7d)** | **$775M** | **$684M** | — |

7d and 30d annualised rates are consistent ($659–684M), suggesting no near-term deterioration. Note: longer-term revenue trend (quarterly data) was not available in this data pull and should be verified against DefiLlama historical series before finalising conviction level. The all-time revenue of $1.05B implies the protocol averaged ~$85M/month since inception — lower than the current run rate, suggesting revenue is growing, but this should be confirmed with quarterly data.

**Revenue accrual mechanics:** Protocol revenue flows primarily to the Assistance Fund (AF), which uses it to buy HYPE on the open market. There is no direct dividend or fee distribution to HYPE holders. Value accrual to token holders is therefore buyback-driven price appreciation — an indirect but meaningful mechanism at current revenue rates. The portion of revenue going to team operations vs. AF buyback vs. ecosystem grants should be tracked; this data was not publicly disaggregated at time of writing.

### TVL

| Period | TVL | Change |
|---|---|---|
| 90d ago | $3.99B | — |
| 30d ago | $4.07B | +2% |
| Current | $4.51B | +11% MoM |
| ATH | $6.01B | -25% from ATH |

TVL is primarily USDC margin collateral from active traders — demand-driven, not incentive-driven. 13% growth in 90 days is consistent with genuine adoption.

---

## 3. Valuation

### Implied Multiples

| Multiple | MCap ($9.68B) | FDV ($39.07B) |
|---|---|---|
| P/S (annualised 30d) | 14.7x | **59.3x** |
| P/TVL | 2.15x | 8.67x |

**Primary valuation anchor is FDV P/S (59.3x).** MCap P/S (14.7x) is presented for context but understates the true dilution-adjusted multiple given that 76.2% of supply has not yet entered the market. Using MCap P/S as a primary comp against fully-diluted public entities is misleading.

### Bull Case for 59.3x FDV P/S

Justifying 59.3x requires one or more of:
1. Revenue growing at 50%+ annually → 3-year forward P/S compresses to ~20x (defensible)
2. Assistance Fund buyback pace exceeds emission rate → effective float doesn't expand at the rate the supply table implies
3. HyperEVM generates a second revenue curve (transaction fees, MEV, ecosystem apps) that compounds the total revenue base
4. Market rerate: as on-chain exchange infrastructure matures, the addressable institutional buyer pool expands, applying traditional SaaS/exchange multiple frameworks

None of these is currently confirmed. They are catalysts to monitor, not assumptions to embed.

### Exchange Comps

| Entity | Annualised Revenue | Market Value | P/S | Status |
|---|---|---|---|---|
| Coinbase | ~$6.5B | ~$55B | ~8x | Fully diluted, regulated |
| Kraken (est.) | ~$1.5B | private | — | Private |
| **Hyperliquid (MCap)** | **$659M** | **$9.68B** | **14.7x** | 23.8% float |
| **Hyperliquid (FDV)** | **$659M** | **$39.07B** | **59.3x** | Full supply |

At FDV, HYPE trades at a significant premium to Coinbase on P/S — justified only by higher growth rate and no regulatory overhead, partially offset by the lack of institutional access as a regulatory trade-off.

---

## 4. Token Supply Dynamics

- Circulating: 238.4M (23.8%)
- Total: 962.3M
- Max: 1.0B
- Outstanding: ~724M HYPE (~$29.5B at current price)

**Assistance Fund (buyback):** At $659M annualised revenue allocated to AF, the annual buyback is substantial relative to current MCap ($9.68B) — approximately 6.8% of MCap/year at current price, assuming full revenue deployment to buyback (actual allocation percentage is not publicly disaggregated). This creates a structural bid but does not fully absorb the 724M supply overhang at current prices.

The buyback is most impactful when token price is lower (more tokens per dollar) and when revenue is high. If revenue holds and price appreciates, the buyback rate as a % of outstanding supply declines. This is a mechanical ceiling on buyback effectiveness during price appreciation phases.

---

## 5. Competitive Position

**Market share:** >50% global on-chain perps volume. All competitors sub-10%.

**Moat sources:**
1. Liquidity flywheel — deep order book is self-reinforcing
2. Infrastructure advantage — HyperBFT throughput/latency not replicated elsewhere; requires years to build
3. Token structure — no VC cliff events to manage against

**On-chain perps TAM:** Still <1% of centralised perps volume ($3–5T/day). Market share shift from CEX to on-chain has been directionally positive but remains early-stage. Evidence of continued shift (quarterly on-chain perps market volume growth data) should be included in a full conviction analysis — not available in this data pull.

---

## 6. Notable On-Chain Activity

A wallet cluster received 3.52M HYPE (~$144M) from an entity attributed to Galaxy Digital over 40 days, with 395K HYPE ($16.2M) transferred within 2 hours of this memo's data pull. This is a material on-chain flow. Identity attribution is based on on-chain tracking — not confirmed by Galaxy Digital — and should be treated as directional signal, not confirmed institutional mandate. Possibility of structured OTC, client custody, or pre-distribution positioning cannot be ruled out.

---

## 7. Key Catalysts

| Catalyst | Timeline | Impact |
|---|---|---|
| HyperEVM ecosystem build-out | Q2–Q4 2026 | Revenue diversification; new TVL sources |
| Alt rotation (BTC dom <55%) | Near-term | Volume and price uplift |
| Revenue growth above $100M/month | 6–12 months | FDV P/S compression to ~40x |
| Regulatory clarity on on-chain perps | Unknown | Removes ceiling on institutional access |

---

## 8. Risk Assessment

| Risk | Severity | Notes |
|---|---|---|
| FDV dilution | **High** | 59.3x FDV P/S; requires revenue growth to compress |
| Regulatory — on-chain perps | **High** | CFTC jurisdiction; front-end enforcement risk |
| Revenue concentration (perps-only) | **Medium** | HyperEVM in early stages |
| Centralisation / protocol governance | **Medium** | Small validator set; team controls roadmap |
| Protocol risk (novel consensus) | **Medium** | 12+ months at scale without major incident |
| CEX-backed competitor | **Low** | No confirmed threat; 2+ year infrastructure lead |

---

## 9. Investment Conclusion

Hyperliquid is the best-in-class on-chain exchange with real revenue, clean token structure, and a growing ecosystem. The MCap case is straightforward at 14.7x P/S — you are buying the dominant on-chain financial infrastructure at a reasonable multiple for a high-growth exchange. The FDV case requires revenue growth and buyback effectiveness, which are plausible but unproven at scale.

The key risks — supply dilution and regulatory exposure — are both known and partially priced. Neither is imminent. The Galaxy Digital accumulation signal (unconfirmed but material) and the ETH options flow showing institutional Q4 bullishness (Dec 2200/3200 call spread) both support a near-term risk-on posture in which HYPE is a high-beta beneficiary.

**Stance: Buy with controlled sizing relative to regulatory risk tolerance.**
- Entry: ~$40–41
- Near-term target: $41.16 (90d high/resistance)
- Medium-term target: $59.30 (ATH reclaim)
- Thesis invalidation: revenue below $40M/month sustained, or regulatory enforcement event

---

*Data sources: CoinGecko, DefiLlama (fees/revenue endpoints). Fetched: 2026-03-17T05:56Z. This memo is for informational purposes only.*
