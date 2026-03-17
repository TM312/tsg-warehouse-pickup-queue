import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { cn, valueUpdater } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })

  it('deduplicates conflicting tailwind classes', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6')
  })

  it('returns empty string for no input', () => {
    expect(cn()).toBe('')
  })
})

describe('valueUpdater', () => {
  it('sets a direct value on the ref', () => {
    const r = ref(0)
    valueUpdater(5, r)
    expect(r.value).toBe(5)
  })

  it('applies a function updater to the ref', () => {
    const r = ref(10)
    valueUpdater((prev: number) => prev + 1, r)
    expect(r.value).toBe(11)
  })
})
