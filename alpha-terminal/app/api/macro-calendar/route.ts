import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// 2026 macro event schedule — publicly announced dates
// FOMC: Jan 29, Mar 19, May 7, Jun 18, Jul 30, Sep 17, Oct 29, Dec 10
// CPI: ~10th of each month (for prior month data)
// NFP: first Friday of each month
// Note: dates are approximate for CPI/NFP — update when BLS announces exact dates

const MACRO_2026 = [
  // FOMC
  {
    id: "fomc-jan", date: "2026-01-29", name: "FOMC Decision (Jan)", type: "Macro", source: "macro",
    description: "Federal Open Market Committee rate decision. Fed funds rate announcement + press conference.",
    likelyReaction: "Status quo = muted reaction. Hawkish surprise → risk-off, USD up, equities/crypto down. Dovish surprise → risk-on, USD down, equities/crypto up.",
    contrarianReaction: "If priced as hawkish but language is cautious → buy the dip in risk assets.",
    preTrade: "Reduce leverage 48h before. BTC often sells off into FOMC then recovers.",
    tradeDuring: "Watch first 30 min for direction. Don't chase the initial spike.",
    exitCondition: "Exit tactical FOMC trade within 24h — event-driven, not thesis.",
    riskCase: "Surprise rate move (unlikely but possible). Stagflation language crushes equities and crypto simultaneously.",
  },
  {
    id: "fomc-mar", date: "2026-03-19", name: "FOMC Decision (Mar)", type: "Macro", source: "macro",
    description: "FOMC rate decision + updated dot plot projections.",
    likelyReaction: "Dot plot matters more than rate decision. Fewer cuts → risk-off. More cuts → risk-on.",
    contrarianReaction: "If dot plot is hawkish but economic data deteriorates → bond rally, eventually equities follow.",
    preTrade: "Reduce leverage. Watch 2Y yield for front-running.",
    tradeDuring: "Dot plot release = initial volatility. Press conference often reverses initial move.",
    exitCondition: "24h hold max for event trade.",
    riskCase: "Simultaneous inflation + slowdown data → stagflation pricing. Worst case for all risk assets.",
  },
  {
    id: "fomc-may", date: "2026-05-07", name: "FOMC Decision (May)", type: "Macro", source: "macro",
    description: "FOMC rate decision — no dot plot this meeting.",
    likelyReaction: "Without dot plot, market reaction is more muted. Statement language drives short-term move.",
    contrarianReaction: "Low-volatility FOMC = good entry point for risk-on positioning after.",
    preTrade: "Lower impact meeting — maintain positions.",
    tradeDuring: "Watch the statement for changes in key phrases (e.g. 'patient', 'data dependent').",
    exitCondition: "N/A for low-impact meeting.",
    riskCase: "Surprise hawkish pivot catches market off-guard.",
  },
  {
    id: "fomc-jun", date: "2026-06-18", name: "FOMC Decision (Jun)", type: "Macro", source: "macro",
    description: "FOMC rate decision + dot plot + quarterly economic projections.",
    likelyReaction: "Major meeting — high impact. Dot plot revision is key signal for H2 2026.",
    contrarianReaction: "If cuts are priced and don't happen → sharp selloff then stabilisation.",
    preTrade: "Reduce risk into meeting. Key positioning event for H2.",
    tradeDuring: "Same as March — dot plot then press conference.",
    exitCondition: "Re-size risk based on H2 rate path implied by dot plot.",
    riskCase: "Upward revision to inflation forecasts → structural repricing of all duration assets.",
  },
  {
    id: "fomc-jul", date: "2026-07-30", name: "FOMC Decision (Jul)", type: "Macro", source: "macro",
    description: "FOMC rate decision — no dot plot.",
    likelyReaction: "Lower impact meeting. Statement wording shift is main signal.",
    contrarianReaction: "Summer liquidity = exaggerated short-term moves in thin markets.",
    preTrade: "Standard 48h pre-FOMC caution.",
    tradeDuring: "Watch USD and 10Y yield for direction.",
    exitCondition: "Event-driven only — exit within 24h.",
    riskCase: "Geopolitical shock coinciding with FOMC amplifies volatility.",
  },
  {
    id: "fomc-sep", date: "2026-09-17", name: "FOMC Decision (Sep)", type: "Macro", source: "macro",
    description: "FOMC rate decision + dot plot. Key pre-election meeting.",
    likelyReaction: "September historically volatile. Dot plot for year-end rate path is major catalyst.",
    contrarianReaction: "If September cut is priced and delayed → sharp USD rally, emerging markets (EWJ, EWY, EWZ) sell off.",
    preTrade: "Reduce EM equity exposure 1 week before if cut is not fully priced.",
    tradeDuring: "EM currencies will be most reactive — proxy for your Asian positions.",
    exitCondition: "Re-enter EM on any dovish surprise.",
    riskCase: "Rate cut into inflation resurgence → stagflation, worst case for portfolio.",
  },
  {
    id: "fomc-oct", date: "2026-10-29", name: "FOMC Decision (Oct)", type: "Macro", source: "macro",
    description: "FOMC rate decision — no dot plot. Pre-election timing.",
    likelyReaction: "Low impact — Fed unlikely to move aggressively ahead of election.",
    contrarianReaction: "If nothing happens, focus shifts to election positioning.",
    preTrade: "Low impact — maintain positions.",
    tradeDuring: "Watch political headlines more than Fed.",
    exitCondition: "N/A.",
    riskCase: "Surprise move ahead of election = major credibility and market shock.",
  },
  {
    id: "fomc-dec", date: "2026-12-10", name: "FOMC Decision (Dec)", type: "Macro", source: "macro",
    description: "Final FOMC of 2026 + dot plot. Sets tone for 2027.",
    likelyReaction: "Year-end rate path projection is primary market mover. Potential year-end repositioning.",
    contrarianReaction: "December cuts historically priced in early — actual cut = sell the news.",
    preTrade: "Begin year-end portfolio review 2 weeks prior.",
    tradeDuring: "Watch 2027 dot plot positioning for early 2027 trade setup.",
    exitCondition: "Exit FOMC trade quickly — year-end liquidity is thin.",
    riskCase: "Hawkish pivot for 2027 into new year → sharp repricing of risk assets in January.",
  },
  // CPI prints (approx 10th of each month, for prior month data)
  {
    id: "cpi-jan", date: "2026-01-14", name: "CPI (Dec 2025)", type: "Macro", source: "macro",
    description: "US Consumer Price Index for December 2025. First major inflation print of 2026.",
    likelyReaction: "Hot print → USD up, risk-off, crypto down. Cool print → risk-on, BTC up.",
    contrarianReaction: "If CPI is hot but core is cool, initial selloff may reverse.",
    preTrade: "Check options market for implied move. Reduce leverage 24h before.",
    tradeDuring: "First 15 min = noise. Wait for dust to settle before trading direction.",
    exitCondition: "Event-driven — 4h hold max.",
    riskCase: "Re-acceleration of inflation → full repricing of rate cuts → risk-off for months.",
  },
  {
    id: "cpi-feb", date: "2026-02-11", name: "CPI (Jan 2026)", type: "Macro", source: "macro",
    description: "US CPI for January 2026. January CPI historically elevated due to seasonal effects.",
    likelyReaction: "January CPI often hot due to price resets. Market may discount it.",
    contrarianReaction: "If hot January CPI dismissed as seasonal → strong setup for February risk-on.",
    preTrade: "Don't overreact to hot January print — check core vs headline split.",
    tradeDuring: "Core CPI is more important than headline for Fed reaction.",
    exitCondition: "4h.",
    riskCase: "Hot January + upward revision to December = confirmed re-acceleration.",
  },
  {
    id: "cpi-mar", date: "2026-03-11", name: "CPI (Feb 2026)", type: "Macro", source: "macro",
    description: "US CPI for February 2026. Key data point ahead of March FOMC.",
    likelyReaction: "Fed will reference this print directly at March FOMC. High market sensitivity.",
    contrarianReaction: "Consensus expectation of cooling = if hot, violent reaction.",
    preTrade: "Reduce leverage 24h before. This print matters more than usual given March FOMC proximity.",
    tradeDuring: "Immediate FOMC repricing across rates and equities.",
    exitCondition: "Hold directional trade into FOMC if print confirms a rate path.",
    riskCase: "Hot print forces hawkish repricing going into March FOMC — bad for EM and growth assets.",
  },
  {
    id: "cpi-apr", date: "2026-04-10", name: "CPI (Mar 2026)", type: "Macro", source: "macro",
    description: "US CPI for March 2026.",
    likelyReaction: "Standard reaction — cool print extends risk-on, hot print extends risk-off.",
    contrarianReaction: "If market is in risk-on mode, hot CPI creates asymmetric downside.",
    preTrade: "Standard 24h caution.",
    tradeDuring: "Core services ex-shelter is the number to watch.",
    exitCondition: "4h.",
    riskCase: "Unexpected spike in energy prices feeds into headline — commodity thesis plays both ways.",
  },
  {
    id: "cpi-jun", date: "2026-06-10", name: "CPI (May 2026)", type: "Macro", source: "macro",
    description: "US CPI ahead of June FOMC — extremely high importance.",
    likelyReaction: "Directly influences June dot plot projections.",
    contrarianReaction: "If cool, dovish FOMC pricing accelerates dramatically.",
    preTrade: "Maximum caution — this print + June FOMC = 2-week risk event.",
    tradeDuring: "Hold positions for June FOMC direction, don't over-trade the CPI print in isolation.",
    exitCondition: "Reassess after June FOMC.",
    riskCase: "Hot CPI → hawkish dot plot → EM selloff → your Asian positions suffer.",
  },
  // NFP (approx first Friday each month)
  {
    id: "nfp-jan", date: "2026-01-09", name: "NFP (Dec 2025)", type: "Macro", source: "macro",
    description: "US Non-Farm Payrolls for December 2025. First major jobs print of 2026.",
    likelyReaction: "Strong jobs = hawkish pressure on Fed. Weak jobs = dovish, risk-on.",
    contrarianReaction: "Strong jobs + cooling wages = good outcome (soft landing). Risk-on.",
    preTrade: "Standard 24h caution. Check ADP employment earlier in week as preview.",
    tradeDuring: "Wage growth (average hourly earnings) matters as much as headline print.",
    exitCondition: "Event-driven — 4h.",
    riskCase: "Very strong print forces Fed to hold rates longer → growth assets underperform.",
  },
  {
    id: "nfp-feb", date: "2026-02-06", name: "NFP (Jan 2026)", type: "Macro", source: "macro",
    description: "US Non-Farm Payrolls for January 2026. January prints are often revised significantly.",
    likelyReaction: "January seasonal adjustments make the print volatile — market knows this.",
    contrarianReaction: "Weak January print (seasonal) = buy opportunity if revisions tend upward.",
    preTrade: "Lower conviction on January NFP trades — wait for revision.",
    tradeDuring: "Note prior month revision — sometimes more important than current print.",
    exitCondition: "4h. Lower conviction trade.",
    riskCase: "Downward revision to December + weak January = genuine slowdown signal.",
  },
  {
    id: "nfp-mar", date: "2026-03-06", name: "NFP (Feb 2026)", type: "Macro", source: "macro",
    description: "US Non-Farm Payrolls ahead of March FOMC.",
    likelyReaction: "Strong influence on March FOMC positioning alongside February CPI.",
    contrarianReaction: "Weak jobs + cool CPI = maximum dovish setup → risk-on into FOMC.",
    preTrade: "This print and March CPI together set the FOMC narrative — watch both.",
    tradeDuring: "Direction reinforced or contradicted by CPI print 5 days later.",
    exitCondition: "Hold view into FOMC if data is consistent.",
    riskCase: "Contradictory signals (weak jobs + hot inflation) = stagflation fear.",
  },
];

export async function GET() {
  return NextResponse.json(MACRO_2026);
}
