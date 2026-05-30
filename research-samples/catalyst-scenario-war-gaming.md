# Catalyst Scenario War-Gaming

## Core Insight

Most catalyst analysis is reactive — the event happens, then the market figures out whether it was bullish or bearish. The edge is in **pre-thinking hypothetical catalysts before they occur**: deciding in advance what a pump.fun airdrop would mean, what OP losing a major client would mean, what a competitor's exploit would mean for adjacent protocols. When the event actually fires, the pre-thinker already has a view — they are not forming one in real time with everyone else.

This is not prediction. It is **conditional reasoning**: *if X happened, what would follow, and for whom?*

---

## The War-Gaming Framework

For any hypothetical catalyst, work through five questions in order:

### 1. Who is directly affected, and what are their incentives?

The first question is not "is this bullish or bearish" — it is "who holds the affected asset and what will they do?"

The same event can be bullish or bearish depending entirely on who is on the receiving end:

- **Airdrop to DeFi power users** (existing protocol users, liquidity providers): likely holders — they are already aligned with the ecosystem, they understand the asset, and they typically restake or hold
- **Airdrop to broad retail** (pump.fun users, speculative traders, Sybil farmers): likely sellers — they have no fundamental attachment, the token is pure windfall, and their natural behaviour is to convert to stable assets or BTC immediately
- **Token unlock to VCs** near their cost basis: depends on price — if they are 10× up, they sell; if they are near par, they may hold for a larger future exit

**The pump.fun airdrop example:**
pump.fun's user base is predominantly retail speculators — people launching and trading memecoins with small amounts of capital. An airdrop to this cohort distributes tokens to people with high time preference, no fundamental attachment, and limited capital reserves. The rational behaviour for most recipients is to sell immediately. The supply shock from a broad airdrop to weak hands is structurally bearish regardless of the token's fundamentals — the first question answers the first half of the thesis.

### 2. What is the second-order narrative effect?

Beyond the direct financial impact, what does this event signal about the protocol, the sector, or the market structure?

- A protocol airdropping broadly signals: *the team believes distribution maximises long-term value* — or that *insiders need an exit event disguised as community building*. The market will read one or the other depending on context.
- A major client leaving a protocol signals: *the product failed to meet their needs* — or *the client is building their own stack and no longer needs the vendor*. Both are bearish for the vendor but the second-order effect differs: the first is a product failure signal that harms all clients; the second is a maturity signal that may harm the vendor but validate the market.

**The OP/Base example:**
If Base removed OP from their stack in favour of their own sequencing infrastructure, the direct effect is revenue loss for Optimism. But the second-order narrative effect is worse: *if the largest OP Stack chain doesn't need OP, why does anyone else?* The narrative damage to the "OP Stack as a business model" thesis is disproportionate to the direct revenue loss. Conversely, it validates Base as an independent platform — potentially bullish for ETH (Base fees go to Coinbase, which accrues to Ethereum ecosystem) even as it is bearish for OP specifically.

### 3. What is already priced in?

The market's reaction to an event depends not just on whether the event is good or bad but on whether it was expected:

- **Fully expected event that happens:** little price movement — the information was already in the price
- **Expected event that doesn't happen:** often larger move than the event itself — the removal of an expected catalyst is repriced as a failure
- **Surprise positive:** large move up — the market scrambles to close an information gap
- **Surprise negative:** large move down, often with overshoot — panic + forced liquidations

War-gaming requires estimating the prior probability the market assigns to the event. Polymarket, options skew, and social media narrative density are proxies for this.

**Rule:** *The trade is in the gap between what the market prices as the probability of the event and what you believe the actual probability is.* If the market prices a pump.fun airdrop at 20% probability and you believe it's 60%, the position is to own the downside hedge before the announcement — not after.

### 4. What is the reflexivity feedback loop?

Does the initial price move trigger additional effects that amplify or reverse it?

- **Price falls → liquidations → more selling → price falls further**: common in high-leverage environments; the initial catalyst is amplified by the cascade
- **Price rises → FOMO → more buying → price rises further**: the reflexive upside loop; most powerful when a new narrative captures broad retail attention
- **Price falls → insiders buy the dip → price recovers**: common in projects with strong conviction holders; the initial move is absorbed and reverses

For the pump.fun airdrop case: recipients sell → price falls → early buyers who sniped the listing also take profits → second wave of selling → if funding flips negative on the asset, short sellers pile in → further cascade. The reflexivity is directionally consistent with the initial thesis (bearish), which increases conviction.

### 5. What is the timeline for the effect to be expressed?

Different catalysts have different lag structures:
- **Immediate:** exploit, regulatory action, sudden partnership announcement — price moves within hours
- **Short-term (days–weeks):** airdrop claim period, token unlock, listing event — the supply hits the market over a defined window
- **Medium-term (weeks–months):** business loss (OP/Base) — revenue impact takes quarters to show up in protocol metrics; narrative damage is faster
- **Long-term (months–years):** regulatory approval, protocol adoption curves — the catalyst is real but the market prices it before the financials confirm it

Timeline matters for entry and exit: if the effect takes 3 months to be expressed in fundamentals, the position needs enough runway to survive the period where the market might not yet agree with you.

---

## Applied Examples

### Example A: Broad Airdrop to Retail (e.g. pump.fun PUMP token)

| Question | Answer |
|---|---|
| Who is affected? | pump.fun users — predominantly retail memecoin traders with high time preference |
| Their incentive? | Convert windfall to liquid assets (BTC, stables) immediately |
| Second-order narrative? | Confirms pump.fun is a for-profit platform monetising attention, not a community project — neutral to negative for loyalty |
| Already priced in? | Airdrop rumours circulate months before; some is priced; surprise timing creates oversized reaction |
| Reflexivity? | Sell pressure → price falls below airdrop reference → sniper/early buyers capitulate → cascade |
| Timeline? | Claim period is typically 3–6 months; selling front-loaded in first 2 weeks |
| **Verdict** | **Structurally bearish on PUMP at and after listing. Short the announcement rally if FDV is elevated.** |

### Example B: Major Client Loss (e.g. OP losing Base)

| Question | Answer |
|---|---|
| Who is affected? | OP token holders and the Optimism ecosystem (OP Stack licensees) |
| Their incentive? | Re-evaluate whether the OP Stack business model is defensible |
| Second-order narrative? | "If Base doesn't need OP, why does anyone?" — attacks the entire ecosystem thesis |
| Already priced in? | Base has been signalling independence for months; partially priced, but not fully |
| Reflexivity? | OP price falls → other OP Stack chains notice → some begin evaluating alternatives → further narrative damage |
| Timeline? | Revenue impact: 2–4 quarters. Narrative impact: immediate. |
| **Verdict** | **Bearish OP on announcement. Also check exposure across OP Stack ecosystem (MODE, ZORA, etc.). Neutral-to-bullish ETH (Base matures, Coinbase doubles down on Base).** |

### Example C: Competitor Exploit (e.g. major Aave competitor exploited)

| Question | Answer |
|---|---|
| Who is affected? | Users of the exploited protocol; indirectly, Aave (as the flight-to-safety alternative) |
| Their incentive? | Users flee the exploited protocol; seek safe alternatives |
| Second-order narrative? | "DeFi lending is risky" — initially broad FUD, then flight to quality |
| Already priced in? | No (exploits are surprise events by definition) |
| Reflexivity? | Initial panic sells all DeFi lending tokens → quality protocols recover as users recognise the distinction → relative value spread widens |
| Timeline? | Initial contagion: hours. Recovery divergence: days to weeks. |
| **Verdict** | **Short-term bearish all DeFi lending. Medium-term long Aave relative to exploited protocol. The pairs trade opportunity from the panic correlation.** |

---

## The War-Gaming Habit

This framework is most valuable when applied **before** events, not after. The process:

1. **Weekly scan:** What are the plausible 30-day catalysts in the assets you hold or monitor? Run each through the five-question framework.
2. **Daily alpha integration:** The ideas.md format includes "key risk / invalidation" per idea — the war-gaming framework is what populates that field with something specific rather than generic risk language.
3. **Pre-mortem:** Before entering any position, war-game the scenario where you are wrong. What specific event would make your thesis fail? This is the [[13 - Risk Framework]] pre-mortem integrated with scenario analysis.

The goal is to have a pre-formed view on at least the most obvious hypothetical catalysts so that when they fire, your reaction is execution — not formation.

---

## What War-Gaming Is Not

- **Not prediction:** The goal is not to predict whether pump.fun will airdrop — it is to know in advance what you would do if they did
- **Not paranoia:** Not every catalyst needs war-gaming; focus on the scenarios most likely to materially affect your current positions or watchlist
- **Not a substitute for real-time information:** When an event actually happens, update the war-game with actual data — who specifically received the airdrop, what the actual supply schedule is, what the actual client relationship was

---

## Related Frameworks
- [[08 - New Coins and Catalysts as Alpha]] — the broader catalyst framework
- [[11 - Complete Thesis Framework]] — catalyst as Component 2; the pre-trade stress tests
- [[13 - Risk Framework]] — pre-mortem and thesis invalidation
- [[21 - Exchange Listing Dynamics]] — listings as a specific catalyst type to war-game
- [[17 - Derivatives Positioning Signals]] — options skew and market-implied probabilities as input to step 3 (what is priced in)
