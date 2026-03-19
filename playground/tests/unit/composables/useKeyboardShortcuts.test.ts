import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useSimulationStore } from '@/stores/simulation'

const walkthroughIsActive = { value: false }
const walkthroughStart = vi.fn()
const resetAllMock = vi.fn()
const stopScenarioMock = vi.fn()

vi.mock('@/composables/useGuidedWalkthrough', () => ({
  useGuidedWalkthrough: () => ({
    isActive: walkthroughIsActive,
    start: walkthroughStart,
  }),
}))

vi.mock('@/composables/useSimulationActions', () => ({
  useSimulationActions: () => ({
    resetAll: resetAllMock,
  }),
}))

vi.mock('@/composables/useScenarioRunner', () => ({
  useScenarioRunner: () => ({
    stopScenario: stopScenarioMock,
  }),
}))

function fireKey(key: string, opts: Partial<KeyboardEventInit> = {}) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, ...opts })
  window.dispatchEvent(event)
  return event
}

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    walkthroughIsActive.value = false
    walkthroughStart.mockClear()
    resetAllMock.mockClear()
    stopScenarioMock.mockClear()
    const { init } = useKeyboardShortcuts()
    init()
  })

  afterEach(() => {
    const { destroy } = useKeyboardShortcuts()
    destroy()
    vi.restoreAllMocks()
  })

  it('Space calls registered toggle', () => {
    const toggleMock = vi.fn()
    const { registerSimulationToggle } = useKeyboardShortcuts()
    registerSimulationToggle(toggleMock)

    fireKey(' ')
    expect(toggleMock).toHaveBeenCalledOnce()
  })

  it('Space calls preventDefault to prevent page scroll', () => {
    const toggleMock = vi.fn()
    const { registerSimulationToggle } = useKeyboardShortcuts()
    registerSimulationToggle(toggleMock)

    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    const spy = vi.spyOn(event, 'preventDefault')
    window.dispatchEvent(event)
    expect(spy).toHaveBeenCalled()
  })

  it.each([
    ['1', 1],
    ['2', 2],
    ['5', 5],
  ] as const)('key %s sets simulation speed to %d', (key, speed) => {
    const store = useSimulationStore()
    fireKey(key)
    expect(store.speed).toBe(speed)
  })

  it.each(['3', '4', '6', '0'])('non-valid number key %s is ignored', (key) => {
    const store = useSimulationStore()
    const initialSpeed = store.speed
    fireKey(key)
    expect(store.speed).toBe(initialSpeed)
  })

  it('R triggers confirm and resetAll on accept', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    fireKey('r')

    expect(window.confirm).toHaveBeenCalled()
    expect(stopScenarioMock).toHaveBeenCalled()
    expect(resetAllMock).toHaveBeenCalled()
  })

  it('R does nothing on confirm cancel', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    fireKey('r')

    expect(resetAllMock).not.toHaveBeenCalled()
  })

  it('T starts walkthrough', () => {
    fireKey('t')
    expect(walkthroughStart).toHaveBeenCalled()
  })

  it('? toggles help visibility', () => {
    const { isHelpVisible } = useKeyboardShortcuts()
    expect(isHelpVisible.value).toBe(false)

    fireKey('?')
    expect(isHelpVisible.value).toBe(true)

    fireKey('?')
    // After first ?, help is visible. Next key dismisses it (help dismiss first rule)
    expect(isHelpVisible.value).toBe(false)
  })

  it('any key dismisses help when visible, no action dispatched', () => {
    const { isHelpVisible, showHelp } = useKeyboardShortcuts()
    const toggleMock = vi.fn()
    const { registerSimulationToggle } = useKeyboardShortcuts()
    registerSimulationToggle(toggleMock)

    showHelp()
    expect(isHelpVisible.value).toBe(true)

    fireKey(' ')
    expect(isHelpVisible.value).toBe(false)
    expect(toggleMock).not.toHaveBeenCalled()
  })

  it('shortcuts disabled when INPUT is focused', () => {
    const toggleMock = vi.fn()
    const { registerSimulationToggle } = useKeyboardShortcuts()
    registerSimulationToggle(toggleMock)

    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    fireKey(' ')
    expect(toggleMock).not.toHaveBeenCalled()

    document.body.removeChild(input)
  })

  it('shortcuts disabled when TEXTAREA is focused', () => {
    const toggleMock = vi.fn()
    const { registerSimulationToggle } = useKeyboardShortcuts()
    registerSimulationToggle(toggleMock)

    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    textarea.focus()

    fireKey(' ')
    expect(toggleMock).not.toHaveBeenCalled()

    document.body.removeChild(textarea)
  })

  it('shortcuts disabled when walkthrough is active', () => {
    const toggleMock = vi.fn()
    const { registerSimulationToggle } = useKeyboardShortcuts()
    registerSimulationToggle(toggleMock)

    walkthroughIsActive.value = true

    fireKey(' ')
    expect(toggleMock).not.toHaveBeenCalled()
  })

  it('help dismiss works during walkthrough', () => {
    const { isHelpVisible, showHelp } = useKeyboardShortcuts()
    walkthroughIsActive.value = true

    showHelp()
    expect(isHelpVisible.value).toBe(true)

    fireKey(' ')
    expect(isHelpVisible.value).toBe(false)
  })

  it('modifier keys are ignored (Ctrl+R does not trigger reset)', () => {
    const confirmSpy = vi.spyOn(window, 'confirm')

    fireKey('r', { ctrlKey: true })
    expect(confirmSpy).not.toHaveBeenCalled()
  })

  it('destroy removes listener', () => {
    const toggleMock = vi.fn()
    const { registerSimulationToggle, destroy } = useKeyboardShortcuts()
    registerSimulationToggle(toggleMock)

    destroy()

    fireKey(' ')
    expect(toggleMock).not.toHaveBeenCalled()
  })

  it('init is idempotent — double init fires handler once', () => {
    const toggleMock = vi.fn()
    const { registerSimulationToggle, init } = useKeyboardShortcuts()
    registerSimulationToggle(toggleMock)

    init()
    init()

    fireKey(' ')
    expect(toggleMock).toHaveBeenCalledTimes(1)
  })
})
