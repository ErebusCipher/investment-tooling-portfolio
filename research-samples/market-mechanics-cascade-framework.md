# Market Mechanics and Cascade Framework

## Core Insight
Every significant price move propagates through the market in layers. The initial catalyst is only the first layer. The edge is in identifying the second and third layer mechanics before the narrative forms around them — because by the time a narrative exists, the move is already underway. This document provides two frameworks for analysing market mechanics: the Cascade Framework for understanding how events propagate, and the Contrarian Liquidity Framework for identifying when a consensus trade is exhausted.

---

## Part 1 — The Cascade Framework

### First Order — The Initial Catalyst
The raw event: Iranian missile strike, Fed statement, CPI print, protocol exploit, token unlock, regulatory announcement. At this stage only the fastest actors respond — HFTs, algo traders, market makers repricing instantly. The move is often violent and overshoots because liquidity is thin in the first seconds. This is usually not where retail or discretionary traders want to be operating unless they have infrastructure advantages.

### Second Order — Forced and Reactive Actors
**The most important and underappreciated layer.** Two distinct groups:

**Forced actors** — entities that have no choice but to transact regardless of their view:
- Pension funds rebalancing after equity moves
- Leveraged funds hitting margin calls
- Options market makers delta hedging
- ETF creation/redemption mechanisms
- In crypto: liquidation cascades on perps, protocol treasury rebalancing, stablecoin minting/burning mechanics, miner selling after hash rate adjustments

These actors move markets not because of opinion but because of mechanical obligation. Their flows are often predictable if you understand the structure. **Identifying forced actors before a catalyst fires is the highest-value pre-trade analysis available.**

**Reactive traders** — people who saw the catalyst and are now positioning. Faster than retail, slower than algos. The question at this layer: *what positions were people already carrying going into this event, and does this catalyst force them to adjust?* A long-only fund caught offside is now a seller regardless of their long-term view.

### Third Order — The Narrative Cascade
Once forced and reactive actors have moved, the market has a new price level. That new price level is itself information that attracts the next wave — retail traders seeing the move, CT influencers framing the narrative, financial media amplifying the story. This wave is slower, larger in aggregate, and more sentiment-driven. It's where trends extend beyond what fundamentals justify in either direction.

This is also where second-order effects on non-financial entities start to matter: oil spikes → airlines hedging costs → consumer spending data shifts → Fed reassesses → completely different actors pulled into the cascade.

### Fourth Order — The Feedback Loop (Reflexivity)
Price and fundamentals in constant feedback rather than price being a passive reflection of static fundamentals:

- Crypto crash → protocol TVL collapses → fee revenue drops → token price drops further → more TVL exits → reflexive downward spiral
- BTC price rises → mining more profitable → hash rate increases → network security improves → institutional confidence rises → more buying

See [[02 - Soros Reflexivity Framework]] for the full reflexivity treatment. The cascade framework adds the *mechanics* of how the reflexive loop gets initiated and transmitted.

---

### The Cascade Pre-Trade Checklist

For every significant position before entry:

1. **What is the immediate mechanical impact of my entry catalyst?** Who moves first and in what direction?
2. **Who are the forced actors and what are their flows?** Who got caught offside? What are their mechanical obligations?
3. **What narrative does the resulting price level create and who does it attract?** What story gets written around this move?
4. **Does the price move change the fundamentals — and is the feedback loop reinforcing or mean-reverting?** Am I in a reflexive spiral or a one-time adjustment?
5. **What does the market currently believe and how far is that from observable reality?** Where is the disconnect that the catalyst resolves?
6. **What regime are we in and is this trade consistent with the regime posture?** See [[03 - Regime-Dependent Factor Dominance and Reflexivity]].

---

### The One-Liner
*Think about markets in cascade layers — the initial catalyst, the forced and reactive flows it triggers, the narrative that forms once those flows clear, and then the reflexive feedback between price and fundamentals. Most traders are operating at layer three. The edge is in identifying layer one and two mechanics before the narrative forms.*

---

## Part 2 — The Contrarian Liquidity Framework

### Core Insight
**A consensus trade is only profitable if there is sufficient uninvested capital remaining to push it further in the consensus direction.**

If everyone who wants to be long is already long — the trade is exhausted regardless of whether the thesis is correct. The fuel is gone. The only remaining question is what makes them exit, not what makes the price go higher.

This is distinct from a valuation call (the asset is mispriced) or a timing call (the catalyst hasn't fired yet). It is a *positioning* call: the trade is correctly understood by the market but has been fully expressed, and the remaining participants are now the exit liquidity.

### Signals of an Exhausted Consensus Long
- Funding rates sustained at elevated levels (everyone paying to stay long)
- Open interest near historical highs (maximum leverage deployed)
- Retail entering at scale after a large move (third-order actors arriving late)
- Every influencer/KOL bullish on the same name simultaneously
- The narrative is being covered by mainstream financial media
- The smartest bears have been forced out (their covering is the last fuel)
- Upward price moves require increasingly large catalysts to extend

### Signals of an Exhausted Consensus Short
- Sustained negative funding (everyone paying to stay short)
- Every bear case is widely known and discussed
- Short interest at extremes vs. available float
- Holders who wanted to exit have already sold
- Price action fails to make new lows despite incrementally negative news

### The Liquidity Analysis Question
Before entering any trade in the direction of consensus, explicitly ask:
> *Who is left to buy this? Where does the next marginal buyer come from and what size are they?*

If the answer is "retail FOMO on a breakout," size accordingly — that is a trade with a known duration and an inevitable reversal. If the answer is "pension funds who aren't positioned yet and will be forced in by mandate," that is a trade with structural and durable buying pressure.

### The Contrarian Entry Framework
The highest-EV contrarian entries occur when:
1. The consensus trade is genuinely exhausted (positioning signals confirm, not just valuation)
2. A catalyst exists that forces consensus to unwind (not just hoping they get bored)
3. The entry price reflects maximum pessimism / optimism on the wrong side
4. Downside is bounded by something structural (a genuine fundamental floor, a forced buyer, a liquidation level that will attract price)

Note: Being early to a contrarian call is economically equivalent to being wrong. The exhaustion must be confirmed, not just suspected.

---

## Part 3 — The Supply Map (Pre-Trade)

Before entering any altcoin position, build a supply map. This is the pre-trade version of the framework developed fully in [[16 - Pre-TGE Supply Intelligence]] and [[09 - Token Valuation Framework]].

**The five questions:**
1. What % of max supply is currently circulating?
2. Who holds the non-circulating supply, at what cost basis, and when does it vest?
3. What is the net annual supply change (inflation + vesting − buybacks − burns)?
4. At current price, who is in significant profit and approaching unlock dates?
5. Is the protocol's AF/treasury buying above the rate at which team vesting creates supply?

The supply map is not a reason to short — it is a constraint on the bull case. An otherwise excellent fundamental thesis with a toxic supply map requires either a shorter hold horizon or a smaller size to reflect the structural headwind.

---

## Related Frameworks
- [[02 - Soros Reflexivity Framework]] — the fourth-order feedback mechanism in full
- [[03 - Regime-Dependent Factor Dominance and Reflexivity]] — regime check before applying cascade analysis
- [[17 - Derivatives Positioning Signals]] — the data layer that reveals forced actor positioning
- [[15 - Information Asymmetry and Insider Dynamics]] — who the second-order forced actors are in crypto launches
- [[16 - Pre-TGE Supply Intelligence]] — supply map in full
- [[13 - Risk Framework]] — pre-mortem integrates cascade analysis
