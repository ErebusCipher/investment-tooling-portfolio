# Neoclouds Are the AI Cycle's Miners

## Scarcity, Reflexivity, and the Risk of Overcapacity

The cleanest analogy for neoclouds is not AWS. It is bitcoin mining.

Both businesses monetize a scarce physical input during a period when the market is convinced demand will compound faster than supply. Both convert energy, hardware access, site control, financing, and operational execution into exposure to a reflexive digital cycle. Both look like infrastructure when utilization is high and like leveraged commodity businesses when the cycle turns.

The difference is that bitcoin miners sell hashpower into a transparent commodity market. Neoclouds sell GPU compute into an opaque market where the buyer is often an AI lab, a hyperscaler, an enterprise customer, or a sovereign project with strategic rather than purely economic motives. That opacity is the opportunity and the risk.

The trade is not simply "AI needs compute, buy GPU clouds." That is now consensus. The harder question is where in the stack scarcity converts into durable margin, and where it becomes another capacity cycle wearing secular-growth language. Neoclouds sit directly inside that question.

## The Bull Case Is Real

The AI buildout has become the defining capex cycle of the decade. Hyperscalers are spending at a scale that would have looked absurd three years ago, and they are still capacity constrained.

Microsoft said in January 2026 that AI demand continued to exceed available capacity and that capacity constraints would persist through calendar 2026.[^1] Meta guided 2026 capital expenditures to $125-145 billion, driven mainly by AI infrastructure, servers, datacentres, and network equipment.[^2] Amazon and Google are on the same path. This is no longer a software cycle with incidental infrastructure needs. It is a physical buildout cycle where the bottleneck is atoms.

That matters because the hyperscalers cannot solve every bottleneck internally at once. They have balance sheets, distribution, and customer relationships, but they do not have infinite datacentre shells, power interconnects, transformers, networking gear, cooling capacity, HBM supply, or operational bandwidth. When model demand outruns internally available compute, external capacity becomes valuable.

That is the neocloud wedge.

CoreWeave is the clean public-market proof point. For 2025, the company reported $5.1 billion of revenue, up 168% year over year, and $66.8 billion of revenue backlog as of December 31, 2025.[^3] Those numbers do not prove durable economics, but they prove one thing conclusively: the market is willing to sign large, long-dated contracts for non-hyperscaler AI compute when supply is scarce.

This is why the bitcoin-miner analogy matters. Miners already owned the two inputs the AI cycle suddenly needed: power access and datacentre-adjacent real estate. Bitcoin mining trained operators to acquire cheap energy, manage high-density compute, optimize uptime, finance hardware against volatile digital demand, and survive cycles. Those capabilities are not identical to AI datacentre operation, but they are adjacent enough to make the pivot plausible.

Core Scientific's 2024 CoreWeave agreement was the moment the analogy became explicit: a bitcoin miner signed a long-term hosting arrangement to deliver hundreds of megawatts of high-performance compute infrastructure to an AI cloud customer.[^4] The market understood the implication quickly. A miner was no longer just a miner. It was a power-and-site option on the AI infrastructure cycle.

## Why Neoclouds Exist

The naive view is that hyperscalers should crush this market. They have cheaper capital, better customer relationships, proprietary chips, global infrastructure teams, and existing enterprise distribution. In the long run, that may be mostly true.

But the present market is not a long-run equilibrium. It is a scramble.

When a market is in scramble mode, second-best capacity clears. The buyer does not ask whether the compute provider has AWS's long-term margin profile. The buyer asks whether the provider can deliver the right GPUs, in the right cluster configuration, with enough networking, at the right location, under a contract that allows the next training run or enterprise deployment to happen now rather than in eighteen months.

That is why neoclouds can exist despite structurally weaker positions than hyperscalers. They are not necessarily better businesses. They are faster-moving capacity release valves during a shortage.

The shortage has multiple layers:

- GPU access: Nvidia allocation, forward purchase commitments, and hardware financing.
- Power: interconnect queues, grid constraints, behind-the-meter generation, and site selection.
- Datacentre shells: facilities that can be converted or built fast enough for accelerated compute.
- Thermal management: liquid cooling, power density, and operational expertise.
- Networking: InfiniBand, Ethernet, optical interconnect, and cluster reliability.
- Customer urgency: labs and enterprises whose timelines are set by competitive pressure, not by neat infrastructure planning.

Each layer creates a place for a neocloud to monetize speed. The business model is simple in outline: secure GPUs and power, build or lease high-density facilities, sign long-term contracts, finance against the contract base, and repeat before the shortage clears.

The harder part is that every line of that sentence contains a cycle risk.

## The Miner Pattern

Bitcoin mining has a familiar cycle.

First, a digital asset reprices upward. Then mining economics improve. Then miners raise capital, buy machines, sign power contracts, and expand hashpower. For a while, every added machine prints money because difficulty has not fully adjusted. Then supply catches up. Difficulty rises, hashprice compresses, weak balance sheets break, and the cycle consolidates into the operators with the best energy contracts and lowest leverage.

Neoclouds may follow a parallel pattern.

First, model demand reprices compute upward. Then GPU cloud economics improve. Then operators raise capital, buy GPUs, secure power, and sign long-term customer contracts. For a while, every rack is valuable because utilization is high and supply is scarce. Then capacity catches up. Hyperscalers bring internal clusters online. Labs optimize inference. Open-source models reduce the need for frontier-scale calls in some workloads. Enterprises discover which AI use cases actually produce ROI and which were pilot theatre. Pricing compresses. Weakly contracted, highly levered GPU clouds become stranded capacity.

The analogy is not perfect. Bitcoin miners sell into a mostly spot-like global hashpower market; neoclouds can lock customers into multi-year contracts. GPU clusters also have resale and redeployment options that ASIC miners often do not. But the economic shape is similar enough to be useful: scarce compute monetized through leveraged physical infrastructure, with capex committed before final demand is fully knowable.

The key investment question is therefore not "will AI demand grow?" It almost certainly will. The question is whether demand grows faster than dedicated AI compute capacity, at prices high enough to justify the leverage and depreciation embedded in the buildout.

## The Unit Economics Question

Neocloud bulls often talk as if backlog equals value. It does not.

Backlog is only valuable if the customer is creditworthy, the contract is enforceable, the delivery timeline is realistic, hardware procurement costs are controlled, utilization remains high, and the compute does not become obsolete faster than depreciation assumptions. A dollar of backlog attached to scarce H100/H200/GB200 capacity in a supply-constrained market is worth a lot. A dollar of backlog attached to late-delivered, high-cost capacity after the shortage clears is worth much less.

The hidden variable is residual value.

If a neocloud buys GPUs at peak scarcity pricing and finances them with debt or lease obligations, the asset must earn enough during its useful high-margin window to cover capital cost before pricing normalizes. That window may be long if AI demand remains explosive and supply bottlenecks persist. It may be shorter if model efficiency, inference specialization, custom ASICs, and hyperscaler internal builds reduce external GPU demand.

This is the same problem miners face with ASICs. The machine can be real, useful, and productive while still being a bad investment if purchased at the wrong point in the cycle.

## Where the Opportunity Actually Is

The best neocloud investments are unlikely to be generic GPU rental businesses. Generic GPU rental is where capital competition is most obvious and where hyperscalers have the clearest long-term advantage.

The more interesting opportunities sit where a provider has at least one non-replicable bottleneck:

1. **Power-first operators.** Companies controlling large, near-term power capacity in constrained regions. Power is harder to conjure than capital.

2. **Converted mining infrastructure.** Miners with real sites, grid access, and management teams capable of upgrading from mining to HPC. Many will fail because AI datacentres are not just bitcoin mines with better chips. The ones that can genuinely operate high-density, networked clusters have strategic option value.

3. **Specialized vertical compute.** Providers tuned for training, inference, fine-tuning, rendering, simulation, defense, or scientific workloads rather than undifferentiated GPU hours.

4. **Sovereign compute partners.** Operators that can satisfy local data, security, and geopolitical requirements for governments that do not want full dependence on US hyperscalers.

5. **Behind-the-meter energy integration.** Compute colocated with generation where grid access, curtailment, or stranded energy creates structural cost advantage.

6. **Software/orchestration layer.** Neoclouds that become more than hardware lessors by owning scheduling, model deployment, inference optimization, security, or compliance workflows.

The weakest version is a company that raises money to buy Nvidia chips at peak multiples, signs a few headline contracts, and calls itself AI infrastructure. That business may work for a while. It should not be underwritten as a secular compounder.

## What Would Invalidate the Trade

The neocloud thesis is falsifiable. The warning signs are specific.

First: capex digestion. If Microsoft, Amazon, Google, Meta, Oracle, and xAI start showing signs that internal capacity is catching up with demand, external GPU clouds lose pricing power quickly. The first signal will not be falling AI usage. It will be softer contract terms, lower prepayment rates, shorter duration commitments, or delayed expansion options.

Second: utilization slippage. A neocloud with high headline backlog but uneven cluster utilization is a levered asset owner with a storytelling problem. Utilization is the truth serum.

Third: GPU collateral weakness. If secondary-market GPU values fall faster than expected, financing becomes harder and residual-value assumptions break. That is the mining-equipment bust pattern.

Fourth: customer concentration. CoreWeave disclosed enormous customer concentration during its IPO process. That is understandable in an early shortage market, but it means the business can look better than it is if one or two customers are pulling forward demand. Durable infrastructure businesses should diversify over time.

Fifth: model efficiency shock. If inference cost per unit of useful output falls faster than workloads expand, the compute shortage can clear without AI adoption slowing. This is the most dangerous bear case because the technology can keep working while the infrastructure trade stops working.

Sixth: financing stress. Neoclouds are capital-intensive. If rates rise, equity markets close, or lenders haircut GPUs more aggressively, growth becomes self-limiting before demand disappears.

## The Portfolio View

The right way to own the theme is not to make a binary bet that every neocloud becomes AWS 2.0. Most will not.

The better portfolio construction is barbelled.

On one side: own the upstream bottlenecks with stronger structural positions - semicap equipment, foundries, memory, advanced packaging, networking, cooling, power equipment, grid infrastructure, and critical materials. These businesses sell into the buildout regardless of which cloud operator wins.

On the other side: selectively own the operators with real power/site advantage, contracted demand, credible customer diversification, and a path to survive post-shortage pricing. This is where the upside is higher, but the underwriting must look more like cyclicals and project finance than SaaS.

The crypto-native edge is useful here because crypto investors have already lived this pattern. They have seen infrastructure businesses priced as secular monopolies at the exact moment they were actually entering a capacity cycle. They have seen hardware scarcity turn into overbuild. They have seen debt-financed machines become stranded when the denominator changes. They have also seen the best operators survive the washout and acquire distressed assets at the bottom.

That memory is valuable if applied honestly.

## Conclusion

Neoclouds are real. The compute shortage is real. The hyperscaler capex cycle is real. The bitcoin-miner conversion opportunity is real. The mistake is treating all of that as proof of durable equity value.

The correct framing is narrower and more useful: neoclouds are the AI cycle's miners. They monetize physical scarcity during a reflexive digital buildout. The best operators will become strategically important infrastructure companies. The weak ones will become overlevered owners of depreciating GPUs bought at peak scarcity.

The trade works while three things are true: demand exceeds capacity, contracts lock in economics before supply normalizes, and operators control a bottleneck that capital alone cannot immediately replicate.

When those conditions stop being true, the story changes fast.

That does not make the theme unattractive. It makes it underwriteable. The job is to separate scarce infrastructure from rented narrative before the market does.

---

## Sources

[^1]: Microsoft FY2026 Q2 earnings materials and call commentary, January 2026: https://www.microsoft.com/en-us/Investor/earnings/FY-2026-Q2/press-release-webcast
[^2]: Meta Platforms Q1 2026 earnings release and 2026 capex guidance: https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-Reports-First-Quarter-2026-Results/
[^3]: CoreWeave FY2025 results, reporting $5.1B revenue and $66.8B revenue backlog: https://investors.coreweave.com/news/news-details/2026/CoreWeave-Reports-Strong-Fourth-Quarter-and-Fiscal-Year-2025-Results
[^4]: Core Scientific/CoreWeave HPC hosting agreement SEC filing, June 2024: https://investors.corescientific.com/sec-filings/all-sec-filings/content/0001628280-24-029900/0001628280-24-029900.pdf
