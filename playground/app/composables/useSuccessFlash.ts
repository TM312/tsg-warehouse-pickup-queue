import { ref, onScopeDispose } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { ANIMATION } from '@/constants/animations'

export function useSuccessFlash(onComplete: () => void) {
  const showFlash = ref(false)
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  let timeout: ReturnType<typeof setTimeout> | null = null

  function triggerFlash() {
    if (prefersReducedMotion.value) {
      onComplete()
      return
    }

    cleanup()
    showFlash.value = true
    timeout = setTimeout(() => {
      showFlash.value = false
      timeout = null
      onComplete()
    }, ANIMATION.SUCCESS_FLASH_MS)
  }

  function cleanup() {
    if (timeout !== null) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  onScopeDispose(cleanup)

  return { showFlash, triggerFlash }
}
