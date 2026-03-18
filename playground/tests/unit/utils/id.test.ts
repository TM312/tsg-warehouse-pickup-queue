import { describe, expect, it } from 'vitest'
import { generateId } from '@/utils/id'

describe('generateId', () => {
  it('returns a valid UUID string', () => {
    const id = generateId()
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })

  it('returns unique values on successive calls', () => {
    const ids = Array.from({ length: 100 }, () => generateId())
    expect(new Set(ids).size).toBe(100)
  })
})
