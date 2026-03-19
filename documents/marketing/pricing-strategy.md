# Pricing Strategy

**Date:** March 19, 2026
**Purpose:** Define the pricing model, tier structure, and ROI framework for Warehouse Pickup Queue.

---

## 1. Competitor Pricing Benchmarks

| Product | Category | Pricing Model | Monthly Cost | Free Tier | Notes |
|---------|----------|--------------|-------------|-----------|-------|
| ScanQueue | Queue mgmt | Per location | $99–249/mo | Yes (generous) | SMS add-on $0.10–0.12/msg; voice add-on $129–349/mo |
| NextMe | Queue mgmt | Per location | Free–custom | Yes (1 location) | No annual contracts; restaurant-focused |
| Waitwhile | Queue mgmt | Per location | $59+/mo | Yes (100 visits/mo) | SMS per message; scales quickly past free tier |
| QLess | Queue mgmt | Per user | ~$60/user/mo | No | Custom quotes; enterprise-focused; bankruptcy filed 2024 |
| Qminder | Queue mgmt | Per location | ~$429/mo | No | Acquired by Verint; enterprise CX platform |
| OpenDock | Dock sched | Per facility/yr | ~$500/mo ($6K/yr) | No | Unlimited users/doors; enterprise packages |
| C3 Solutions | Dock sched | Usage-based/yr | ~$1,250/mo ($15K/yr) | No | Enterprise; usage-based |

Sources: [ScanQueue](https://scanqueue.com/pricing), [Capterra — Waitwhile](https://www.capterra.com/p/152494/Waitwhile/), [GetApp — QLess](https://www.getapp.com/customer-management-software/a/qless/), [G2 — OpenDock](https://www.g2.com/products/opendock/pricing), [ScanQueue Pricing Comparison](https://scanqueue.com/blog/queue-management-pricing-comparison)

### Key Observations

1. **Generic queue tools cluster at $49–99/mo** — commodity pricing for retail/service use cases
2. **Dock scheduling tools command $500–1,250/mo** — operations-critical, enterprise-sold
3. **No one prices for warehouse pickup specifically** — an opportunity to define the category's price anchor
4. **Per-location is the dominant model** for queue tools; per-facility/year for dock tools

---

## 2. Recommended Tier Structure

| Tier | Price | Target Customer | Includes |
|------|-------|----------------|----------|
| **Starter** | **$149/mo** | Single location, ≤3 gates, ≤50 pickups/day | Customer queue app, QR code check-in, real-time queue visibility, basic dashboard, 1 staff seat, email support |
| **Professional** | **$349/mo** | Single location, ≤10 gates, unlimited pickups | Everything in Starter + gate operator console, NetSuite integration, analytics dashboard, drag-and-drop queue management, business hours management, 5 staff seats, priority support |
| **Enterprise** | **Custom ($800+/mo)** | Multi-location, custom integrations | Everything in Professional + multi-warehouse management, SSO, API access, custom ERP integrations, SLA, dedicated success manager, unlimited staff seats |

### Pricing Rationale

**Why $149/mo for Starter (not $49–99):**
- We are not a generic queue tool. The $49–99 range signals "commodity queue management" — competing with Waitwhile and ScanQueue on price devalues the warehouse-specific value.
- $149/mo positions us as a specialized operational tool, above generic alternatives but well below dock scheduling software.
- At ~$7/business day, even a small warehouse with 20 pickups/day gets significant value.

**Why $349/mo for Professional:**
- This is the anchor tier — where the majority of revenue should come from.
- $349/mo ≈ **1 hour of warehouse labor per day** at average rates (~$21/hr × 22 business days = $462/mo). Saving even 45 minutes of daily coordination time makes the ROI self-evident.
- NetSuite integration is gated to Professional, creating a strong upgrade incentive for the primary target segment.
- Positioned between Qminder (~$429/mo) and generic tools ($49–99/mo) — premium but not enterprise.

**Why $800+/mo for Enterprise:**
- Multi-location warehouses and distribution networks represent significant expansion revenue.
- Custom pricing allows flexibility for large deals (10+ locations, custom integrations).
- SSO and SLA requirements signal enterprise readiness without over-investing in enterprise features early.

---

## 3. Pricing Model Analysis

| Model | Pros | Cons | Verdict |
|-------|------|------|---------|
| **Per location** (our current model) | Simple to understand; aligns with how warehouses think; predictable revenue | Doesn't capture value from high-volume locations; large locations pay the same as small ones | **Recommended for Starter/Professional** |
| **Per gate** ($50–75/gate/mo) | Scales with usage; captures more value from larger operations | Harder to predict monthly cost; may discourage adding gates | Consider as Enterprise pricing lever |
| **Per user/seat** ($30–50/user/mo) | Scales with team size; familiar SaaS model | Discourages adoption (managers limit seats to save money); doesn't reflect value delivered | Not recommended |
| **Per pickup** ($0.50–1.00/pickup) | Pure usage-based; aligns with value delivered | Unpredictable costs for customer; hard to budget; creates billing complexity | Not recommended |
| **Hybrid (base + per gate)** ($99 base + $50/gate) | Captures value at scale; flexible | Complex pricing; harder to communicate | Consider for v2 pricing if per-location feels limiting |

**Recommendation:** Per-location pricing for Starter and Professional tiers. Simple, predictable, easy to communicate. For Enterprise, consider hybrid pricing (base fee + per-location or per-gate) to capture value from multi-site deployments.

---

## 4. Free Trial vs. Freemium Analysis

### Industry Benchmarks

| Model | Avg Conversion Rate | Best-in-Class | Source |
|-------|-------------------|---------------|--------|
| Free trial (no card) | 15–25% | 30%+ | [First Page Sage](https://firstpagesage.com/seo-blog/saas-free-trial-conversion-rate-benchmarks/) |
| Free trial (card required) | 30–60% | 60%+ | [Lenny's Newsletter](https://www.lennysnewsletter.com/p/what-is-a-good-free-to-paid-conversion) |
| Freemium | 2–5% | 6–8% | [First Page Sage](https://firstpagesage.com/seo-blog/saas-freemium-conversion-rates/) |
| PLG median (all B2B) | ~9% | 24%+ | [ProductLed](https://productled.com/blog/product-led-growth-benchmarks) |

### Recommendation: 14-Day Free Trial of Professional Tier (No Card Required)

| Factor | Free Trial (our choice) | Freemium |
|--------|------------------------|----------|
| **Conversion rate** | 15–25% (5–10x higher) | 2–5% |
| **Revenue impact** | Faster path to revenue | Slow drip; requires massive volume |
| **Sales signal** | Strong intent — they're evaluating now | Weak — many park on free forever |
| **Target market fit** | B2B buyers expect trials, not free tiers | B2B ops managers won't "play around" on a free tier — they need to evaluate for a real decision |
| **Support cost** | Manageable (time-bounded) | Unmanageable (perpetual free users consume support without converting) |
| **Competitive positioning** | Communicates premium product | Communicates commodity (competing with ScanQueue's free tier) |

**Why 14 days:** B2B evaluation cycles are fast at this price point. The key activation metric is processing the first real pickup — if that happens in week 1, the customer is highly likely to convert. 14 days provides enough time for 1 week of setup + 1 week of real usage.

**Trial experience:** Trial the Professional tier (not Starter) so prospects experience the full value — NetSuite integration, gate operator console, analytics. Downgrade to Starter or convert to paid Professional at trial end.

---

## 5. Annual Discount & Expansion Revenue Strategy

### Annual Discount

| Billing | Monthly Cost (Pro) | Annual Cost | Savings | Our Revenue Benefit |
|---------|--------------------|-------------|---------|---------------------|
| Monthly | $349/mo | $4,188/yr | — | Lower commitment |
| Annual | $279/mo | $3,348/yr | **20% ($840/yr)** | Cash upfront; reduced churn |

**Recommendation:** Offer 20% discount for annual billing. This is standard B2B SaaS practice and:
- Reduces monthly churn (annual contracts have ~50% lower churn than monthly)
- Improves cash flow predictability
- Creates a natural expansion conversation at renewal time

### Expansion Revenue Levers

| Lever | Mechanism | Expected Impact |
|-------|-----------|-----------------|
| **Tier upgrade** (Starter → Professional) | Customer hits gate limit or wants NetSuite integration | +$200/mo per customer |
| **Multi-location expansion** | Customer adds additional warehouses/branches | +$349/mo per location |
| **Seat expansion** | Team grows beyond included seats ($25/seat/mo add-on) | +$25–100/mo per customer |
| **Enterprise upgrade** | Customer needs SSO, API, SLA, custom integrations | +$450+/mo per customer |

**Net revenue retention target:** 110–120% annually. The primary expansion path is multi-location: once a distributor proves the tool at one branch, they'll roll it out to others.

---

## 6. ROI Framework

### The Core ROI Argument

> **$349/mo saves at least 1 hour of warehouse labor per day.**

### Warehouse Labor Cost Data

| Role | Avg Hourly Rate | Source |
|------|----------------|--------|
| Warehouse Forklift Operator | $19–21/hr | [Salary.com](https://www.salary.com/research/salary/alternate/warehouse-forklift-operator-hourly-wages), [PayScale](https://www.payscale.com/research/US/Job=Forklift_Operator/Hourly_Rate) |
| Warehouse Worker (general) | $16–19/hr | [ZipRecruiter](https://www.ziprecruiter.com/Salaries/Warehouse-Forklift-Operator-Salary) |
| Warehouse Manager | $28–35/hr | [Glassdoor](https://www.glassdoor.com/Salaries/forklift-operator-salary-SRCH_KO0,17.htm) |

**Fully loaded labor cost** (wages + benefits + overhead): ~$25–30/hr for warehouse workers, ~$40–50/hr for managers.

### ROI Calculation

**Assumptions for a mid-size wholesale distributor (Professional tier):**

| Input | Value | Basis |
|-------|-------|-------|
| Pickups per day | 75 | Mid-range for primary segment |
| Minutes saved per pickup (staff coordination) | 2 min | No more "which gate?" radio calls, status inquiries |
| Minutes saved per pickup (customer wait) | 5 min | Real-time visibility reduces perceived + actual wait |
| Staff hourly rate (fully loaded) | $27/hr | Average warehouse worker with benefits |
| Warehouse Pickup Queue cost | $349/mo | Professional tier |

**Monthly savings calculation:**

```
Staff time saved:  75 pickups × 2 min = 150 min/day = 2.5 hrs/day
                   2.5 hrs × 22 days × $27/hr = $1,485/mo in labor savings

Customer time saved: 75 pickups × 5 min = 375 min/day = 6.25 hrs/day
                     (Not directly monetizable, but drives customer satisfaction
                      and retention)

Monthly ROI:       $1,485 savings - $349 cost = $1,136/mo net benefit
                   4.3x return on investment
```

**Payback period:** Less than 1 week of usage covers the monthly cost.

### ROI by Tier

| Tier | Monthly Cost | Min Pickups to Break Even | Typical Pickups | ROI Multiple |
|------|-------------|--------------------------|-----------------|-------------|
| Starter ($149) | $149/mo | ~15/day | 30–50/day | 3–6x |
| Professional ($349) | $349/mo | ~35/day | 75–200/day | 4–10x |
| Enterprise ($800) | $800/mo | ~80/day | 150–500/day | 5–15x |

### ROI Calculator Inputs (for Sales Tool)

The sales team should build an interactive ROI calculator that takes:
1. Average pickups per day
2. Number of gates
3. Number of warehouse staff involved in coordination
4. Estimated minutes per pickup spent on coordination
5. Average hourly labor rate

And outputs: monthly savings, annual savings, ROI multiple, payback period.

---

## 7. Pricing Communication Strategy

### Don't Compare to Queue Tools

Wrong framing: "We're $149/mo vs. Waitwhile at $59/mo — here's why we're worth more."

Right framing: **"$349/mo saves you $1,500/mo in warehouse labor. That's a 4x return."**

### Pricing Page Structure

1. **Lead with ROI, not price** — "Starting at less than the cost of 1 hour of warehouse labor per day"
2. **Show three tiers** with Professional highlighted as "Most Popular"
3. **Include the ROI calculator** directly on the pricing page
4. **Annual toggle** showing 20% savings
5. **Enterprise CTA** — "Talk to us" for multi-location pricing
6. **FAQ addressing objections:** "Why is this more expensive than Waitwhile?" → "Waitwhile is built for retail queues. We're built for warehouse operations with NetSuite integration, gate management, and processing workflows."
