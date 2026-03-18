import { ref, computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { PANEL_ID, BREAKPOINTS } from '@/constants/panels'
import type { PanelId } from '@/constants/panels'

const activePanel = ref<PanelId>(PANEL_ID.STAFF)
const customerOverlayOpen = ref(false)

export function useActivePanel() {
  const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINTS.DESKTOP}px)`)
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.MOBILE - 1}px)`)

  const breakpoint = computed<'mobile' | 'tablet' | 'desktop'>(() => {
    if (isDesktop.value) return 'desktop'
    if (isMobile.value) return 'mobile'
    return 'tablet'
  })

  function setActivePanel(id: PanelId) {
    activePanel.value = id
  }

  function toggleCustomerOverlay() {
    customerOverlayOpen.value = !customerOverlayOpen.value
  }

  return {
    activePanel,
    setActivePanel,
    customerOverlayOpen,
    toggleCustomerOverlay,
    breakpoint,
  }
}
