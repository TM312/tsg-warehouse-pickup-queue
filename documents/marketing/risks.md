# Risk Register

**Date:** March 19, 2026
**Purpose:** Identify, assess, and plan mitigations for risks that could impede the success of Warehouse Pickup Queue.

---

## 1. Risk Matrix

Risks plotted by likelihood (horizontal) and impact (vertical):

```
                        LIKELIHOOD
              Low            Medium           High
         ┌──────────────┬──────────────┬──────────────┐
         │              │              │              │
  High   │ R1: NetSuite │ R2: Generic  │              │
         │ builds native│ queue tool   │              │
         │ queue feature│ enters       │              │
         │              │ warehouse    │              │
         ├──────────────┼──────────────┼──────────────┤
         │              │              │              │
  Medium │ R3: Dock     │ R5: Price    │ R4: Slow     │
         │ scheduling   │ sensitivity  │ adoption in  │
I        │ tool adds    │ at $349/mo   │ traditional  │
M        │ customer     │              │ industries   │
P        │ queue        │ R8: Economic │              │
A        ├──────────────┼──────────────┼──────────────┤
C        │              │              │              │
T  Low   │              │ R6: New      │ R7: "Good    │
         │              │ startup      │ enough"      │
         │              │ enters niche │ manual       │
         │              │              │ processes    │
         │              │              │              │
         └──────────────┴──────────────┴──────────────┘
```

---

## 2. Detailed Risk Profiles

### R1: NetSuite Adds Native Queue Feature

| Attribute | Detail |
|-----------|--------|
| **Likelihood** | Low |
| **Impact** | High |
| **Description** | Oracle/NetSuite builds a native pickup queue module into NetSuite WMS or ships it as a first-party SuiteApp, eliminating the integration advantage. |
| **Early Warning Signs** | NetSuite job postings mentioning queue/pickup features; SuiteWorld roadmap previews; NetSuite acquiring a queue management company; beta features appearing in NetSuite release notes. |
| **Mitigation** | Build multi-ERP support (SAP Business One, Epicor, Acumatica) so NetSuite is one integration, not the only one. Deepen warehouse-specific features (gate operator console, processing workflows, customer-facing UX) far beyond what a native ERP module would offer. |
| **Contingency** | If NetSuite ships a basic queue feature, position as the "premium upgrade" — emphasize superior UX, real-time visibility, mobile gate console, and analytics that a native module won't match. Pursue co-selling with NetSuite consultants who need a better solution than the native offering. |

---

### R2: Generic Queue Tool Enters Warehouse Vertical

| Attribute | Detail |
|-----------|--------|
| **Likelihood** | Medium |
| **Impact** | High |
| **Description** | A well-funded queue management platform (Waitwhile, QLess, or Qminder/Verint) launches a warehouse-specific vertical, leveraging their existing customer base and brand recognition. |
| **Early Warning Signs** | Competitor blog posts about warehouse/logistics use cases; new warehouse-related features in their changelogs; job postings for warehouse domain expertise; case studies from warehouse customers. |
| **Mitigation** | Move fast on warehouse-specific features that generic tools can't easily replicate: NetSuite/ERP integration, gate operator console, processing state workflows, warehouse business hours management. Build deep domain expertise into the product. |
| **Contingency** | If a competitor enters, emphasize depth vs. breadth. Their warehouse vertical will be a thin adaptation of a general-purpose tool. Our product is purpose-built. Accelerate feature development on gate operations, multi-location management, and ERP-specific workflows. |

---

### R3: Dock Scheduling Tool Adds Customer Queue

| Attribute | Detail |
|-----------|--------|
| **Likelihood** | Low |
| **Impact** | Medium |
| **Description** | OpenDock, C3 Solutions, or GoRamp extends their dock scheduling platform to include a customer-facing queue feature, approaching our use case from the operations side. |
| **Early Warning Signs** | Dock scheduling vendors launching customer-facing portals; acquisition of a queue management company; product demos showing customer notification features. |
| **Mitigation** | Different buyer persona (we sell to ops managers focused on customer experience; dock tools sell to logistics managers focused on carrier scheduling). Stay relentlessly customer-experience focused — their DNA is operations/carrier management. |
| **Contingency** | If they build a customer queue, it will likely be an afterthought bolted onto a $6K–$15K/yr enterprise tool. Compete on price ($149–$349/mo), implementation speed (hours vs. weeks), and UX quality. |

---

### R4: Slow Adoption in Traditional Industries

| Attribute | Detail |
|-----------|--------|
| **Likelihood** | High |
| **Impact** | Medium |
| **Description** | Building materials, industrial supply, and manufacturing operations are notoriously slow to adopt new software. Sales cycles may be longer than expected, and churn higher due to abandonment after initial enthusiasm fades. |
| **Early Warning Signs** | Trial-to-paid conversion below 15%; sales cycles exceeding 60 days for Starter tier; high "implemented but not actively used" rates; prospects saying "let me talk to my team" and going dark. |
| **Mitigation** | Target tech-forward distributors first (companies already using NetSuite cloud, those with modern websites, those actively posting about operational improvements). Offer white-glove onboarding for first 90 days. Lead with ROI calculator to create urgency. Build a Playground demo that lets prospects experience value before committing. |
| **Contingency** | If adoption is slower than projected, extend free trial periods (30 days instead of 14), invest in customer success to drive activation, and consider a pilot program (90-day free in exchange for case study rights) to build social proof. |

---

### R5: Price Sensitivity at $349/mo

| Attribute | Detail |
|-----------|--------|
| **Likelihood** | Medium |
| **Impact** | Medium |
| **Description** | The Professional tier at $349/mo faces resistance from budget-conscious warehouse operations that compare against free/cheap generic queue tools ($49–$59/mo) or perceive the tool as "just a queue." |
| **Early Warning Signs** | Prospects consistently choosing Starter over Professional; frequent requests for discounts; competitive objections citing Waitwhile/ScanQueue pricing; trial users not upgrading when hitting Starter limits. |
| **Mitigation** | Frame pricing against labor cost, not against generic queue tools. At ~$17/hr warehouse labor, $349/mo equals ~1 hour of saved labor per day — ROI is self-evident. Offer 20% annual discount. Ensure the Professional tier has clear, visible value above Starter (NetSuite integration, unlimited gates, analytics). |
| **Contingency** | If price resistance is persistent, consider a $249/mo "Growth" tier between Starter and Professional to capture the mid-market. Alternatively, shift to per-gate pricing ($50–75/gate/mo) so cost scales with usage. |

---

### R6: New Startup Enters the Niche

| Attribute | Detail |
|-----------|--------|
| **Likelihood** | Medium |
| **Impact** | Low |
| **Description** | A new startup identifies the same whitespace opportunity and builds a competing warehouse pickup queue product, potentially with more funding or a different go-to-market approach. |
| **Early Warning Signs** | New products appearing in "warehouse queue" search results; YC/startup accelerator announcements in warehouse operations space; LinkedIn profiles of founders building similar products. |
| **Mitigation** | First-mover advantage matters in niche markets. Build deep customer relationships, accumulate case studies and testimonials, and establish presence in the NetSuite ecosystem before competitors can. Every month of head start compounds. |
| **Contingency** | If a well-funded competitor appears, double down on the NetSuite integration moat and customer relationships. Consider whether partnership or differentiation is the better response based on their approach. |

---

### R7: "Good Enough" Manual Processes

| Attribute | Detail |
|-----------|--------|
| **Likelihood** | High |
| **Impact** | Low |
| **Description** | Many warehouses have operated for decades with clipboards, radios, and whiteboards. The pain exists but isn't always perceived as solvable with software. The status quo is the biggest competitor. |
| **Early Warning Signs** | Low inbound interest despite marketing spend; prospects saying "we manage fine today"; low urgency in sales conversations; long decision timelines. |
| **Mitigation** | Create content that makes the pain visible: "How much time does your team spend answering 'where's my order?' calls?" calculators, before/after case studies, video testimonials from converted customers. The Playground demo is key — let them see the difference. |
| **Contingency** | If awareness is the bottleneck, invest in educational content marketing and SEO rather than direct sales. Build the category, not just the product. Partner with industry publications to publish thought leadership on warehouse customer experience. |

---

### R8: Economic Downturn

| Attribute | Detail |
|-----------|--------|
| **Likelihood** | Medium |
| **Impact** | Medium |
| **Description** | A recession or economic slowdown causes warehouses to freeze new software spending, extend sales cycles, and increase churn as companies cut costs. |
| **Early Warning Signs** | Rising warehouse vacancy rates; declining wholesale distribution revenue; increased price sensitivity in sales conversations; longer approval chains for purchases. |
| **Mitigation** | Position as a cost-reduction tool, not a new expense. Frame around labor efficiency: "Do more pickups with the same headcount." The $149/mo Starter tier is low enough to survive most budget cuts. Offer flexible monthly billing (no annual lock-in during uncertain times). |
| **Contingency** | If a downturn hits, shift messaging entirely to ROI and efficiency. Consider a limited free tier to maintain pipeline. Reduce burn rate and extend runway. Focus on retaining existing customers rather than aggressive acquisition. |

---

## 3. Competitive Response Scenarios

### Scenario A: Waitwhile Launches "Waitwhile for Warehouses"

**Trigger:** Waitwhile (or similar) announces a warehouse vertical with dock/gate features.

**Response playbook:**
1. **Week 1:** Analyze their offering — what features do they actually have vs. what's announced?
2. **Week 1–2:** Publish a competitive comparison showing warehouse-specific capabilities they lack (NetSuite integration, gate operator console, processing workflows, order validation).
3. **Week 2–4:** Accelerate outreach to prospects in pipeline — create urgency around choosing the purpose-built solution.
4. **Ongoing:** Deepen ERP integrations and warehouse-specific features faster than they can adapt a generic platform.

### Scenario B: NetSuite Ships a Queue Module

**Trigger:** NetSuite announces native pickup queue functionality at SuiteWorld or in a release update.

**Response playbook:**
1. **Immediate:** Assess scope — is it a basic feature or a full solution? NetSuite's first version will likely be minimal.
2. **Week 1–2:** Position as "NetSuite Queue, but better" — emphasize mobile UX, real-time customer visibility, gate operator console, and analytics that the native module won't offer.
3. **Month 1:** Accelerate multi-ERP support (SAP Business One, Epicor, Acumatica) to reduce NetSuite dependency.
4. **Ongoing:** Court NetSuite consultants and implementation partners who will prefer recommending a superior third-party tool over a basic native feature.

### Scenario C: Well-Funded Startup Appears

**Trigger:** A new company with $5M+ in funding announces a warehouse pickup queue product.

**Response playbook:**
1. **Immediate:** Assess their approach — are they targeting the same segment (NetSuite distributors) or a different one?
2. **Week 1–4:** Lock in existing customers with annual contracts and expanded feature rollouts. Accelerate case study production.
3. **Ongoing:** Compete on product depth, customer relationships, and ecosystem presence. First-mover advantage in a niche market is significant — they'll need to prove why switching is worth it.

---

## 4. Market Timing Risks

### Are We Too Early?

**Risk:** The warehouse industry isn't ready for this level of digitization. Adoption requires more market education than expected, burning cash before revenue materializes.

**Indicators:** Trial sign-ups are strong but conversion is weak; prospects say "interesting but not now"; sales cycles exceed 90 days consistently.

**Response:** Extend runway, shift to content marketing and category creation, offer extended pilots, and wait for the market to catch up. The underlying trends (BOPIS normalization, labor pressure, cloud adoption) are real — the question is timing, not direction.

### Are We Too Late?

**Risk:** A competitor we haven't identified has already captured the early adopters, or manual processes have become so entrenched that disruption requires more force than a startup can muster.

**Indicators:** Prospects mention an existing tool we don't know about; multiple facilities already using a competing solution; low search volume for relevant keywords.

**Response:** Differentiate aggressively on NetSuite integration and customer UX. If a competitor has first-mover advantage, compete on a specific sub-segment (e.g., building materials distributors on NetSuite) rather than the broad market.

### Economic Cycle Timing

**Risk:** Launching during an economic contraction when warehouses are cutting costs rather than adding tools.

**Indicators:** Warehouse construction slowing; wholesale distribution revenue declining; rising interest rates impacting capital expenditure.

**Response:** Lean into the efficiency narrative. During downturns, tools that demonstrably save labor hours are easier to justify than growth-oriented software. Adjust pricing and packaging to lower the barrier to entry.

---

## 5. Operational Risks

### NetSuite Integration Dependency

**Risk:** Heavy reliance on NetSuite's API and ecosystem. API changes, rate limits, or partnership terms could disrupt core functionality.

**Mitigation:** Abstract the ERP integration layer so that NetSuite is one connector among many. Build direct value (queue management, gate operations, customer UX) that works even without ERP integration. Monitor NetSuite API changelog and maintain a buffer for deprecation timelines.

### Technical Scaling

**Risk:** Real-time WebSocket connections and Supabase Realtime may face performance challenges as customer count grows. A busy warehouse with 20 gates and 200 concurrent users creates significant real-time traffic.

**Mitigation:** Load test early. Monitor Supabase connection limits. Design the architecture so that Supabase can be replaced with a self-hosted Postgres + WebSocket layer if needed. Keep the real-time surface area minimal (only subscribe to what's needed per view).

### Support Capacity

**Risk:** Warehouse operations run 12–16 hours/day, often starting at 5–6 AM. Support expectations may exceed what a small team can deliver, especially during go-live periods at new customers.

**Mitigation:** Invest in self-service onboarding (the Playground demo helps here). Build comprehensive in-app help. Offer white-glove onboarding only for Professional and Enterprise tiers. Set clear SLA expectations by tier.

### Single-Point-of-Failure: Supabase

**Risk:** Supabase outage takes down the entire product — both staff dashboard and customer-facing queue.

**Mitigation:** Monitor Supabase status proactively. Design graceful degradation (cached queue state, offline mode for gate operators). Evaluate whether critical path components should be self-hosted as the customer base grows.

---

## 6. Risk Monitoring Cadence

### Monthly Review (First Tuesday of Each Month)

- Review all risk ratings (likelihood and impact) — have any changed?
- Check competitive landscape — new entrants, competitor feature announcements, pricing changes
- Review sales pipeline for early warning signs (conversion rates, objection patterns, cycle length trends)
- Update mitigation strategies based on new information

### Quarterly Deep Dive

- Full competitive analysis refresh (pricing, features, positioning, reviews)
- Customer churn analysis — are any risks materializing as churn drivers?
- Market sizing update — any new data on warehouse counts, industry trends, adjacent market growth?
- Reassess SOM projections based on actual pipeline and conversion data

### Escalation Triggers (Immediate Review)

| Trigger | Action |
|---------|--------|
| Competitor announces warehouse-specific features | Activate competitive response playbook (Section 3) |
| NetSuite announces queue-related functionality | Activate Scenario B response |
| Trial-to-paid conversion drops below 10% | Review pricing, onboarding, and product-market fit |
| Monthly churn exceeds 5% | Root cause analysis; customer interviews |
| New funded competitor appears | Assess threat level; consider accelerating roadmap |
| Economic indicators turn negative | Shift messaging to ROI/efficiency; review pricing flexibility |

---

## 7. Risk Summary

| # | Risk | Likelihood | Impact | Priority | Key Mitigation |
|---|------|-----------|--------|----------|----------------|
| R1 | NetSuite builds native queue | Low | High | **High** | Multi-ERP support; deeper feature set |
| R2 | Generic queue tool enters warehouse | Medium | High | **High** | Move fast on warehouse-specific features |
| R3 | Dock scheduling adds customer queue | Low | Medium | Medium | Stay customer-experience focused |
| R4 | Slow adoption in traditional industries | High | Medium | **High** | Target tech-forward first; white-glove onboarding |
| R5 | Price sensitivity at $349/mo | Medium | Medium | Medium | ROI framing; annual discounts |
| R6 | New startup enters niche | Medium | Low | Low | First-mover advantage; ecosystem presence |
| R7 | "Good enough" manual processes | High | Low | Medium | ROI calculators; Playground demo; case studies |
| R8 | Economic downturn | Medium | Medium | Medium | Position as cost-reduction tool |

**Top 3 risks to watch:** R1 (NetSuite native), R2 (generic queue enters warehouse), and R4 (slow adoption). These have the highest combination of likelihood and impact and require active, ongoing mitigation.
