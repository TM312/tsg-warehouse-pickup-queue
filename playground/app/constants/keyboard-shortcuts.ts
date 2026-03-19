export const SHORTCUT_KEY = {
  PLAY_PAUSE: ' ',
  SPEED_1: '1',
  SPEED_2: '2',
  SPEED_5: '5',
  RESET: 'r',
  TOUR: 't',
  HELP: '?',
} as const

export const SPEED_KEYS = new Set([SHORTCUT_KEY.SPEED_1, SHORTCUT_KEY.SPEED_2, SHORTCUT_KEY.SPEED_5])

export const SHORTCUT_DISPLAY = [
  { key: 'Space', description: 'Play / Pause' },
  { key: '1 / 2 / 5', description: 'Set speed' },
  { key: 'R', description: 'Reset simulation' },
  { key: 'T', description: 'Start guided tour' },
  { key: '?', description: 'Toggle this help' },
] as const
