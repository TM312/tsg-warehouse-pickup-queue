# Phase 23: Component Polish - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Refine two specific UI components: the sidebar NavUser footer and the ProcessingGatesTable idle state display. This phase focuses on layout, typography, and visual treatment — not new functionality.

</domain>

<decisions>
## Implementation Decisions

### NavUser Layout
- Stacked arrangement: user name on top, email below (vertical hierarchy)
- Typography: name in semibold/bold, email in smaller muted text
- Keep current avatar/icon treatment (don't change)
- Entire NavUser area clickable to open dropdown menu

### Dropdown Positioning
- Desktop: dropdown opens to the right side (away from sidebar)
- Mobile: use existing default behavior if any, otherwise pick appropriate mobile pattern
- Keep current menu items (don't change contents, just fix positioning)

### Idle State Display
- Muted/grayed entire row for idle gates
- "Idle" label visible (not just visual treatment)
- Single "Idle" text spans across columns where customer data would normally appear
- Gates maintain natural/configured order regardless of idle state (no sorting by status)

### Claude's Discretion
- Visual connector (arrow/caret) on dropdown — match existing dropdown patterns
- Exact mobile dropdown behavior if no default exists
- Specific muted color values and opacity for idle rows
- Exact column span implementation for idle text

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches that match existing design patterns.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 23-component-polish*
*Context gathered: 2026-02-03*
