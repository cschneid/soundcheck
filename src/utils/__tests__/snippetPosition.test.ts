import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getRandomStartPosition } from '../snippetPosition'

describe('getRandomStartPosition', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 0 when snippet equals track duration', () => {
    vi.mocked(Math.random).mockReturnValue(0.5)
    expect(getRandomStartPosition(10000, 10000)).toBe(0)
  })

  it('returns 0 when snippet exceeds track duration', () => {
    vi.mocked(Math.random).mockReturnValue(0.5)
    expect(getRandomStartPosition(5000, 10000)).toBe(0)
  })

  it('returns max start when random is 1', () => {
    vi.mocked(Math.random).mockReturnValue(0.999999)
    // 30s track, 10s snippet = max start at 20s
    expect(getRandomStartPosition(30000, 10000)).toBe(20000)
  })

  it('returns 0 when random is 0', () => {
    vi.mocked(Math.random).mockReturnValue(0)
    expect(getRandomStartPosition(30000, 10000)).toBe(0)
  })

  it('returns proportional position for mid random value', () => {
    vi.mocked(Math.random).mockReturnValue(0.5)
    // 30s track, 10s snippet = 20s max, floor(0.5 * 20001) = 10000
    expect(getRandomStartPosition(30000, 10000)).toBe(10000)
  })

  it('ensures snippet does not extend past track end', () => {
    for (let i = 0; i < 100; i++) {
      vi.mocked(Math.random).mockReturnValue(Math.random())
      const trackDuration = 60000
      const snippetDuration = 10000
      const start = getRandomStartPosition(trackDuration, snippetDuration)
      expect(start + snippetDuration).toBeLessThanOrEqual(trackDuration)
    }
  })
})
