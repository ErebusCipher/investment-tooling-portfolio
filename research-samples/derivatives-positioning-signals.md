# Derivatives Positioning Signals

## Core Insight
The derivatives market is a real-time map of how leveraged participants are positioned. Funding rates, open interest, options skew, and liquidation levels are not just noise around spot price — they are data on crowding, conviction, and fragility that spot price alone cannot provide. Reading derivatives positioning correctly tells you not just where the market is but how much stress is hidden in the current price and where the pressure points are.

---

## Funding Rates

The perpetual futures funding rate is the most widely available and most misread signal in crypto.

**What it is:** The rate paid by longs to shorts (positive funding) or shorts to longs (negative funding) to keep the perp price anchored to spot. High positive funding = longs are paying a premium to hold leveraged exposure; high negative funding = shorts are paying to hold their position.

**How to read it:**

| Condition | Implication |
|---|---|
| Sustained high positive funding | Crowded longs — fragile, prone to flush |
| Funding spike to extreme positive | Acute crowding, often precedes short-term reversal |
| Persistently negative funding | Crowded shorts — squeeze setup if any positive catalyst |
| Funding near zero | Balanced positioning, no directional lean |
| Funding normalising after spike | Crowding clearing, cleaner base for next move |

**The nuance:** In confirmed bull trends, high positive funding can persist for weeks. Funding alone is not a trade — it is a fragility indicator. High funding + a catalyst that forces long liquidations = the flush. High funding with no catalyst = carry cost for shorts. Always combine with OI and a thesis about what forces the unwind.

**The carry trade application:** When funding is persistently elevated, selling the perp and holding spot earns the funding rate with delta-neutral exposure. This is a genuine yield source when funding is rich enough to justify the basis risk.

---

## Open Interest

OI measures the total notional value of open derivative positions. It tells you whether price moves are being driven by new money entering or existing positions closing.

**The four combinations:**

| Price | OI | Read |
|---|---|---|
| Rising | Rising | Trend confirmation — new longs entering, conviction behind the move |
| Falling | Rising | Trend confirmation — new shorts entering, sellers have conviction |
| Rising | Falling | Short squeeze or long covering — move is less reliable, positioning-driven not fundamental |
| Falling | Falling | Long liquidation or profit-taking — exhaustion, not fresh conviction |

**OI at extremes:** When OI reaches historical highs, the market is maximally leveraged. This is not a directional signal — a highly leveraged market can move in either direction — but it is a fragility signal. A large OI + a price move in either direction can trigger a cascade of liquidations that extends the move well beyond what fundamentals justify. This is the mechanics behind the large flush events.

**OI after a liquidation event:** Post-flush, OI typically drops sharply as leveraged positions are closed. This cleaned positioning base is often where the next trend begins — fewer forced sellers or buyers, price can trade more freely on incoming flow.

---

## Options Skew

Options skew measures the relative pricing of puts versus calls at equivalent distances from spot. It is the market's revealed preference for directional protection.

**Reading skew:**

| Condition | Implication |
|---|---|
| Puts expensive relative to calls (negative skew) | Market is paying for downside protection — hedging demand elevated, risk-off lean |
| Calls expensive relative to puts (positive skew) | Market is paying for upside participation — risk-on, often late-stage bull |
| Skew normalising after a spike | Hedging demand easing, stress being priced out |
| Skew inversion (calls >> puts) | Maximum greed — market pricing aggressive upside with limited downside concern |

**Term structure of skew:** Near-term skew more negative than long-dated skew indicates acute near-term stress being hedged. If near-term skew normalises while long-dated skew remains elevated, the market is moving past near-term fear but retaining structural caution.

**The Paradigm flow signal:** Institutional block trades on Paradigm are the cleanest real-time options positioning data available in crypto. Large put spread buying at specific strikes (e.g. 63K/60K BTC put spreads at scale) is a direct signal that institutions are hedging specific downside levels. This is more informative than aggregate skew because it shows you the strikes being defended and the size of the hedge. See the daily alpha process for how to read these flows.

---

## Implied Volatility and Term Structure

IV tells you what the options market is pricing for future realised vol. The term structure (short-dated IV vs long-dated IV) tells you where uncertainty is concentrated.

| IV Condition | Read |
|---|---|
| IV spike | Market pricing an event or stress — options expensive, better to sell vol than buy it (if thesis allows) |
| IV compression | Calm — options cheap, better to buy vol than sell it ahead of a known catalyst |
| Flat/inverted term structure | Near-term stress dominates — short-dated options expensive relative to long-dated |
| Steep upward term structure | Near-term calm, long-dated uncertainty — carry trades favour short-dated |

**IV at cycle lows:** Extremely compressed IV (both realised and implied) is the setup described in [[07 - Volatility Regime Breaks]]. Options are cheap, the market has priced in continued calm, and the asymmetry favours buying vol or positioning for a directional break. The direction of the break is a separate question from the fact that the break is coming.

---

## Liquidation Levels

Liquidation maps (available via Coinglass, Hyblock) show the price levels at which large leveraged positions would be forcibly closed.

**Why they matter:** Market makers and large players have an incentive to push price toward high-liquidation zones — hitting those levels generates forced buying or selling that extends the move and provides liquidity for the initiating position to be closed. This is not a conspiracy; it is rational behaviour given the market structure.

**Practical use:**
- High liquidation cluster above current price = potential magnet for a short squeeze move
- High liquidation cluster below current price = potential magnet for a flush
- After a large liquidation event, the map clears — fewer forced sellers/buyers at nearby levels, price can consolidate

---

## Combining the Signals — Composite Reads

**Maximum crowded long (fragile):**
High positive funding + rising OI + call skew elevated + IV compressed
→ Any negative catalyst triggers a cascade. Position sizing should reflect that the downside move, when it comes, will overshoot.

**Maximum crowded short (squeeze setup):**
Negative funding + declining OI + put skew elevated + IV elevated
→ Any positive catalyst, or simply time with no negative catalyst, triggers a short squeeze. The squeeze is not a fundamental development — fade it once funding normalises.

**Clean positioning base (trend-ready):**
Funding near zero + OI post-flush at low levels + skew neutral + IV normalised
→ This is the setup where fundamentals and catalysts drive price most cleanly. Highest signal-to-noise for directional trades.

**Institutional hedging active (near-term caution):**
Large put spread buying in Paradigm flow + negative near-term skew + IV curve inverting
→ Sophisticated money is protecting against a specific downside scenario. The strikes they're buying tell you the level they're concerned about.

---

## Options Open Interest — Distinct from Perps OI

Options OI behaves differently from perps OI and requires its own reading framework.

**OI growth vs mark-to-market appreciation:** When the price of the underlying moves toward a strike, the option's dollar value increases — but its *contract count* OI does not automatically change. If OI *and* premium are both rising on a specific contract, it means new positions are being opened, not just existing positions appreciating. This is a fundamentally different signal:

| OI change | Premium change | Read |
|---|---|---|
| Rising | Rising | New longs entering — position building, highest conviction signal |
| Flat | Rising | Existing positions appreciating — thesis intact but no new conviction |
| Falling | Rising | Short covering into a rally — longs closing into strength, fragile |
| Rising | Falling | Sellers opening new positions — someone is fading the move at this strike |

**Applied example (ETH-29MAY26-3200-C, April 12–14):** OI went from 38,694 → 50,927 ETH (+31.6%) while ETH moved from $2,188 → $2,356 (+7.7%) and the mark price of the option itself doubled ($14.21 → $26.52). All three moving together — underlying up, premium up, OI up — is the strongest possible continuation signal: new buyers are still entering at higher cost after the move has already begun.

**Cross-strike OI concentration:** Reading the total options surface for which single strike dominates OI across all expiries identifies the institutional price target. When the largest single contract on the Deribit ETH options surface is the Dec 2026 3200-C at 67,058 ETH OI — larger than any other strike at any expiry — that strike is not arbitrary. It is where the largest pool of institutional capital has chosen to express a view. The concentration of OI at a specific strike anchors market maker hedging activity around that level and creates mechanical buying pressure if spot approaches it.

**How to pull this:** `deribit.com/api/v2/public/get_book_summary_by_currency?currency=ETH&kind=option` returns all ETH options contracts with OI. Sort by open_interest descending to identify the dominant strikes. Run this weekly or before any options-anchored thesis.

---

## Volume / Market Cap Ratio

Spot volume relative to market cap is an underused signal for distinguishing active buying conviction from passive price drift.

| Vol / Mcap (24h) | Read |
|---|---|
| <2% | Thin — price moves driven by small flows, high spread risk |
| 2–10% | Normal — typical liquid mid-cap activity |
| 10–20% | Elevated — meaningful directional interest |
| >20% | High conviction active buying or selling — something is driving this specifically |

**Why it matters:** A token at $1.5B market cap doing $337M in 24h volume (22%) on a +5% day is not drifting up on macro beta — it is being actively bought. The same +5% move on $30M volume would be a different signal entirely: thin market, easily manipulated, less durable. High volume/mcap on an up day = real demand. Low volume/mcap on an up day = price being dragged up by sector beta without genuine buying behind it.

**Pairs trade application:** In a long/short spread (e.g. long AAVE / short MORPHO), volume divergence between the two legs is itself a signal. AAVE at 22% volume/mcap vs MORPHO at 1.6% on the same day means informed capital is actively choosing AAVE while MORPHO is passive. The thesis is being expressed in real flows, not just in the model.

---

## Funding Rate Divergence from Spot

A specific pattern worth naming: **price moves without funding catching up**.

The normal sequence: spot rises → longs open perp positions to lever up → funding goes positive. If spot rises substantially and funding remains flat or negative, the market is either (a) not believing the move is durable, or (b) structurally net short and being squeezed without choosing to go long. Both interpretations are bullish for continuation: the market is underpositioned for the move that has already happened.

**ETH example (April 12–14):** ETH moved from $2,188 → $2,356 (+7.7%) while Deribit ETH-PERPETUAL funding remained at -0.00142% per 8h (slightly negative). At this funding rate, shorts are paying longs. Despite the price recovery, no long crowding has formed — the market remains structurally unpositioned. The next leg up has the same (or better) starting conditions as the first.

**The squeeze setup:** When this pattern persists — sustained price strength + negative/flat funding — the eventual squeeze triggers when forced short covering begins. Shorts that have been paying funding for days are incentivised to close; closing shorts is mechanically buying; buying triggers more covering.

Watch for the moment funding crosses zero and begins rising: that is the transition from "unpositioned market recovering" to "longs entering and building crowding." The first phase has more asymmetric upside; the second phase has more vol and fragility.

---

## Live Data Sources

The operational endpoints for pulling this data in real time:

| Signal | Endpoint |
|---|---|
| ETH/BTC perp: OI, volume, funding | `deribit.com/api/v2/public/get_book_summary_by_instrument?instrument_name=ETH-PERPETUAL` |
| ETH/BTC funding history | `deribit.com/api/v2/public/get_funding_rate_history?instrument_name=ETH-PERPETUAL&start_timestamp=X&end_timestamp=Y` |
| Specific options contract: OI, volume, IV | `deribit.com/api/v2/public/get_book_summary_by_instrument?instrument_name=ETH-29MAY26-3200-C` |
| All ETH options (cross-strike OI) | `deribit.com/api/v2/public/get_book_summary_by_currency?currency=ETH&kind=option` |
| Token spot price, 24h volume, market cap | `api.coingecko.com/api/v3/simple/price?ids=[token]&vs_currencies=usd&include_24hr_vol=true&include_market_cap=true` |
| Liquidation heatmap | Coinglass (requires account) or Hyblock |

All Deribit endpoints are unauthenticated and public. Pull these directly during any research session rather than relying on secondary search summaries — funding rates and OI reported in TG channels or news are often hours stale.

---

## Related Frameworks
- [[07 - Volatility Regime Breaks]] — IV compression as the setup for a vol expansion trade
- [[11 - Complete Thesis Framework]] — derivatives positioning as the regime/timing input to a thesis
- [[13 - Risk Framework]] — derivatives positioning signals as pre-mortem inputs (is the market already positioned against me?)
- [[14 - Alpha Attribution Framework]] — separating alpha from a positioning squeeze versus genuine fundamental re-rating
- [[18 - Relative Value and Pairs Trading]] — derivatives used to hedge the short leg of a pairs trade
- [[23 - Market Participants and PvP vs PvE]] — funding rate and volume signals as retail vs institutional participation indicators
