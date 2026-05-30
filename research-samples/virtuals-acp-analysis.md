# Virtuals Protocol: ACP Data Analysis
### Pseudonymous Research Sample — March 31, 2026

---

## Executive Summary

1. **The jobs are real.** 1,422,194 ACP jobs are independently verified on-chain — 65% of ACPscan's claimed 2.19M. The commerce layer is not fabricated.

2. **The core reconciliation issue is scope and methodology alignment, not fabricated activity.** A Feb 12 onward settlement-contract outflow query yields $1,053,960 across 38,995 payment transfers to 1,309 unique addresses (~$630K to agent wallets, ~$315K to buybacks, ~$105K to treasury under 60/30/10). An expanded ACP-like on-chain query from Oct 1, 2025 yields ~$8.03M, making ACPscan-scale totals directionally plausible. The unresolved question is what period and counting rules ACPscan cumulative metrics use.

3. **DefiLlama's $33K/day understates total protocol economics by design.** Its four revenue streams are all denominated in CBBTC or legacy VIRTUAL flows. ACP fees are in USDC and invisible to the methodology — this is a structural gap, not an oversight.

4. **The job count decline is deeper than initially measured.** The protocol peaked at 82,946 jobs/day on February 22 — not mid-March. The March 14–16 period was a brief secondary recovery within a declining trend. From the February peak to the late-March trough of ~9–12K/day represents an **~88% decline**. This is not a dashboard artefact.

5. **$VIRTUAL holders have no documented direct claim on ACP fees.** The 30% buyback burns the seller agent's own sub-token. The 10% treasury accrues to Virtuals Treasury with no documented redistribution mechanism to $VIRTUAL holders. $VIRTUAL value capture from ACP is entirely indirect — the token is required as the base liquidity pair for agent tokens and to create new agents. The whitepaper also contains an unreconciled fee split discrepancy: the ACP Current Status page describes a 60/30/10 split while the Architecture page describes an 80/20 split.

6. **The "multi-chain ACP" expansion is not a real product yet.** x402 service settlements across Arbitrum, Solana, and XRPL total $1,224.77 all-time. This is a narrative, not a revenue stream.

---

## 1. The Revenue Measurement Problem

### Why DefiLlama Shows Only Partial Revenue

DefiLlama tracks Virtuals Protocol revenue across four streams: Base Virtual-fun (legacy buy/sell), Base Virtual-app (legacy non-trading), Base CBBTC-prototype, and Base CBBTC-sentient (tax manager outflows). All four are CBBTC or legacy VIRTUAL denominated. ACP service fees are settled in USDC. The methodology predates ACP and has not been updated to capture it.

DefiLlama's ~$33K/day is therefore a launchpad revenue metric, not a protocol revenue metric. As ACP scales, this figure becomes structurally less representative of total protocol economics.

### What ACPscan Claims — and What It Means

ACPscan reports cumulative figures as of March 24, 2026 (last update):

| Metric | Value | 30D Change |
|---|---|---|
| Total aGDP | $480.49M | +0.23% |
| Total Revenue | $3.93M | +33.55% |
| Total Jobs | 2.19M | +19.30% |
| Unique Active Wallets | 28.99K | +10.14% |

A critical accounting point: ACPscan's "Total Revenue" is the **agent wallet portion (60%)** of gross fees, not the gross itself. Per the Virtuals whitepaper, every 100 USDC in ACP gross throughput splits as 60 USDC to the agent, 30 USDC to token buyback, and 10 USDC to the protocol treasury. ACPscan's $3.93M therefore implies **$6.55M in all-time gross throughput**. If that cumulative starts at February 12, this implies one interpretation; if it includes earlier ACP activity or backfilled history, it implies another. The last-30-day implied gross run rate, derived from the +33.55% 30D revenue growth applied to the cumulative base, is approximately $55K/day.

ACPscan reads from `claw-api.virtuals.io` — Virtuals' own centralized API. Revenue figures are self-reported by the protocol.

As of March 31, the ACPscan aggregate metric charts — cumulative revenue, aGDP, and job totals — have not updated since March 24. The individual job feed remains live and on-chain settlement is active, indicating this is a display or aggregation layer issue rather than a data suppression concern. However, it means the figures in the table above represent the last available ACPscan snapshot, not the current state.

The aGDP/revenue divergence is a potentially bullish signal if the underlying data is accurate: aGDP grew only 0.23% in 30 days while revenue grew 33.55%. If real, this implies margin expansion — higher-fee job categories displacing lower-fee volume. Given the frozen aggregate metrics, this reading cannot currently be updated or confirmed.

### The Analytics Platform Blind Spot

Cross-referencing all major data platforms reveals a consistent gap:

| Platform | What It Measures | ACP Coverage |
|---|---|---|
| DefiLlama | 4 legacy fee streams, ~$33K/day | None — USDC outside methodology |
| Token Terminal | VIRTUAL to fee receivers — $46.6M all-time fees / $2.0M revenue | None — 159 contracts indexed, zero ACP |
| Artemis | Pre-aggregated Dune queries (fee_fun_usd + tax_usd), Base only | None |
| ACPscan | Virtuals' own centralized API | Only source — self-reported |

Notably, Artemis — presented as an independent analytics platform — sources its data from third-party Dune queries rather than performing independent on-chain verification. The appearance of multiple independent data sources corroborating the launchpad revenue figure is therefore partially illusory. They all measure the same legacy layer through slightly different lenses.

**The only source covering ACP is Virtuals' own dashboard.** Every other platform has a structural blind spot to the exact revenue layer the thesis depends on.

---

## 2. What On-Chain Investigation Confirmed

### Jobs Are Real

Using the ERC-4337 Entry Point v0.7 (`0x0000000071727De22E5E9d8BAf0edAc6f37da032`) — the correct routing layer for all ACP transactions — and filtering for transactions containing ACP job JSON payloads, the following was verified on-chain:

| Period | Daily Jobs | Notes |
|---|---|---|
| Feb 12–16 | 11K–50K/day | Ramp-up from launch |
| Feb 17 | 74,322 | First major spike |
| Feb 18–21 | 19K–40K/day | — |
| Feb 22 | **82,946** | **Protocol peak** |
| Feb 23 – Mar 1 | 33K–59K/day | Elevated but declining |
| Mar 2–13 | 19K–50K/day | Volatile, declining trend |
| Mar 14–16 | ~34–38K/day | Brief secondary recovery |
| Mar 17–20 | ~26K/day | Declining |
| Mar 21–24 | ~12K/day | Sharp decline |
| Mar 25–31 | ~9–12K/day | Trough |
| **Cumulative (Feb 12 – Mar 31)** | **1,422,194** | — |

1,422,194 jobs are verifiably on-chain — 65% of ACPscan's 2.19M claim. The March 14–16 period (~34–38K/day) was not the peak — it was a brief secondary recovery within a declining trend that had begun in late February, after the true protocol peak of 82,946 on February 22.

The 35% job count gap deserves the same scrutiny applied to the revenue discrepancy. Four candidate explanations:

**Calldata filter misses.** The query detects the hex encoding of "price" (`0x7072696365`) in UserOp calldata. Jobs using a different field name, different JSON structure, or a variant encoding would be missed entirely. This is likely the largest contributor.

**Off-chain job types.** Some ACP job categories may coordinate entirely via `claw-api.virtuals.io` with only final settlement on-chain — or no on-chain transaction at all. ACPscan may be counting API-layer job events that never produce an Entry Point UserOp.

**ACPscan job counting methodology.** ACPscan may count job lifecycle stages (initiation, acceptance, completion, failure) as separate job events, or include retried and resubmitted jobs. This is the direct parallel of Hypothesis 4 in the revenue analysis.

**Entry Point version mismatch.** If any ACP traffic routes through Entry Point v0.6 or a non-standard entry point variant, our v0.7-only query misses it entirely.

The gap is likely a combination of (1) and (3) — calldata filter misses plus ACPscan's API counting methodology. The more concerning interpretation — that ACPscan's job API systematically overcounts by the same mechanism inflating its revenue figures — cannot be ruled out. The jobs are real; whether 1.42M or 2.19M is the correct count is unknown from public data.

Each ACP job embeds its metadata directly in the UserOp calldata on-chain:

```json
{
  "name": "ask_technical_question",
  "requirement": { "asset": "$VIRTUAL", "query": "..." },
  "priceValue": 2,
  "priceType": "fixed",
  "isPrivate": false
}
```

Price, job type, and requirements are on-chain in every transaction. The commerce layer is real.

### The Settlement Architecture

A verified settlement transaction (`0x927f0b55c2b3be5c8226224ff4a03f3c4791d963e5d9a96dad311d1b99f036ea`) confirms a 3-step on-chain flow: the buyer's AA wallet approves USDC to the ACP settlement contract (`0xa6C9BA866992cfD7fd6460ba912bfa405ada9df0`), calls a payment function with the job ID, then logs "Payment made." on-chain. This is consistent with the documented 60/30/10 fee split. Settlement is on-chain.

### Revenue Reconciliation Is Scope-Sensitive

The settlement contract (`0xa6C9BA866992cfD7fd6460ba912bfa405ada9df0`) has processed ~$320M in USDC (Base USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`) since June 2025, the vast majority of which is agent trading activity rather than ACP service fees. Isolating ACP-specific revenue from inflows alone is not possible.

Transaction-level analysis reveals that the settlement contract routes each job payment in full to a single recipient per transaction — it does not perform the 60/30/10 split itself. Querying all USDC outflows from the settlement contract since February 12 identifies 1,309 distinct recipient addresses. Among the top 20 by volume: individual agent wallets dominate, and `0xe5dDb25064ef25E0076790f61A06f8a375FAd04F` ($96,324 received across 1,827 transfers) is the likely buyback contract — confirmed by its receipt of both USDC and agent token flows consistent with swap activity.

Querying total USDC outflows from `0xa6C9BA866992cfD7fd6460ba912bfa405ada9df0` across all recipients since February 12 yields a scoped figure: **$1,053,960 gross**, across **38,995 payment transfers** to **1,309 unique recipient addresses**. This cross-checks cleanly against the ~$1.05M inflow estimate derived independently.

Against ACPscan's implied gross of **$6.55M**, this creates an apparent **6.2x gap** if both datasets are treated as the same scope. Two additional observations from this scoped data:

- **1,309 unique payment recipients** vs 38,000+ claimed registered agents — the vast majority have never received an ACP payment, consistent with the finding that most agent registrations are economically inactive
- **38,995 payment transfers** vs 1,422,194 verified jobs — ACP exhibits high job volume but low observable monetisation density: only ~2.7% of jobs result in observable USDC settlement. This implies either (a) the majority of ACP activity is non-monetised coordination, or (b) a significant portion of paid volume occurs through a settlement path not captured in this analysis.

**The conclusion is firm on what is measured, but not on like-for-like comparability:** $1.05M in gross ACP throughput is independently confirmed on-chain for the Feb 12 onward settlement-contract window — implying ~$630K to agent wallets, ~$315K to agent token buybacks, and ~$105K to the Virtuals protocol treasury under 60/30/10. Expanded-window ACP-like on-chain queries from Oct 1, 2025 produce materially higher totals (~$8.03M), indicating that scope alignment is likely a major driver of the apparent gap versus ACPscan.

---

## 3. The Apparent 6.2x Gap — Possible Explanations

The gap between the $1.05M scoped on-chain slice and $6.55M ACPscan implied gross is large enough to warrant systematic testing. Expanded-window ACP-like on-chain queries from Oct 1, 2025 produce ~$8.03M, which makes ACPscan-scale values plausible in magnitude and shifts the core issue to scope and counting comparability. Four hypotheses were investigated. One was ruled out by direct on-chain testing. One was partially confirmed but insufficient in isolation. Two remain open and untestable from current public data.

### Hypothesis 1: The 80/20 Architecture Split (Ruled Out)

The Virtuals whitepaper contains an internal inconsistency: the ACP Current Status page describes a 60/30/10 fee split, while the ACP Concepts and Architecture page describes an 80/20 split (provider / protocol). If the operative split is 80/20, the settlement contract might handle only the 20% protocol portion — meaning our query captures one-fifth of true gross, implying total gross of $1.05M ÷ 0.20 = $5.25M, nearly closing the gap.

**Tested and ruled out.** Examining all USDC transfers within a sample of settlement contract transactions confirms that every transaction shows exactly two transfers of equal amount: one in from the buyer, one out to the recipient. There are no parallel larger transfers going directly between buyer and agent wallets in the same transactions. The settlement contract handles 100% of the job price, not 20%. One transaction (`0x10f652a9...`) did show a separate 0.1 USDC direct transfer alongside a 1 USDC settlement — consistent with a 10% treasury fee paid outside the settlement contract — but this 90/10 pattern does not materially change the gross estimate and cannot explain a 6x gap.

### Hypothesis 2: Agent Re-Deployment / Compounding (Partial — Insufficient at Scale)

The whitepaper explicitly describes and encourages agents re-deploying earnings to hire other agents: "Lands in the agent wallet; can be withdrawn or re-deployed to hire other agents, compounding on-chain Gross Agent Product." If Agent A earns 60 USDC and immediately uses it to hire Agent B for 60 USDC, ACPscan counts two gross transactions — but only the original inflow represents new money entering the system. The same USDC circulating through multiple agents could inflate ACPscan's cumulative gross figure significantly relative to the actual capital deployed.

**Tested — partially confirmed, insufficient to explain the full gap.** Cross-referencing settlement contract recipients against senders identifies wallets on both sides. The most significant example: `0x4fb22558...` received $116,176 as an agent and sent $148,000 back in as a buyer — consistent with genuine re-deployment. However, most extreme ratios in the dataset (100x to 1,410,159x) are DeFi routing noise: the settlement contract processes ~$320M in non-ACP activity, and wallets routing DeFi flows through the contract appear in the results having received only a tiny ACP payment. The compounding signal cannot be cleanly isolated from this noise without cross-referencing against Entry Point v0.7 transactions. What is visible confirms compounding occurs, but not at the scale required to explain a 6x multiplier.

### Hypothesis 3: Multiple Settlement Contract Versions (Open, Less Supported by Current Overlap Tests)

Our scoped query is locked to `0xa6C9BA866992cfD7fd6460ba912bfa405ada9df0`. If earlier or parallel versions of the settlement contract exist — v1 deployed at launch, v2 replacing it, or separate contracts handling different agent tiers or job types — their transaction history would be invisible to that slice. Candidate contract discovery and overlap tests did not identify an obvious parallel ACP settlement contract with meaningful strict EntryPoint overlap, which reduces (but does not eliminate) this explanation.

### Hypothesis 4: ACPscan Methodology / Scope Mismatch (Open)

ACPscan reads from `claw-api.virtuals.io` — Virtuals' own centralised API. Its methodology and cumulative start window are not fully published. Mechanisms that could create non-like-for-like comparisons include differing lifecycle inclusion, retries/resubmissions, off-chain events, and broader historical scope/backfill. Without access to ACPscan query logic and a contract coverage map, this cannot be assessed quantitatively.

### Summary

| Hypothesis | Status | Notes |
|---|---|---|
| 80/20 architecture split | **Ruled out** | All transactions show equal IN/OUT — settlement contract handles full gross |
| Agent re-deployment / compounding | **Partial** | Confirmed to occur; insufficient scale to explain 6x alone |
| Multiple settlement contract versions | **Open (lower confidence)** | Candidate discovery + overlap tests did not reveal an obvious parallel ACP settlement path; cannot fully rule out |
| ACPscan methodology / scope mismatch | **Open (high impact)** | Cumulative start window and counting rules not fully disclosed; likely major driver of apparent gap |

The most likely explanation is a combination of scope-window mismatch, partial compounding effects, and ACPscan methodology differences. The discrepancy cannot currently be resolved from publicly available data because the ACPscan start window, counting logic, and full contract coverage are not fully disclosed.

---

## 4. ACP Architecture — What It Actually Is

The original pitch and most public commentary describes ACP as a "trustless, on-chain agent commerce layer." This framing requires qualification.

**What is on-chain:** job initiation (ERC-4337 UserOps with embedded JSON), USDC payment settlement, job completion memos, token buybacks.

**What is off-chain:** job coordination and matching (`claw-api.virtuals.io`), agent discovery and routing, success/failure determination, and revenue accounting.

**The honest framing:** ACP is a centralized API coordination layer with on-chain settlement for fund transfers. It sits closer to Stripe with on-chain escrow than to a trustless smart contract network. This is a design choice — but it changes how the system should be evaluated — and the multi-chain expansion narrative warrants scepticism.

"ACP on Arbitrum, Solana, and XRPL" refers to x402 — an HTTP payment protocol, not a smart contract deployment. Total x402 service settlements across all non-Base chains: **$1,224.77 all-time.**

The near-zero figure is not surprising once the structural dependency is understood. The Base ACP ecosystem functions because of infrastructure that does not exist on other chains: Virtuals-native agent token bonding curves, $VIRTUAL as the base liquidity pair, and the ERC-4337 settlement layer. Agents operate on Base because that is where the economic incentives — token upside, protocol rewards, buyer flow — are concentrated. On Arbitrum, Solana, or XRPL, x402 is just an HTTP spec with no marketplace, no agent token economy, and no liquidity. The $1,224.77 total is consistent with developer testing, not deployment — a handful of manually executed transactions, not a product used by real agents at scale. Multi-chain expansion is structurally gated behind replicating the Base economic layer on other chains, which has not happened.

### What the Fee Split Means for $VIRTUAL Holders

Two clarifications on the fee split, both material to the investment thesis.

**The 30% buyback does not buy $VIRTUAL.** Per the ACP Current Status page, it buys and burns the **selling agent's own sub-token** — each agent has its own bonding curve token, and that is what accrues value from ACP service transactions.

**The 10% protocol treasury does not flow to $VIRTUAL holders.** The whitepaper states only that it goes to "Virtuals Treasury," with 1% of gross (10% of the treasury cut) flowing to a separate G.A.M.E Treasury. No mechanism is documented — no $VIRTUAL buyback-and-burn, no staking rewards, no fee distribution — by which either treasury redistributes funds to $VIRTUAL token holders. $VIRTUAL value capture from ACP is entirely indirect: the token is required as the base liquidity pair to buy agent tokens, and creating new agents requires $VIRTUAL for liquidity pools. There is no direct revenue claim.

**There is also a fee split inconsistency in the whitepaper itself.** The ACP Current Status page describes a 60/30/10 split (agent / agent token buyback / treasury). The ACP Concepts and Architecture page describes a simple 80/20 split (provider / protocol). These do not reconcile. The 60/30/10 likely describes the "Butler" routing layer; the 80/20 likely describes the base smart contract settlement. The relationship between the two is not explained. ACPscan's implied gross of $6.55M (derived from $3.93M ÷ 0.60) assumes the 60/30/10 model is operative — if the contract layer runs on 80/20, the implied gross would be $4.91M ($3.93M ÷ 0.80). The discrepancy with our on-chain figure of $1.05M persists under either assumption.

---

## 5. Agent Concentration and Product Risk

| Agent | Revenue | % of Total | aGDP | Jobs | Success Rate |
|---|---|---|---|---|---|
| Luna | $700.4K | 17.8% | $700.6K | 40,173 | 51% |
| Ethy AI | $572.8K | 14.6% | $218.1M | 1,140,177 | 99.5% |
| Director Lucien | $262.5K | 6.7% | $262.6K | 59,188 | 86.5% |
| Top 10 agents | ~$2.24M | 57% | — | — | — |
| Remaining 38,877 | ~$1.69M | 43% | — | — | — |

Two structural observations:

**Ethy AI distorts the headline metrics.** At 52% of all jobs and 45.4% of aGDP ($218M), Ethy AI dominates volume but generates only 14.6% of revenue. It is a trading agent — its aGDP is trading volume routed through DeFi protocols, not service fee revenue. aGDP as a headline metric is therefore largely a trading volume proxy, not a measure of the service economy. If Ethy AI churns, job count halves but revenue falls only ~15%.

**Luna is a top revenue risk.** At $700.4K and 17.8% of all revenue, Luna is the single largest contributor — but its job success rate is 51%. An agent performing at coin-flip reliability on half its engagements is structurally fragile. Further degradation would materially impact the revenue base.

---

## 6. Revised Thesis Assessment

### What Has Changed Since the Original Pitch

| Pitch Assumption | Current Reality |
|---|---|
| "ACP 16 days old, no data yet" | 47 days of data, 1.42M jobs verified on-chain |
| "$35K/day revenue" | $33K/day confirmed (launchpad only, DefiLlama) |
| "ACP volume not publicly indexed" | ACPscan exists — self-reported; aggregate charts frozen since Mar 24 (display bug, job feed live) |
| "aGDP $470M+" | $480.49M confirmed |
| "No sustained volume data yet" | Data exists — and the trend is declining |

---

## 7. Key Signals to Monitor

| Signal | Source | What to Watch |
|---|---|---|
| ACP job count | Dune: Entry Point v0.7 | Recovery from late-March trough — sustained return above 20K/day indicates the decline was temporary |
| ACP gross throughput | ACPscan revenue ÷ 0.60 + on-chain slices | Track Feb 12 scoped totals and expanded-window ACP-like totals in parallel; watch for convergence with ACPscan deltas |
| Settlement contract outflows | Dune: `0xa6C9BA86...` USDC outflows | Ground-truth on-chain revenue; watch for trend vs ACPscan convergence or divergence |
| Luna success rate | ACPscan leaderboard | Below 40% = top revenue agent structurally degrading |
| Launchpad revenue | DefiLlama | Floor stability for legacy business — structurally blind to ACP but useful as a secondary signal |

---

## 8. Conclusion

The confirmed findings support a real product: 1.42M jobs independently verified on-chain, active settlement processing in real time, and a growing revenue yield per unit of aGDP. The confirmed risks are equally real: an ~88% job count decline from the February peak to the late-March trough, unresolved scope/method reconciliation between on-chain slices and ACPscan cumulative totals, a top agent at 51% success rate, and no documented mechanism by which ACP fees flow directly to $VIRTUAL holders.

The question is whether a small position remains justifiable given these findings. The case for holding in reduced size rests on two structural observations that are independent of the metric uncertainties.

**First: the market is tracking the wrong data, and the one ACP-native source is method-opaque.** Every standard analytics platform — DefiLlama, Token Terminal, Artemis — has a structural blind spot to ACP. Their methodologies predate it and have not been updated to capture USDC-denominated ACP fees. Anyone using DefiLlama's ~$33K/day as a protocol revenue figure is measuring the legacy launchpad business while missing the new one entirely. ACPscan is the only source with ACP coverage, but its cumulative start window and counting logic are not fully disclosed. The only way to form a current view on ACP activity is to do the on-chain work directly: querying Entry Point activity and settlement payment flows across clearly defined windows.

**Second: the on-chain infrastructure is real and active.** The settlement contract is processing transactions in real time. 1.42M jobs are verifiably on-chain. The architecture is functional. Whatever the correct interpretation of the revenue discrepancy — compounding, multiple contracts, or ACPscan overcounting — the underlying activity is not fabricated. The question is one of monetisation density and accurate measurement, not existence.

The case against conviction-sized exposure is also clear. The job count decline is a real on-chain signal, not a dashboard artefact. Revenue comparability remains unresolved without disclosed ACPscan scope/method definitions. $VIRTUAL holders have no direct fee claim from ACP. And the whitepaper contradicts itself on the fee split.

The appropriate framing is not binary. A small position in the context of a broader opportunity set is defensible — not because the bull case is confirmed, but because this analysis has identified a structural information gap between what is actually occurring on-chain and what the market's standard tools can see. That gap represents potential alpha regardless of whether ACP ultimately scales. If ACP recovers and the revenue discrepancy resolves in Virtuals' favour, that is almost certainly not yet priced in. If it does not, the position is small enough to be managed.

The key unresolved issue is not whether ACP activity is real — it is — but how to reconcile scope and counting definitions between on-chain slices and ACPscan cumulative reporting.

---

*Research conducted March 31-April 2, 2026. On-chain analysis via Dune Analytics (Base). Settlement architecture verified via Basescan. Revenue methodology from Virtuals Protocol whitepaper and ACPscan.*

---

## Relevant Links

**Protocol Documentation**
- [Virtuals Protocol Whitepaper](https://whitepaper.virtuals.io/)
- [ACP Current Status](https://whitepaper.virtuals.io/builders-hub/acp-current-status)
- [ACP Concepts, Terminologies and Architecture](https://whitepaper.virtuals.io/acp-product-resources/acp-concepts-terminologies-and-architecture)
- [Virtuals Protocol GitHub](https://github.com/Virtual-Protocol)

**Protocol Dashboards**
- [ACPscan — ACP job and revenue tracker](https://app.virtuals.io/acp/scan)

**Key Contract Addresses (Base)**

| Contract | Address | Role |
|---|---|---|
| ERC-4337 Entry Point v0.7 | `0x0000000071727De22E5E9d8BAf0edAc6f37da032` | Routes all ACP job UserOps |
| ACP Settlement Contract | `0xa6C9BA866992cfD7fd6460ba912bfa405ada9df0` | Receives buyer USDC; routes to agent wallets |
| ACP Buyback Contract | `0xe5dDb25064ef25E0076790f61A06f8a375FAd04F` | Receives USDC for agent sub-token buybacks |
| USDC (Base) | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | Settlement token for all ACP fees |

**On-Chain References**
- [Example ACP job initiation transaction — Basescan](https://basescan.org/tx/0x927f0b55c2b3be5c8226224ff4a03f3c4791d963e5d9a96dad311d1b99f036ea)
- [Example ACP settlement transaction — Basescan](https://basescan.org/tx/0xdeeb565205a1f2bfe081e280f041fc4499aea46dcb19f272ba6ae7170541ffae)
