import { describe, it, expect } from 'vitest'

// Example utility function (placeholder for future utils)
function add(a: number, b: number): number {
  return a + b
}

describe('example utility', () => {
  it('adds two numbers', () => {
    expect(add(2, 3)).toBe(5)
  })

  it('handles negative numbers', () => {
    expect(add(-1, 1)).toBe(0)
  })
})
