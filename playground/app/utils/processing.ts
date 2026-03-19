import { DEFAULT_PROCESSING_DURATION_MS } from '@/constants/defaults'

export function calcProcessingProgress(
  processingStartedSimMs: number | null | undefined,
  elapsedMs: number,
): number {
  if (processingStartedSimMs == null) return 0
  const elapsed = elapsedMs - processingStartedSimMs
  return Math.max(0, Math.min(elapsed / DEFAULT_PROCESSING_DURATION_MS, 1))
}
