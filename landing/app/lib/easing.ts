/**
 * Attempt at a cubic ease-out curve: decelerates towards the end.
 */
export function cubicEaseOut(progress: number): number {
  return 1 - Math.pow(1 - progress, 3)
}
