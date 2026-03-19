export const QUEUE_HISTORY = {
  SAMPLE_INTERVAL_MS: 5_000,
  MAX_POINTS: 120,
} as const

// OKLCH values duplicated from tailwind.css because Unovis SVG cannot resolve CSS var()
export const GATE_CHART_COLORS = {
  light: [
    'oklch(0.646 0.222 41.116)',   // --chart-1 (warm orange)
    'oklch(0.6 0.118 184.704)',    // --chart-2 (teal)
    'oklch(0.398 0.07 227.392)',   // --chart-3 (dark blue-gray)
  ],
  dark: [
    'oklch(0.488 0.243 264.376)',  // --chart-1 dark
    'oklch(0.696 0.17 162.48)',    // --chart-2 dark
    'oklch(0.769 0.188 70.08)',    // --chart-3 dark
  ],
} as const

export const CHART_HEIGHT_PX = 120
