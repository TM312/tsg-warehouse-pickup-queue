# Landing Page — Work Packages

Reference: `documents/LANDING_PAGE_SPEC.md` for all copy, content, and design details.

---

## Dependency Graph

```
WP-0  Nuxt App Scaffold                          ✅ DONE
 ├── WP-1  Layout Shell (nav + footer)            ✅ DONE
 │    └── WP-8  SEO & Meta                        ⬚ Not started
 ├── WP-2  Hero Section                           🔄 In review
 ├── WP-3  Problem Statement                      ⬚ Not started
 ├── WP-4  Product Overview                       ⬚ Not started
 ├── WP-5  ROI Calculator                         ⬚ Not started
 ├── WP-6  ERP Integration + How It Works         ⬚ Not started
 ├── WP-7  Pricing Section                        ⬚ Not started
 ├── WP-9  Social Proof + FAQ                     ⬚ Not started
 └── WP-10 Final CTA                              ⬚ Not started
```

**WP-0** and **WP-1** are complete. **WP-2** is implemented and in review. **WP-3 through WP-10** are independent and can be built in parallel.

---

## WP-0 — Nuxt App Scaffold ✅

**Status:** Complete (PR #29)

**Goal:** Bootable `/landing` Nuxt app with zero content, matching existing monorepo conventions.

**What was delivered:**
- Nuxt 4.4.2 app with `ssr: true`, `shadcn-nuxt` module, `@tailwindcss/vite` plugin
- Tailwind CSS v4 with oklch color system, dark/light mode, no indigo
- All shared deps installed: `shadcn-nuxt`, `reka-ui`, `lucide-vue-next`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`, `@vueuse/core`
- shadcn-vue initialized with `app/components/ui` directory
- Makefile targets added (`landing-dev`, `landing-build`)
- `app/app.vue` → `<NuxtLayout><NuxtPage /></NuxtLayout>`
- Vitest test infrastructure with `@vue/test-utils`

---

## WP-1 — Layout Shell ✅

**Status:** Complete (merged)

**Goal:** Sticky nav + footer that wraps all page content.

**What was delivered:**
- `app/components/LandingNav.vue` — Fixed header with product name, desktop nav links (Features, Pricing, Demo), "Start Free Trial" CTA, hamburger menu on mobile with Sheet drawer, scroll-aware blur/transparency
- `app/components/LandingFooter.vue` — Multi-section footer (Product, Company) with contact email, support hours, social links (LinkedIn), responsive grid (1-col mobile → 4-col desktop), dynamic copyright year
- `app/layouts/default.vue` — Integrates nav + footer, passes `isScrolled` to nav, applies `pt-16` for fixed nav offset
- `app/composables/useSmoothScroll.ts` — Smooth anchor scrolling with history updates
- `app/composables/useScrolledNav.ts` — Reactive scroll-position detection (threshold: 10px)
- `app/constants/navigation.ts` — All nav/footer/contact data centralized
- `app/types/navigation.ts` — TypeScript interfaces (`NavLink`, `FooterSection`, `SocialLink`)
- UI components: `Button` (CVA-based, 6 variants, 6 sizes), `Sheet` (full drawer system with slide animations)
- `app/pages/index.vue` — Placeholder sections with anchor IDs (`#features`, `#pricing`, `#demo`)
- Full test coverage: components, composables, constants, layouts, pages

---

## WP-2 — Hero Section 🔄

**Status:** Implemented (branch `TM312/wp2-hero-social-proof`, pending merge)

**Goal:** Spec Section 1 — headline, subheadline, dual CTAs, animated split-screen visual, trust bar.

**What was delivered:**
- `app/components/landing/HeroSection.vue` — Main hero with headline ("Your warehouse pickup line is costing you $1,500/month"), subheadline, dual CTAs, trust bar, and two synchronized mockup panels
- `app/components/landing/HeroMockupPhone.vue` — Mobile phone mockup showing animated queue progression (#3 → #2 → #1 → "Your turn!") with wait times and gate assignment. CSS keyframe animations on a 10s cycle (`--hero-cycle-duration`)
- `app/components/landing/HeroMockupDashboard.vue` — Browser dashboard mockup with live queue table, status badges (loading/called/waiting/complete), and gate assignments. Animations synchronized with phone mockup via staggered delays
- `app/composables/useHeroAnimation.ts` — IntersectionObserver-based animation visibility control with `prefers-reduced-motion` support
- `app/constants/hero.ts` — All hero copy, CTA labels/hrefs, trust bar items, and sample queue data centralized
- `app/types/hero.ts` — TypeScript interfaces (`TrustBarItem`, `MockupQueueEntry`)
- Primary CTA → `/playground`, Secondary CTA → `#trial`
- Trust bar: "Purpose-built for wholesale distributors" · "ERP integration ready" · "Go live in under a day"
- Responsive: panels stack vertically on mobile
- Full test coverage: `HeroSection.test.ts`, `HeroMockupPhone.test.ts`, `HeroMockupDashboard.test.ts`, `useHeroAnimation.test.ts`, `hero.test.ts`

---

## WP-3 — Problem Statement ⬚

**Goal:** Spec Section 2 — three pain-point cards.

**Tasks:**
1. `app/components/landing/ProblemSection.vue`
2. Three cards in a row (stack on mobile) with lucide icons, heading, description
3. Fade-in-on-scroll animation (use `@vueuse/core` `useIntersectionObserver` or CSS `animation-timeline`)
4. Add shadcn-vue `Card` component if useful

**Outputs:** Three-card problem statement section.

---

## WP-4 — Product Overview ⬚

**Goal:** Spec Section 3 — three feature columns with stylized UI illustrations.

**Tasks:**
1. `app/components/landing/ProductOverviewSection.vue`
2. Three columns: Customer Mobile View, Staff Dashboard, Gate Operator Console
3. Each column: stylized UI illustration (SVG or CSS mockup) + heading + description
4. Illustrations should be simple, recognizable representations of each interface (phone frame, browser frame, tablet frame)
5. Scroll-triggered fade-in

**Outputs:** Three-column product overview with illustrations.

---

## WP-5 — ROI Calculator ⬚

**Goal:** Spec Section 4 — interactive calculator with live-updating outputs.

**Tasks:**
1. `app/components/landing/RoiCalculatorSection.vue`
2. Three inputs: pickups/day (slider), minutes saved (slider), hourly labor cost (text input with constraints)
3. Computed outputs with animated number transitions (use CSS `transition` or a small counter animation)
4. Formula: see spec Section 4 for exact calculations
5. Add shadcn-vue components: `Slider`, `Input`, `Label`
6. Highlight the ROI multiplier prominently

**Outputs:** Fully interactive ROI calculator. No backend needed — pure client-side math.

---

## WP-6 — ERP Integration + How It Works ⬚

**Goal:** Spec Sections 5 and 6 — integration pitch and four-step timeline.

**Tasks:**
1. `app/components/landing/IntegrationSection.vue` — bullet points, flow diagram (SVG), ERP roadmap note
2. `app/components/landing/HowItWorksSection.vue` — horizontal four-step timeline with numbered steps and icons. Stacks vertically on mobile.
3. Flow diagram: simple SVG showing bidirectional data sync between ERP and the product
4. Position as ERP-agnostic (no current NetSuite integration; planned). Present as compatible with major ERPs.

**Outputs:** Integration section and setup timeline.

---

## WP-7 — Pricing Section ⬚

**Goal:** Spec Section 7 — three-tier pricing cards with annual toggle.

**Tasks:**
1. `app/components/landing/PricingSection.vue`
2. Three cards: Starter, Professional (highlighted as "Most Popular"), Enterprise
3. Annual/monthly toggle — 20% discount on annual. Animate price change.
4. Feature comparison rows per spec table
5. CTA buttons: "Start Free Trial" for Starter/Professional, "Contact Sales" for Enterprise
6. Fine print about 14-day trial
7. Add shadcn-vue components: `Card`, `Badge`, `Switch` or `Toggle`, `Button`
8. Use `id="pricing"` for anchor linking from nav

**Outputs:** Responsive pricing section with billing toggle.

---

## WP-8 — SEO & Meta ⬚

**Goal:** Spec SEO & Meta section — proper meta tags, OG tags, structured data.

**Tasks:**
1. `useHead()` / `useSeoMeta()` in `pages/index.vue` with title, description, OG tags per spec
2. OG image placeholder (can be a static image or generate later)
3. Semantic HTML throughout: proper heading hierarchy (`h1` in hero only, `h2` per section)
4. Add `robots.txt` and basic `sitemap.xml` to `public/`

**Outputs:** Correct meta tags, OG tags, semantic HTML.

---

## WP-9 — Social Proof + FAQ ⬚

**Goal:** Spec Sections 8 and 9 — testimonials/metrics and expandable FAQ.

**Tasks:**
1. `app/components/landing/SocialProofSection.vue` — metric quotes in card layout, vertical sub-tags
2. `app/components/landing/FaqSection.vue` — accordion with 8 questions from spec
3. Add shadcn-vue `Accordion` component
4. Use `id="faq"` for potential anchor linking

**Outputs:** Social proof metrics and FAQ accordion.

---

## WP-10 — Final CTA ⬚

**Goal:** Spec Section 10 — closing CTA block.

**Tasks:**
1. `app/components/landing/FinalCtaSection.vue`
2. Centered heading + subheading + two CTA buttons
3. Visually distinct from rest of page — consider a contrasting background (muted or primary)
4. Primary CTA → `/playground`, Secondary CTA → trial signup

**Outputs:** Final conversion section.

---

## Suggested Implementation Order

WP-0, WP-1, and WP-2 are complete or in review. All remaining work packages (WP-3 through WP-10) are independent and ready to build in parallel.

For a single developer working sequentially:

```
WP-5 → WP-7 → WP-4 → WP-3 → WP-6 → WP-9 → WP-10 → WP-8
```

Rationale: Calculator and Pricing are the highest-impact remaining sections for conversion. SEO is last because it's a polish pass after content is in place.

For parallel execution (2–3 agents):

| Agent A | Agent B | Agent C |
|---|---|---|
| WP-5 ROI Calculator | WP-7 Pricing | WP-4 Product Overview |
| WP-3 Problem Statement | WP-6 Integration + How It Works | WP-9 Social Proof + FAQ |
| WP-10 Final CTA | WP-8 SEO & Meta | — |
