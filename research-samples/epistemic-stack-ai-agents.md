# The Epistemic Stack: Open Problems in Trust Infrastructure

---

the founder's recent essays outline a thesis: AI is creating a triple crisis—intelligence scarcity, curation collapse, and trust vacuum—and the protocol is infrastructure for the latter two. But theses invite challenges. This thread is for stress-testing the ideas.

---

## The Claims (Steel-Manned)

**1. Curation is the new scarcity.**
Content generation costs → 0. Discovery remains medieval. The bottleneck shifts from "what exists" to "what deserves attention." Whoever controls surfacing controls reality.

**2. Stake is the last honest signal.**
When AI can generate infinite fake reviews, fake engagement, fake consensus—economic commitment becomes the only signal that's expensive to fake. Skin in the game as epistemic primitive.

**3. Decentralization is epistemologically necessary.**
Centralized reputation = single point of epistemic failure. Robust knowledge requires multiple independent sources, cross-validated, where no single observer can corrupt the whole.

**4. The trust stack is unsolved.**
Agents → MCP Servers → Tools → Data Sources. Each layer needs identity and reputation. We have none of these as it stands. And the window is closing.

---

## The Open Problems

### 1. The Plutocracy Problem (Revisited)

the founder argues: "Rich people already control curation invisibly. the protocol makes it legible."

But legibility isn't neutrality. A whale with $10M can still stake more than 10,000 people with $1K each. Yes, their judgment becomes visible. Yes, bad judgment eventually costs them. But "eventually" might be long enough to manipulate outcomes that matter.

**Question:** Is stake-weighted curation just plutocracy with extra steps? What mechanisms actually prevent capital concentration from dominating signal?

*Possible directions:*
- Quadratic staking (square root of stake = influence)
- Reputation-weighted stake (track record multiplier)
- Time-weighted conviction (longer hold = more weight)
- Social graph weighting (trusted sources count more)

What's the right design? What are we missing?

---

### 2. The Cold Start Problem

Reputation systems need history. New entities have none. This creates a bootstrapping paradox:

- New MCP servers can't get trusted without reputation
- They can't build reputation without being trusted
- Early movers accumulate permanent advantage
- Innovation gets penalized

**Question:** How do you bootstrap trust for new entities without recreating the incumbent advantages we're trying to escape?

*Possible directions:*
- Inheritance from known developers/organizations
- Provisional trust with higher monitoring
- Staking bonds that new entities post as collateral
- Reputation escrow from established vouchers

---

### 3. The Context Collapse Problem

the founder writes: "An MCP server that's trustworthy for calendar queries isn't necessarily trustworthy for financial transactions."

But current reputation systems collapse context. A five-star rating doesn't tell you *what* it's five stars for. Even domain-specific reputation (e.g., "trusted for security auditing") might not capture the granularity needed.

**Question:** How granular does contextual reputation need to be? How do you query "trusted for X in context Y at stake level Z" without the complexity becoming unusable?

---

### 4. The Sybil Problem for Agents

When agents can be spun up cheaply, traditional sybil resistance breaks. Proof-of-personhood doesn't apply. Proof-of-stake helps but doesn't prevent well-funded attackers from creating fleets.

**Question:** What does sybil resistance look like for autonomous agents? Is identity even the right frame, or do we need something else entirely?

---

### 5. The Recursive Trust Problem

"Show me all MCP servers vouched for by entities I trust" sounds clean. But:

- What if your trusted entities are wrong?
- What if trust networks become echo chambers?
- What if sophisticated attackers build long reputations before striking?

Trust graphs can have failure modes that flat ratings don't. They can also propagate errors through networks.

**Question:** How do you build trust traversal that's robust to both isolated bad actors AND coordinated long-game attacks?

---

### 6. The Oracle Problem for Curation

Prediction markets have resolution—the event happens or it doesn't. Curation markets don't. "Is this valuable?" has no external oracle.

the founder addresses this: "There's no oracle that resolves 'valuable.' ... These are subjective, context-dependent, continuous assessments."

But if there's no resolution, what prevents curation markets from becoming pure speculation disconnected from actual value? What makes stake accumulation meaningful rather than just a popularity contest with money?

**Question:** Without external resolution, what mechanisms keep curation markets grounded in actual quality rather than reflexive speculation?

---

### 7. The Speed Problem

Agents operate in milliseconds. Human curation operates in hours or days. If an MCP server needs to query reputation before executing, and reputation is built from human observation...

**Question:** Can human-generated reputation signals operate at agent speed? Or do we need agent-generated reputation—and if so, how do we trust the agents doing the evaluating?

---

## The Meta-Question

All of the above assumes stake-weighted data networks are the right primitive.

**What if they're not?**

What alternative architectures for trust infrastructure should we be considering? What are the blind spots in the current approach?

---

## The Invitation

This isn't a FAQ. It's a research agenda.

If you've thought about mechanism design, epistemic security, identity systems, or agent architectures—these problems need your attention.

What breaks? What holds? What are we not seeing?

---

## Source Material

- [AI Credit Wars](https://x.com/0xbilly/status/2015557459922817299) - Jan 25, 2026
- [InfoFi Is Dead. Long live InfoFi.](https://x.com/0xbilly/status/2015786427666022523) - Jan 26, 2026
- [We're Giving AI the Keys Before We've Built the Locks](https://x.com/0xbilly/status/2016149992826716241) - Jan 27, 2026
