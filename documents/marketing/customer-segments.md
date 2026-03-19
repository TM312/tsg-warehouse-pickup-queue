# Customer Segments & Personas

**Date:** March 19, 2026
**Purpose:** Define target customer segments and buyer personas for Warehouse Pickup Queue.

---

## 1. Segment Overview

| Segment | Priority | Est. Facilities (US) | Typical Pickups/Day | Gate Count | Avg Deal Size |
|---------|----------|---------------------|---------------------|------------|---------------|
| Wholesale Distributors (Will-Call) | **Primary** | 4,000–6,000 | 50–200 | 2–10 | $349/mo |
| Regional Distribution Centers | Secondary | 1,000–2,000 | 100–500 | 5–20 | $349–800/mo |
| Manufacturing with Customer Pickup | Tertiary | 500–1,000 | 20–80 | 2–6 | $149–349/mo |

---

## 2. Primary Segment: Wholesale Distributors with Will-Call Pickup

### Industry Profile

The US wholesale trade industry encompasses ~410,000 establishments with combined annual sales of approximately $11.9 trillion ([IBISWorld](https://www.ibisworld.com/united-states/industry/wholesale-trade/910/)). The market is highly fragmented — the average establishment has fewer than 10 employees, and companies with 100 or fewer employees retain over half of the industry's revenue ([555 Capital Advisors](https://www.555capitaladvisors.com/news-blog/2022/feb-healthy-living-market-update-p4ts6-3c3gh-l3543-nfr76-7kmmn)).

**Key sub-verticals for Warehouse Pickup Queue:**

| Sub-Vertical | Examples | Why They Fit |
|-------------|----------|-------------|
| **Building materials** | Lumber yards, roofing supply, concrete products | High daily pickup volume; contractors arrive in trucks; time-sensitive jobs |
| **Electrical supply** | Graybar, WESCO, local distributors | Will-call counters standard; NetSuite common in mid-market |
| **Plumbing/HVAC supply** | Ferguson branches, regional distributors | Frequent same-day pickups; contractors need to minimize wait time |
| **Industrial supply** | Fasteners, safety equipment, MRO | Multiple daily pickups from repeat customers; operational efficiency valued |
| **Janitorial/sanitation supply** | Regional Jan/San distributors | Smaller volume but consistent pickup patterns |

The US building materials distribution market alone represents ~$640B in annualized activity, with digital ordering platforms becoming essential for scaled distributors ([AnythingResearch](https://www.anythingresearch.com/industry/Lumber-Construction-Material-Merchant-Wholesalers.htm)).

### Why This Segment Is Primary

1. **Will-call pickup is core to operations** — Contractors depend on same-day pickup to keep job sites running. Any delay costs real money.
2. **Pain is acute and visible** — Trucks idling in parking lots, radio chatter about gate assignments, customers calling to ask "is my order ready?"
3. **NetSuite adoption is strong** — Distributors were among NetSuite's earliest adopters. The typical NetSuite customer is $5M–$500M in revenue, fitting mid-market distributors perfectly ([NetSuite](https://www.netsuite.com/portal/resource/articles/erp/erp-statistics.shtml), [Anchor Group](https://www.anchorgroup.tech/blog/netsuite-erp-statistics)).
4. **Price point is a non-issue** — $349/mo is trivial compared to the cost of a warehouse worker's time (~$21/hr average for forklift operators ([Salary.com](https://www.salary.com/research/salary/alternate/warehouse-forklift-operator-hourly-wages))). One hour of saved coordination time per day covers the monthly cost.
5. **Decision-making is local** — Branch and warehouse managers often have discretionary budget for operational tools at this price point.

### Segment Characteristics

- **Company size:** $10M–$500M annual revenue (mid-market sweet spot)
- **Employees per location:** 10–50 warehouse staff
- **Technology posture:** Mixed — some are cloud-native, others still use legacy systems. Target the cloud-adopters first.
- **Buying cycle:** 2–4 weeks for Starter; 4–8 weeks for Professional (may require operations VP approval)
- **ERP landscape:** NetSuite (strong fit), SAP Business One, Epicor, Infor, industry-specific systems

---

## 3. Secondary Segment: Regional Distribution Centers

### Segment Profile

Regional DCs serving food & beverage, auto parts, HVAC, and general merchandise. Higher volume than wholesale branches, with more complex gate operations.

| Attribute | Detail |
|-----------|--------|
| **Sub-verticals** | Food/beverage distribution, auto parts, HVAC supply, general merchandise |
| **Pickups/day** | 100–500 |
| **Gate count** | 5–20 |
| **Company size** | $50M–$1B annual revenue |
| **ERP** | NetSuite, SAP Business One, industry-specific (e.g., Encompass for auto parts) |
| **Key pain** | Peak hour congestion; trucks queuing in lots; customer complaints about unpredictable wait times |
| **Buying cycle** | 4–8 weeks; requires DC Manager or VP Operations approval |

### Why Secondary (Not Primary)

- Larger organizations with longer sales cycles and more stakeholders
- More likely to have existing dock scheduling tools (OpenDock, C3) that partially address their needs
- ERP landscape is more diverse (not as NetSuite-concentrated)
- Higher ACV opportunity ($349–800/mo) but harder to close

---

## 4. Tertiary Segment: Manufacturing with Customer Pickup

### Segment Profile

Manufacturing operations where customers pick up finished goods — concrete plants, lumber mills, steel service centers, aggregate quarries.

| Attribute | Detail |
|-----------|--------|
| **Sub-verticals** | Concrete/aggregate, lumber, steel service centers, specialty manufacturing |
| **Pickups/day** | 20–80 |
| **Gate count** | 2–6 (often specialized loading areas, not standard dock gates) |
| **Company size** | $5M–$200M annual revenue |
| **ERP** | Varied — often industry-specific or legacy systems |
| **Key pain** | Safety concerns with trucks idling; unpredictable pickup volumes; no scheduling visibility |
| **Buying cycle** | 2–4 weeks; Plant Manager often has authority |

### Why Tertiary

- Lower pickup volumes reduce the urgency of the pain
- ERP landscape is fragmented — NetSuite penetration is lower
- Physical operations (loading concrete, cutting steel) may not map cleanly to a standard gate/queue model
- May require product customization for specialized loading workflows

---

## 5. Buyer Personas

### Persona 1: The Operations Manager ("Ops Alex")

| Attribute | Detail |
|-----------|--------|
| **Title** | Operations Manager, Director of Operations |
| **Reports to** | VP Operations or GM |
| **Age range** | 35–55 |
| **Experience** | 10+ years in distribution/warehouse operations |
| **Day-to-day** | Oversees warehouse efficiency, staffing, throughput, customer satisfaction |
| **Technology comfort** | Moderate — uses ERP daily, comfortable with cloud tools, evaluates new software regularly |

**Daily challenges:**
- Balancing throughput with customer satisfaction during peak hours
- Managing staff allocation across gates as pickup volume fluctuates
- Fielding complaints from customers about wait times
- Reporting operational metrics to leadership

**What they care about when buying:**
1. **ROI in labor hours** — "How many hours of staff time does this save per day?"
2. **Implementation speed** — "Can we be live this week?"
3. **ERP integration** — "Does it work with our NetSuite?"
4. **Staff adoption** — "Will my warehouse team actually use this?"
5. **Data and reporting** — "Can I show my VP the improvement in wait times?"

**Common objections:**
- "We've managed fine with radios and clipboards for years"
- "My team isn't tech-savvy — they won't adopt it"
- "Can we try it before committing?"
- "We need to check with IT about integrations"

**How to win them over:** Live Playground demo → ROI calculator showing labor savings → 14-day trial with white-glove setup → first-week metrics showing improvement.

---

### Persona 2: The Warehouse Manager ("Warehouse Mike")

| Attribute | Detail |
|-----------|--------|
| **Title** | Warehouse Manager, Warehouse Supervisor |
| **Reports to** | Operations Manager or Branch Manager |
| **Age range** | 30–50 |
| **Experience** | 5–15 years on the warehouse floor, promoted from within |
| **Day-to-day** | Manages daily warehouse operations, gate assignments, staff coordination, customer interactions |
| **Technology comfort** | Low to moderate — uses ERP for basic tasks, prefers simple tools |

**Daily challenges:**
- Manually coordinating gate assignments via radio or whiteboard
- Answering repeated "where's my order?" and "which gate?" questions
- Managing queue fairness when VIP customers arrive
- Dealing with peak-hour chaos when 10+ trucks arrive simultaneously

**What they care about when buying:**
1. **Ease of use** — "Is this simpler than my current whiteboard?"
2. **Mobile access** — "Can I use it from the warehouse floor on my phone?"
3. **Reliability** — "What happens if the internet goes down?"
4. **Minimal disruption** — "Will this change how my team works?"

**Common objections:**
- "Another system to learn? I barely have time as it is"
- "My guys aren't going to use tablets/phones on the floor"
- "The whiteboard works fine for us"

**How to win them over:** Gate operator console demo (show how simple it is) → emphasize it reduces interruptions → trial period where they see the difference → support during first week of adoption.

---

### Persona 3: The Branch Manager ("Branch Beth")

| Attribute | Detail |
|-----------|--------|
| **Title** | Branch Manager, General Manager |
| **Reports to** | Regional VP or Owner |
| **Age range** | 40–60 |
| **Experience** | 15+ years in distribution, may have started in sales |
| **Day-to-day** | P&L responsibility for the branch; customer relationships; staff management |
| **Technology comfort** | Moderate — uses ERP for reporting, delegates technical decisions |

**Daily challenges:**
- Balancing customer satisfaction with operational cost
- Retaining customers who complain about long wait times
- Justifying technology investments to regional leadership
- Managing branch profitability

**What they care about when buying:**
1. **Customer retention** — "Will this stop my customers from going to the competitor down the street?"
2. **Cost justification** — "What's the ROI I can show my regional VP?"
3. **Professional image** — "Does this make us look modern and organized?"
4. **Low risk** — "Can we cancel if it doesn't work out?"

**Common objections:**
- "We can't afford another software subscription right now"
- "My customers are old-school — they won't scan QR codes"
- "I need to run this by corporate/regional"

**How to win them over:** Customer experience angle (show the mobile pickup experience) → competitive differentiation ("your competitor doesn't offer this") → monthly billing with no lock-in → ROI calculator tied to customer retention.

---

## 6. Pain Points by Segment

| Pain Point | Wholesale Distributors | Regional DCs | Manufacturing |
|-----------|----------------------|-------------|---------------|
| Manual gate coordination (radio/whiteboard) | **High** | High | Medium |
| Customers asking "where's my order?" | **High** | Medium | Low |
| Peak hour congestion | High | **High** | Medium |
| No queue visibility for customers | **High** | Medium | Medium |
| Staff time wasted on coordination | **High** | High | Medium |
| Truck safety concerns (idling, parking) | Medium | High | **High** |
| No data on wait times or throughput | Medium | **High** | Low |
| Customer complaints about wait times | **High** | High | Medium |
| Difficulty managing VIP/priority customers | Medium | Medium | Low |

---

## 7. ERP Landscape by Segment

| ERP | Wholesale Distributors | Regional DCs | Manufacturing | Our Integration |
|-----|----------------------|-------------|---------------|-----------------|
| **NetSuite** | **Strong** (core mid-market) | Medium | Low | **Native** |
| SAP Business One | Medium | Medium | Medium | Future roadmap |
| Epicor | Medium (industrial) | Low | Medium | Future roadmap |
| Acumatica | Growing | Low | Low | Future roadmap |
| Infor | Low | Medium | Medium | Future roadmap |
| Industry-specific | Low | Medium (food, auto) | High | Case-by-case |
| QuickBooks/manual | Low (too small) | Very low | Medium | Not planned |

**Strategic implication:** Focus initial GTM on NetSuite users in wholesale distribution. This is the tightest product-market fit — the segment where our ERP integration creates the most value and where adoption friction is lowest.

---

## 8. Buying Process

### Typical Purchase Journey

```
Awareness          → Evaluation         → Decision           → Adoption
(2-4 weeks)          (1-2 weeks)          (1-2 weeks)          (1-2 weeks)

• Sees QR code at    • Playground demo    • Internal approval   • Staff training
  competitor's         or live demo        (Ops Manager or      (30 min)
  warehouse          • 14-day trial         Branch Manager)    • Gate setup
• Google search      • Tests with staff   • Annual vs monthly   • Customer
  "warehouse           and real pickups     billing decision      communication
  pickup software"   • ROI calculation    • Contract sign       • Go-live
• LinkedIn ad        • IT review of
• Industry             NetSuite
  conference           integration
• Referral from
  peer
```

**Total cycle:** 4–8 weeks from awareness to go-live for Starter/Professional. Enterprise deals may take 2–3 months with multi-stakeholder approval.

### Key Buying Criteria (Ranked by Importance)

1. **Ease of implementation** — "Can I be live in a day, not a month?"
2. **ERP integration** — "Does it work with our system?"
3. **Staff simplicity** — "Will my warehouse team actually use this?"
4. **Customer experience** — "Will my customers like this?"
5. **Price/ROI** — "Does the math work?"
6. **Support and reliability** — "What happens when something breaks?"
7. **Scalability** — "Can this grow with us to other locations?"
