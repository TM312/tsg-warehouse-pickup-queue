# Phase 22: Quick Wins - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Immediate visual improvements with zero architectural risk: external link button on Gates page, visually distinct tab queue count badges, and refresh button removal. No new components or state management changes.

</domain>

<decisions>
## Implementation Decisions

### Badge visibility
- Subtle shade difference from tab background — understated, not loud
- Always show count, even when zero (show "0")
- Use tabular-nums for monospace numbers — prevents layout shift as counts change

### Claude's Discretion
- Exact badge shade (within "subtle" constraint)
- Badge appearance on selected vs unselected tabs — pick what looks best
- External link icon exact positioning and size
- Refresh button removal — straightforward deletion

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for link styling and badge implementation.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 22-quick-wins*
*Context gathered: 2026-02-03*
