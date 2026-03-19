import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick, effectScope } from 'vue'

vi.mock('@vueuse/core', () => ({
  useMediaQuery: vi.fn(() => ref(false)),
}))

import { useMediaQuery } from '@vueuse/core'
import { useProcessingPulse } from '@/composables/useProcessingPulse'
import { ANIMATION } from '@/constants/animations'

type Row = { gateId: string; request: { id: string } | null }

describe('useProcessingPulse', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(useMediaQuery).mockReturnValue(ref(false))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('pulse triggering', () => {
    it('pulses when a new request appears on a gate', async () => {
      const scope = effectScope()
      let rows: ReturnType<typeof ref<Row[]>>
      let pulse: ReturnType<typeof useProcessingPulse>

      scope.run(() => {
        rows = ref([{ gateId: 'g1', request: null }])
        pulse = useProcessingPulse(rows)
      })

      rows!.value = [{ gateId: 'g1', request: { id: 'r1' } }]
      await nextTick()

      expect(pulse!.isPulsing('g1')).toBe(true)

      scope.stop()
    })

    it('does not pulse for requests present at initialization', async () => {
      const scope = effectScope()
      let rows: ReturnType<typeof ref<Row[]>>
      let pulse: ReturnType<typeof useProcessingPulse>

      scope.run(() => {
        rows = ref([{ gateId: 'g1', request: { id: 'r1' } }])
        pulse = useProcessingPulse(rows)
      })

      // Trigger watch with same data
      rows!.value = [{ gateId: 'g1', request: { id: 'r1' } }]
      await nextTick()

      expect(pulse!.isPulsing('g1')).toBe(false)

      scope.stop()
    })

    it('does not pulse when request is removed (gate goes idle)', async () => {
      const scope = effectScope()
      let rows: ReturnType<typeof ref<Row[]>>
      let pulse: ReturnType<typeof useProcessingPulse>

      scope.run(() => {
        rows = ref([{ gateId: 'g1', request: { id: 'r1' } }])
        pulse = useProcessingPulse(rows)
      })

      rows!.value = [{ gateId: 'g1', request: null }]
      await nextTick()

      expect(pulse!.isPulsing('g1')).toBe(false)

      scope.stop()
    })

    it('pulses when request changes to a different one', async () => {
      const scope = effectScope()
      let rows: ReturnType<typeof ref<Row[]>>
      let pulse: ReturnType<typeof useProcessingPulse>

      scope.run(() => {
        rows = ref([{ gateId: 'g1', request: { id: 'r1' } }])
        pulse = useProcessingPulse(rows)
      })

      rows!.value = [{ gateId: 'g1', request: { id: 'r2' } }]
      await nextTick()

      expect(pulse!.isPulsing('g1')).toBe(true)

      scope.stop()
    })
  })

  describe('pulse expiry', () => {
    it('clears pulse after PROCESSING_PULSE_MS elapses', async () => {
      const scope = effectScope()
      let rows: ReturnType<typeof ref<Row[]>>
      let pulse: ReturnType<typeof useProcessingPulse>

      scope.run(() => {
        rows = ref([{ gateId: 'g1', request: null }])
        pulse = useProcessingPulse(rows)
      })

      rows!.value = [{ gateId: 'g1', request: { id: 'r1' } }]
      await nextTick()
      expect(pulse!.isPulsing('g1')).toBe(true)

      vi.advanceTimersByTime(ANIMATION.PROCESSING_PULSE_MS)
      expect(pulse!.isPulsing('g1')).toBe(false)

      scope.stop()
    })

    it('resets timeout when same gate receives another new request before expiry', async () => {
      const scope = effectScope()
      let rows: ReturnType<typeof ref<Row[]>>
      let pulse: ReturnType<typeof useProcessingPulse>

      scope.run(() => {
        rows = ref([{ gateId: 'g1', request: null }])
        pulse = useProcessingPulse(rows)
      })

      // First pulse
      rows!.value = [{ gateId: 'g1', request: { id: 'r1' } }]
      await nextTick()
      expect(pulse!.isPulsing('g1')).toBe(true)

      // Advance partway through the pulse
      vi.advanceTimersByTime(ANIMATION.PROCESSING_PULSE_MS - 100)
      expect(pulse!.isPulsing('g1')).toBe(true)

      // New request on same gate resets the timer
      rows!.value = [{ gateId: 'g1', request: { id: 'r2' } }]
      await nextTick()
      expect(pulse!.isPulsing('g1')).toBe(true)

      // Original timer would have expired — but pulse should still be active
      vi.advanceTimersByTime(100)
      expect(pulse!.isPulsing('g1')).toBe(true)

      // Full duration from re-pulse
      vi.advanceTimersByTime(ANIMATION.PROCESSING_PULSE_MS - 100)
      expect(pulse!.isPulsing('g1')).toBe(false)

      scope.stop()
    })

    it('can re-pulse a gate after its previous pulse has expired', async () => {
      const scope = effectScope()
      let rows: ReturnType<typeof ref<Row[]>>
      let pulse: ReturnType<typeof useProcessingPulse>

      scope.run(() => {
        rows = ref([{ gateId: 'g1', request: null }])
        pulse = useProcessingPulse(rows)
      })

      // First pulse cycle
      rows!.value = [{ gateId: 'g1', request: { id: 'r1' } }]
      await nextTick()
      vi.advanceTimersByTime(ANIMATION.PROCESSING_PULSE_MS)
      expect(pulse!.isPulsing('g1')).toBe(false)

      // Second pulse cycle with new request
      rows!.value = [{ gateId: 'g1', request: { id: 'r2' } }]
      await nextTick()
      expect(pulse!.isPulsing('g1')).toBe(true)

      vi.advanceTimersByTime(ANIMATION.PROCESSING_PULSE_MS)
      expect(pulse!.isPulsing('g1')).toBe(false)

      scope.stop()
    })
  })

  describe('multiple gates', () => {
    it('tracks pulse state independently per gate', async () => {
      const scope = effectScope()
      let rows: ReturnType<typeof ref<Row[]>>
      let pulse: ReturnType<typeof useProcessingPulse>

      scope.run(() => {
        rows = ref([
          { gateId: 'g1', request: null },
          { gateId: 'g2', request: null },
        ])
        pulse = useProcessingPulse(rows)
      })

      // Only g1 gets a request
      rows!.value = [
        { gateId: 'g1', request: { id: 'r1' } },
        { gateId: 'g2', request: null },
      ]
      await nextTick()

      expect(pulse!.isPulsing('g1')).toBe(true)
      expect(pulse!.isPulsing('g2')).toBe(false)

      scope.stop()
    })

    it('allows multiple gates to pulse simultaneously', async () => {
      const scope = effectScope()
      let rows: ReturnType<typeof ref<Row[]>>
      let pulse: ReturnType<typeof useProcessingPulse>

      scope.run(() => {
        rows = ref([
          { gateId: 'g1', request: null },
          { gateId: 'g2', request: null },
        ])
        pulse = useProcessingPulse(rows)
      })

      rows!.value = [
        { gateId: 'g1', request: { id: 'r1' } },
        { gateId: 'g2', request: { id: 'r2' } },
      ]
      await nextTick()

      expect(pulse!.isPulsing('g1')).toBe(true)
      expect(pulse!.isPulsing('g2')).toBe(true)

      scope.stop()
    })

    it('expires gate pulses independently', async () => {
      const scope = effectScope()
      let rows: ReturnType<typeof ref<Row[]>>
      let pulse: ReturnType<typeof useProcessingPulse>

      scope.run(() => {
        rows = ref([
          { gateId: 'g1', request: null },
          { gateId: 'g2', request: null },
        ])
        pulse = useProcessingPulse(rows)
      })

      // g1 gets a request first
      rows!.value = [
        { gateId: 'g1', request: { id: 'r1' } },
        { gateId: 'g2', request: null },
      ]
      await nextTick()

      // Halfway through g1's pulse, g2 starts
      vi.advanceTimersByTime(ANIMATION.PROCESSING_PULSE_MS / 2)
      rows!.value = [
        { gateId: 'g1', request: { id: 'r1' } },
        { gateId: 'g2', request: { id: 'r2' } },
      ]
      await nextTick()

      // g1 expires, g2 still pulsing
      vi.advanceTimersByTime(ANIMATION.PROCESSING_PULSE_MS / 2)
      expect(pulse!.isPulsing('g1')).toBe(false)
      expect(pulse!.isPulsing('g2')).toBe(true)

      // g2 expires
      vi.advanceTimersByTime(ANIMATION.PROCESSING_PULSE_MS / 2)
      expect(pulse!.isPulsing('g2')).toBe(false)

      scope.stop()
    })
  })

  describe('reduced motion', () => {
    it('skips pulse when reduced-motion is active', async () => {
      vi.mocked(useMediaQuery).mockReturnValue(ref(true))

      const scope = effectScope()
      let rows: ReturnType<typeof ref<Row[]>>
      let pulse: ReturnType<typeof useProcessingPulse>

      scope.run(() => {
        rows = ref([{ gateId: 'g1', request: null }])
        pulse = useProcessingPulse(rows)
      })

      rows!.value = [{ gateId: 'g1', request: { id: 'r1' } }]
      await nextTick()

      expect(pulse!.isPulsing('g1')).toBe(false)

      scope.stop()
    })

    it('does not false-pulse when reduced-motion is disabled after requests arrived', async () => {
      const reducedMotion = ref(true)
      vi.mocked(useMediaQuery).mockReturnValue(reducedMotion)

      const scope = effectScope()
      let rows: ReturnType<typeof ref<Row[]>>
      let pulse: ReturnType<typeof useProcessingPulse>

      scope.run(() => {
        rows = ref([{ gateId: 'g1', request: null }])
        pulse = useProcessingPulse(rows)
      })

      // Request arrives while reduced-motion is active — no pulse, but tracked
      rows!.value = [{ gateId: 'g1', request: { id: 'r1' } }]
      await nextTick()
      expect(pulse!.isPulsing('g1')).toBe(false)

      // User disables reduced-motion; same request is still present
      reducedMotion.value = false
      rows!.value = [{ gateId: 'g1', request: { id: 'r1' } }]
      await nextTick()

      // Should not pulse — request was already tracked
      expect(pulse!.isPulsing('g1')).toBe(false)

      scope.stop()
    })
  })

  describe('cleanup', () => {
    it('clears all pending timeouts on scope dispose', async () => {
      const scope = effectScope()
      let rows: ReturnType<typeof ref<Row[]>>

      scope.run(() => {
        rows = ref([
          { gateId: 'g1', request: null },
          { gateId: 'g2', request: null },
        ])
        useProcessingPulse(rows)
      })

      rows!.value = [
        { gateId: 'g1', request: { id: 'r1' } },
        { gateId: 'g2', request: { id: 'r2' } },
      ]
      await nextTick()

      // Dispose should clear timeouts without errors
      expect(() => scope.stop()).not.toThrow()
    })
  })
})
