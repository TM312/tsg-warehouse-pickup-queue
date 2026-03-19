import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { SHORTCUT_DISPLAY } from '@/constants/keyboard-shortcuts'

const isHelpVisible = ref(false)
const hideHelp = vi.fn()

vi.mock('@/composables/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: () => ({
    isHelpVisible,
    hideHelp,
  }),
}))

// Must import after mocks
const { default: KeyboardShortcutOverlay } = await import(
  '@/components/scenario/KeyboardShortcutOverlay.vue'
)

describe('KeyboardShortcutOverlay', () => {
  beforeEach(() => {
    isHelpVisible.value = false
    hideHelp.mockClear()
  })

  it('does not render when isHelpVisible is false', () => {
    const wrapper = mount(KeyboardShortcutOverlay, {
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.find('[data-testid="keyboard-shortcut-overlay"]').exists()).toBe(false)
  })

  it('renders when isHelpVisible is true', async () => {
    isHelpVisible.value = true
    const wrapper = mount(KeyboardShortcutOverlay, {
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.find('[data-testid="keyboard-shortcut-overlay"]').exists()).toBe(true)
  })

  it('displays all SHORTCUT_DISPLAY entries', () => {
    isHelpVisible.value = true
    const wrapper = mount(KeyboardShortcutOverlay, {
      global: { stubs: { Teleport: true } },
    })
    const kbds = wrapper.findAll('kbd')
    expect(kbds).toHaveLength(SHORTCUT_DISPLAY.length)

    for (const shortcut of SHORTCUT_DISPLAY) {
      expect(wrapper.text()).toContain(shortcut.key)
      expect(wrapper.text()).toContain(shortcut.description)
    }
  })

  it('click on overlay calls hideHelp', async () => {
    isHelpVisible.value = true
    const wrapper = mount(KeyboardShortcutOverlay, {
      global: { stubs: { Teleport: true } },
    })
    await wrapper.find('[data-testid="keyboard-shortcut-overlay"]').trigger('click')
    expect(hideHelp).toHaveBeenCalledOnce()
  })
})
