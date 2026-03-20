# Landing Page — Work Packages

Reference: `documents/LANDING_PAGE_SPEC.md` for all copy, content, and design details.

---

## Dependency Graph

```
WP-0  Nuxt App Scaffold                          ✅ DONE
 ├── WP-1  Layout Shell (nav + footer)            ✅ DONE
 │    └── WP-8  SEO & Meta                        ⬚ Not started
 ├── WP-2  Hero Section                           ✅ DONE
 ├── WP-3  Problem Statement                      ✅ DONE
 ├── WP-4  Product Overview                       ✅ DONE
 ├── WP-5  ROI Calculator                         ✅ DONE
 ├── WP-6  ERP Integration + How It Works         ✅ DONE
 ├── WP-7  Pricing Section                        🔧 In progress
 ├── WP-9  Social Proof + FAQ                     ⬚ Not started
 └── WP-10 Final CTA                              ⬚ Not started
```

**WP-0** through **WP-6** are complete. **WP-7** is in progress (branch `TM312/wp7-social-proof`). **WP-8 through WP-10** are independent and can be built in parallel.

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

## WP-2 — Hero Section ✅

**Status:** Complete (PR #31, merged)

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

## WP-3 — Problem Statement ✅

**Status:** Complete (branch `TM312/wp3-features-section`)

**Goal:** Spec Section 2 — three pain-point cards.

**What has been built:**
- `app/components/landing/ProblemSection.vue` — Section with heading ("Sound familiar?"), responsive 3-column grid (stacks on mobile), scroll-triggered staggered reveal animation
- `app/components/landing/ProblemCard.vue` — Card with lucide icon, heading, and description. Icons mapped via `Record<ProblemIcon, Component>` (Radio, EyeOff, ClipboardList)
- `app/composables/useSectionReveal.ts` — Reusable IntersectionObserver-based reveal composable with `prefers-reduced-motion` support, configurable threshold
- `app/constants/problem.ts` — Section heading, three card definitions (Radio chaos, Blind customers, Whiteboard ops), reveal threshold/stagger config
- `app/types/problem.ts` — TypeScript types (`ProblemIcon`, `ProblemCard`)
- Full test coverage: `ProblemSection.test.ts`, `ProblemCard.test.ts`, `useSectionReveal.test.ts`, `problem.test.ts`

**Outputs:** Three-card problem statement section with scroll-reveal animation.

---

## WP-4 — Product Overview ✅

**Status:** Complete (PR #33, merged)

**Goal:** Spec Section 3 — three feature columns with stylized UI illustrations.

**What has been built:**
- `app/components/landing/ProductOverviewSection.vue` — Section with heading ("One system. Three interfaces. Zero confusion."), responsive 3-column grid (stacks on mobile), scroll-triggered staggered reveal animation via `useSectionReveal`
- `app/components/landing/ProductFeatureCard.vue` — Card with dynamic mockup component, heading, and description. Mockups mapped via `Record<ProductMockupType, Component>` (phone, browser, tablet)
- `app/components/landing/ProductMockupPhone.vue` — Phone frame CSS mockup for Customer Mobile View
- `app/components/landing/ProductMockupBrowser.vue` — Browser frame CSS mockup for Staff Dashboard
- `app/components/landing/ProductMockupTablet.vue` — Tablet frame CSS mockup for Gate Operator Console
- `app/constants/product.ts` — Section heading, three feature definitions with mockup type/heading/description, reveal stagger config (150ms)
- `app/types/product.ts` — TypeScript types (`ProductMockupType`, `ProductFeature`)
- `app/pages/index.vue` — Updated to include `<LandingProductOverviewSection />` with `id="features"` anchor
- Test coverage: `ProductOverviewSection.test.ts`, `ProductFeatureCard.test.ts`, `product.test.ts`

**Outputs:** Three-column product overview with CSS mockup illustrations and scroll-reveal animation.

---

## WP-5 — ROI Calculator ✅

**Status:** Complete (PR #34, merged)

**Goal:** Spec Section 4 — interactive calculator with live-updating outputs.

**What was delivered:**
- `app/components/landing/RoiSection.vue` — Section with heading ("Do the math in 10 seconds"), two-column layout (inputs left, outputs right), scroll-triggered reveal animation via `useSectionReveal`
- `app/components/landing/RoiSliderInput.vue` — Reusable slider input with label and live numeric display, uses shadcn `Slider` + `Label`
- `app/components/landing/RoiCurrencyInput.vue` — Currency text input with `$` prefix, clamped on blur, uses shadcn `Input` + `Label`
- `app/components/landing/RoiOutputCard.vue` — Output card with animated number transitions, supports minutes/currency/multiplier/text formats, optional highlight styling
- `app/composables/useRoiCalculator.ts` — Reactive calculator: pickups/day × minutes saved × hourly cost × 22 working days/month, ROI multiplier against $349/mo cost, payback period
- `app/composables/useAnimatedNumber.ts` — requestAnimationFrame-based counter animation with `prefers-reduced-motion` support
- `app/constants/roi.ts` — All config: slider ranges (pickups 10–300, minutes 1–5), hourly cost $15–$60, output display configs, animation duration (300ms), reveal stagger (100ms)
- `app/types/roi.ts` — TypeScript types (`RoiSliderConfig`, `RoiInputConfig`, `RoiOutputs`, `RoiOutputFormat`, `RoiOutputDisplayConfig`)
- shadcn-vue components added: `Slider`, `Input`, `Label`
- `app/pages/index.vue` — Updated to include `<LandingRoiSection />` with `id="roi"` anchor
- Test coverage: `RoiSection.test.ts`, `RoiCurrencyInput.test.ts`, `RoiOutputCard.test.ts`, `useAnimatedNumber.test.ts`, `useRoiCalculator.test.ts`, `roi.test.ts`

**Outputs:** Fully interactive ROI calculator with animated outputs. Pure client-side math.

---

## WP-6 — ERP Integration + How It Works ✅

**Status:** Complete (PR #35, merged)

**Goal:** Spec Sections 5 and 6 — integration pitch and four-step timeline.

**What has been built:**
- `app/components/landing/ErpSection.vue` — Section with heading ("Connects to your ERP. Not bolted on."), two-column layout (bullets left, flow diagram right), ERP roadmap note, scroll-triggered staggered reveal animation via `useSectionReveal`
- `app/components/landing/ErpBulletItem.vue` — Bullet item with lucide icon and text. Icons mapped via `Record<ErpBulletIcon, Component>` (ShieldCheck, RefreshCw, FileX2, Blocks)
- `app/components/landing/ErpFlowDiagram.vue` — SVG flow diagram showing bidirectional data sync between ERP and the product
- `app/components/landing/HowItWorksSection.vue` — Section with heading ("Live in under a day"), horizontal four-step timeline with desktop connector line, stacks vertically on mobile with vertical connector line, scroll-triggered staggered reveal animation
- `app/components/landing/HowItWorksStep.vue` — Step card with numbered circle, lucide icon, heading, and description. Icons: UserPlus, Settings, QrCode, Rocket
- `app/constants/erp.ts` — Section heading, four bullet definitions, ERP roadmap note (SAP Business One, Epicor, Acumatica, NetSuite on roadmap), reveal stagger config (150ms)
- `app/constants/howItWorks.ts` — Section heading ("Live in under a day"), four steps (Sign up → Configure → Print QR code → Go live), reveal stagger config (150ms)
- `app/types/erp.ts` — TypeScript types (`ErpBulletIcon`, `ErpBullet`)
- `app/types/howItWorks.ts` — TypeScript types (`HowItWorksIcon`, `HowItWorksStep`)
- `app/pages/index.vue` — Updated to include `<LandingErpSection />` and `<LandingHowItWorksSection />`
- Test coverage: `ErpBulletItem.test.ts`, `ErpSection.test.ts`, `HowItWorksSection.test.ts`, `HowItWorksStep.test.ts`, `erp.test.ts`, `howItWorks.test.ts`

**Outputs:** ERP integration section with bullet points and flow diagram, plus four-step setup timeline. Positioned as ERP-agnostic.

---

## WP-7 — Pricing Section 🔧

**Status:** In progress (branch `TM312/wp7-social-proof`, uncommitted)

**Goal:** Spec Section 7 — three-tier pricing cards with annual toggle.

**What has been built:**
- `app/components/landing/PricingSection.vue` — Section with three-tier pricing cards and billing toggle
- `app/components/landing/PricingCard.vue` — Individual pricing card component
- `app/components/landing/PricingFeatureRow.vue` — Feature comparison row component
- `app/components/landing/PricingToggle.vue` — Annual/monthly billing toggle
- `app/composables/useBillingToggle.ts` — Reactive billing period state composable
- `app/constants/pricing.ts` — Pricing tiers, features, and configuration data
- `app/types/pricing.ts` — TypeScript types for pricing domain
- shadcn-vue components added: `Card` (with CardHeader, CardTitle, CardDescription, CardContent, CardFooter), `Badge`, `Switch`
- `app/pages/index.vue` — Updated to include `<LandingPricingSection />` (replacing placeholder)
- Test coverage: `PricingCard.test.ts`, `PricingSection.test.ts`, `PricingToggle.test.ts`, `useBillingToggle.test.ts`, `pricing.test.ts`

**Outputs:** Responsive pricing section with billing toggle. Not yet committed.

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

WP-0 through WP-6 are complete. WP-7 is in progress (nearly done, needs commit). Three work packages remain: WP-8, WP-9, and WP-10 — all independent and ready to build in parallel.

For a single developer working sequentially:

```
WP-7 (finish) → WP-9 → WP-10 → WP-8
```

Rationale: Finish WP-7 first (code written, needs commit/PR), then Social Proof + FAQ for trust signals, Final CTA for conversion. SEO is last because it's a polish pass after content is in place.

For parallel execution (2–3 agents):

| Agent A | Agent B | Agent C |
|---|---|---|
| WP-7 Pricing (finish) | WP-9 Social Proof + FAQ | WP-10 Final CTA |
| WP-8 SEO & Meta | — | — |
