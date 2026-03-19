export const RESPONSIVE = {
  /** Very small screens where 2-col grids become 1-col */
  COMPACT_BREAKPOINT_PX: 400,
  /** WCAG minimum tap target for touch devices */
  TAP_TARGET_MIN_PX: 44,
  /** Activity feed max-height on mobile */
  ACTIVITY_FEED_MOBILE_MAX_H_PX: 160,
  /** Activity feed max-height on desktop/tablet */
  ACTIVITY_FEED_DEFAULT_MAX_H_PX: 240,
  /** SortableJS touch delay to distinguish scroll from drag */
  SORTABLE_TOUCH_DELAY_MS: 100,
  /** SortableJS touch start threshold in px */
  SORTABLE_TOUCH_THRESHOLD_PX: 5,
  /** Baseline height (px) of the phone frame used for overlay scaling */
  PHONE_FRAME_BASELINE_PX: 600,
  /** Fraction of overlay container height used for phone scaling */
  PHONE_FRAME_SCALE_RATIO: 0.8,
} as const
