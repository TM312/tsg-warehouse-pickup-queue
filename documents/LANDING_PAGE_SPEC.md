# Landing Page Spec — Warehouse Pickup Queue

## Overview

A single-page marketing site that converts warehouse operations decision-makers into 14-day free trial sign-ups. The page must communicate the core value proposition in under 5 seconds and provide progressive depth for three distinct buyer personas.

**Tech stack:** Nuxt 4, Vue 3, TypeScript, TailwindCSS v4, shadcn-vue (reka-ui), lucide-vue-next, pnpm — matching the existing monorepo.

**Location:** `/landing` directory at the monorepo root (new Nuxt app).

---

## Target Audiences

| Persona | Role | Core Motivation | Key Message |
|---|---|---|---|
| Ops Alex | Operations Manager | Labor cost savings, ROI | "Stop wasting staff time on 'which gate?' radio calls." |
| Warehouse Mike | Warehouse Manager | Simplicity, reliability | "Replace your whiteboard with a system your team learns in 30 minutes." |
| Branch Beth | Branch Manager | Customer experience, retention | "Your competitors' customers wait in line wondering where to go. Yours check their phone." |

---

## Page Structure

### Section 1 — Hero

- **Headline:** "Your warehouse pickup line is costing you $1,500/month"
- **Subheadline:** "Real-time queue management purpose-built for warehouse pickup operations. Customers see their status on their phone. Staff stop playing traffic cop."
- **Primary CTA:** "Try the Interactive Demo" → links to `/playground`
- **Secondary CTA:** "Start Free Trial" → trial signup flow
- **Visual:** Animated split-screen showing the customer mobile view (queue position, gate assignment) alongside the staff dashboard (queue list, gate status). Use stylized mockups, not screenshots.
- **Trust bar:** "Purpose-built for wholesale distributors · Native NetSuite integration · Go live in under a day"

### Section 2 — Problem Statement

**Heading:** "Sound familiar?"

Three pain-point cards with icons:

1. **Radio chaos** — "Gate 3, is that loaded yet? Anybody seen the driver for order 4471?" Staff burn hours on coordination that software should handle.
2. **Blind customers** — Drivers idle in the lot with no idea when they'll be called or where to go. They call the front desk. Or just walk in.
3. **Whiteboard ops** — Your pickup queue is a whiteboard, a clipboard, or someone's memory. One sick day and the system breaks.

### Section 3 — Product Overview

**Heading:** "One system. Three interfaces. Zero confusion."

Three feature columns:

| Feature | Description |
|---|---|
| **Customer Mobile View** | Customers scan a QR code or open a link — no app download, no login. They see their position in queue, estimated wait, and gate assignment in real time. |
| **Staff Dashboard** | Manage the full queue from any browser. Check in arrivals, assign gates, update order status, and see your day's analytics at a glance. |
| **Gate Operator Console** | A dedicated fullscreen view for the person at the gate. One truck at a time, big clear UI, works on a tablet mounted to a forklift. |

Each column should have a stylized UI illustration or a short looping animation.

### Section 4 — ROI Calculator (Interactive)

**Heading:** "Do the math in 10 seconds"

An interactive calculator component with three inputs:

- **Pickups per day** (slider, default 75, range 10–300)
- **Minutes saved per pickup** (slider, default 2, range 1–5)
- **Hourly labor cost** (input, default $30, range $15–$60)

**Output (live-updating):**
- Daily time saved: `{pickups × minutes} minutes`
- Monthly labor savings: `${(pickups × minutes / 60) × hourly_rate × 22}`
- Monthly cost: `$349`
- **Monthly ROI: `{savings / 349}x`**
- Payback period: "Under 1 week"

### Section 5 — NetSuite Integration

**Heading:** "Plugs into NetSuite. Not bolted on."

- Validate sales orders at check-in automatically
- Pull item fulfillment status in real time
- No CSV exports, no double-entry, no middleware
- "Built for the NetSuite ecosystem from day one — not retrofitted."
- Visual: Simple flow diagram showing NetSuite ↔ Warehouse Pickup Queue data sync
- Note: "SAP Business One, Epicor, and Acumatica integrations on the roadmap."

### Section 6 — How It Works

**Heading:** "Live in under a day"

Four-step horizontal timeline:

1. **Sign up** — 14-day free trial, no credit card
2. **Configure** — Add your gates, set your hours, connect NetSuite (optional)
3. **Print the QR code** — Stick it at your check-in window
4. **Go live** — Customers start scanning, your queue fills itself

### Section 7 — Pricing

**Heading:** "Less than 1 hour of warehouse labor per day"

Three-tier pricing cards:

| | Starter | Professional | Enterprise |
|---|---|---|---|
| **Price** | $149/mo | $349/mo | Custom |
| **Badge** | | Most Popular | |
| **Locations** | 1 | 1 | Multi-location |
| **Gates** | Up to 3 | Up to 10 | Unlimited |
| **Pickups/day** | 50 | Unlimited | Unlimited |
| **Staff seats** | 1 | 5 | Unlimited |
| **NetSuite integration** | — | Yes | Yes |
| **Gate operator console** | — | Yes | Yes |
| **Analytics** | Basic | Advanced | Custom |
| **Support** | Email | Priority | Dedicated CSM + SLA |
| **CTA** | Start Free Trial | Start Free Trial | Contact Sales |

- Annual billing toggle: 20% discount ($279/mo for Professional billed annually)
- Fine print: "All plans include a 14-day free trial of Professional features. No credit card required."

### Section 8 — Social Proof / Testimonials

**Heading:** "Built for warehouses like yours"

- Placeholder section for future testimonials and case studies
- For launch, use **industry logos** (target verticals: building materials, electrical supply, plumbing/HVAC, industrial supply) if available, or use a quote-style layout with anonymized metrics:
  - "75% reduction in 'where's my order?' calls"
  - "Average wait time dropped from 23 min to 8 min"
  - "Staff saves 2.5 hours per day on pickup coordination"
- Sub-verticals listed as tags: Building Materials · Electrical Supply · Plumbing & HVAC · Industrial Supply · Janitorial · Manufacturing

### Section 9 — FAQ

Expandable accordion with 6–8 questions:

1. **Do my customers need to download an app?** — No. It's a mobile web app. Customers scan a QR code or open a link. No login, no download.
2. **How long does setup take?** — Most teams are live within a few hours. Connect NetSuite, configure your gates, print a QR code, done.
3. **What if we don't use NetSuite?** — The system works standalone. NetSuite integration is available on Professional and Enterprise plans. We're adding more ERPs soon.
4. **Is there a contract or commitment?** — No. Month-to-month billing. Cancel anytime.
5. **Can I try it before signing up?** — Yes — our interactive Playground demo lets you experience the full system with simulated data, no signup required.
6. **What happens when the internet goes down?** — The staff dashboard works on any device with a browser. For connectivity issues, staff can manage the queue manually and it syncs when connection returns.
7. **How does the customer queue work?** — Customers scan a QR code at your facility, enter their order number, and join the queue. They see their position and get notified when a gate is assigned — all on their phone.
8. **Do you support multiple locations?** — Yes, on the Enterprise plan. Each location gets its own queue, gates, and staff.

### Section 10 — Final CTA

**Heading:** "See it work. Right now."
**Subheading:** "No signup. No sales call. Just click."
- **Primary CTA:** "Launch the Interactive Demo" → `/playground`
- **Secondary CTA:** "Start Your 14-Day Free Trial"

### Section 11 — Footer

- Product links: Features, Pricing, Demo, Documentation
- Company links: About, Contact, Privacy Policy, Terms of Service
- Contact: Email, support hours note ("We know warehouses start early — support available 5am–9pm PT")
- Social: LinkedIn
- Copyright

---

## Design Direction

- **Color palette:** Use the existing TailwindCSS theme from the monorepo. Primary brand color should be warehouse-practical — avoid overly techy/SaaS aesthetics. No indigo.
- **Typography:** Clean, high-contrast. Headlines should feel direct and confident, not playful.
- **Imagery style:** Stylized UI mockups and diagrams, not stock photos of warehouses. The product IS the visual.
- **Animations:** Subtle. Fade-in on scroll for sections. The ROI calculator numbers should animate when values change. No parallax, no heavy motion.
- **Mobile responsive:** Must work well on mobile — decision-makers will forward the link and it'll get opened on phones.
- **Dark mode:** Not required for v1. Light theme only.

---

## Key CTAs & Conversion Flow

| Priority | CTA | Destination | Appears In |
|---|---|---|---|
| 1 | "Try the Interactive Demo" | `/playground` | Hero, Final CTA |
| 2 | "Start Free Trial" | Trial signup (email → onboarding) | Hero, Pricing, Final CTA |
| 3 | "Contact Sales" | Contact form or calendly link | Enterprise pricing card |

The Playground demo is the **primary conversion tool** — it's zero-friction and already built. The trial signup is the secondary path for buyers who are ready to commit.

---

## SEO & Meta

- **Title:** "Warehouse Pickup Queue — Real-Time Queue Management for Warehouse Operations"
- **Description:** "Stop wasting staff time coordinating warehouse pickups. Real-time queue management with customer mobile view, staff dashboard, and native NetSuite integration. Try the free demo."
- **Target keywords:** warehouse pickup queue software, will call queue management, warehouse queue system, pickup scheduling software, warehouse customer pickup, NetSuite warehouse queue
- **OG image:** Stylized product screenshot showing the three interfaces side-by-side

---

## Out of Scope for V1

- Blog / content marketing pages
- Documentation site
- Login / signup flow (just link to the staff app's auth)
- Video production (placeholder for "2-minute product video" mentioned in GTM)
- Live chat widget
- A/B testing infrastructure
- Analytics beyond basic Plausible or similar privacy-friendly analytics
