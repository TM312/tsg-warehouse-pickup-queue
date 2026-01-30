# Phase 16: Sidebar Layout - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Staff app has consistent navigation via collapsible sidebar. Dashboard, Gates, and Opening Schedule are accessible via sidebar navigation. Gate operator routes (/gate/[id]) remain fullscreen without sidebar.

</domain>

<decisions>
## Implementation Decisions

### Component Library
- Use shadcn-vue Sidebar component: https://www.shadcn-vue.com/docs/components/sidebar
- Follow dashboard-01 block pattern: https://www.shadcn-vue.com/blocks#dashboard-01
- Use `variant="inset"` layout style
- Use shadcn-vue defaults for widths, breakpoints, and styling

### Sidebar Header
- Logo in header section (following dashboard-01 pattern)
- App branding at top of sidebar

### Sidebar Footer
- User section with avatar/name
- Dropdown menu including logout functionality

### Navigation Items
- Three main nav items: Dashboard, Gates, Schedule
- Gates is a single link (no sub-menu expanding to individual gates)
- Standard icons: Home/Dashboard icon, Door/Gate icon, Calendar/Schedule icon
- Current page visually highlighted

### Collapse Behavior
- Desktop: Use shadcn-vue default collapse mode (icon rail)
- Toggle button in main content header (not in sidebar)
- Sidebar state does NOT persist across page refreshes (always starts expanded)
- Use shadcn-vue default breakpoint for mobile/desktop switch

### Mobile Experience
- Use shadcn-vue default mobile behavior (sheet/drawer from left)
- Tap outside to close (shadcn default)
- Auto-close sidebar on nav item selection

### Gate Operator Routes
- Routes matching /gate/[id] render fullscreen without sidebar
- Optimized for mobile operators

### Claude's Discretion
- Exact Lucide icon names for each nav item
- Spacing and typography within shadcn defaults
- Loading states during navigation

</decisions>

<specifics>
## Specific Ideas

- Reference: https://www.shadcn-vue.com/blocks#dashboard-01 for overall structure
- Reference: https://www.shadcn-vue.com/docs/components/sidebar for component API
- "I want it to feel like the shadcn dashboard-01 example"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 16-sidebar-layout*
*Context gathered: 2026-01-30*
