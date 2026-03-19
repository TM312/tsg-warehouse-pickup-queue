import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { TOAST_DURATION_MS, TOAST_STORAGE_KEY, TOAST_MESSAGES, TOAST_TYPES } from '@/constants/toasts'
import { useGuidedWalkthrough } from '@/composables/useGuidedWalkthrough'

const isMuted = ref(false)
let initialized = false

function readMutePreference(): boolean {
  try {
    return localStorage.getItem(TOAST_STORAGE_KEY.MUTED) === '1'
  } catch {
    return false
  }
}

function writeMutePreference(muted: boolean): void {
  try {
    localStorage.setItem(TOAST_STORAGE_KEY.MUTED, muted ? '1' : '0')
  } catch {
    // Storage unavailable — acceptable degradation
  }
}

function shouldSuppress(): boolean {
  const { isActive: walkthroughActive } = useGuidedWalkthrough()
  return isMuted.value || walkthroughActive.value
}

function fire(type: 'info' | 'success' | 'warning', message: string): void {
  if (shouldSuppress()) return
  toast[type](message, { duration: TOAST_DURATION_MS })
}

export function useSimulationToasts() {
  if (!initialized) {
    isMuted.value = readMutePreference()
    initialized = true
  }

  function notifySubmit(orderNumber: string) {
    fire(TOAST_TYPES.submit, TOAST_MESSAGES.submit(orderNumber))
  }

  function notifyApprove(orderNumber: string) {
    fire(TOAST_TYPES.approve, TOAST_MESSAGES.approve(orderNumber))
  }

  function notifyStartProcessing(gateNumber: number, orderNumber: string) {
    fire(TOAST_TYPES.start_processing, TOAST_MESSAGES.start_processing(gateNumber, orderNumber))
  }

  function notifyComplete(orderNumber: string) {
    fire(TOAST_TYPES.complete, TOAST_MESSAGES.complete(orderNumber))
  }

  function notifyGateOffline(gateNumber: number) {
    fire(TOAST_TYPES.gate_offline, TOAST_MESSAGES.gate_offline(gateNumber))
  }

  function toggleMute() {
    isMuted.value = !isMuted.value
    writeMutePreference(isMuted.value)
  }

  function setMuted(muted: boolean) {
    isMuted.value = muted
    writeMutePreference(muted)
  }

  return {
    isMuted,
    toggleMute,
    setMuted,
    notifySubmit,
    notifyApprove,
    notifyStartProcessing,
    notifyComplete,
    notifyGateOffline,
  }
}

/** @internal Reset module state — test use only */
export function _resetSimulationToasts() {
  isMuted.value = false
  initialized = false
}
