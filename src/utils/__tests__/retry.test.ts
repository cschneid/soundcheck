import { describe, it, expect, vi } from 'vitest'
import { withRetry } from '../retry'

describe('withRetry', () => {
  it('returns result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('success')
    const result = await withRetry(fn)
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retries on failure and succeeds', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('success')

    const result = await withRetry(fn, 3, 10)
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('retries max attempts then throws', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('persistent fail'))

    await expect(withRetry(fn, 3, 10)).rejects.toThrow('persistent fail')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('does not retry on 401 auth errors', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('401 Unauthorized'))

    await expect(withRetry(fn, 3, 10)).rejects.toThrow('401')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('does not retry on 404 not found errors', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('404 Not Found'))

    await expect(withRetry(fn, 3, 10)).rejects.toThrow('404')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('uses exponential backoff', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('success')

    const start = Date.now()
    await withRetry(fn, 3, 50)
    const elapsed = Date.now() - start

    // Should have waited at least 50ms (first backoff) + 100ms (second backoff) = 150ms
    // Allow some slack for timing
    expect(elapsed).toBeGreaterThanOrEqual(100)
    expect(fn).toHaveBeenCalledTimes(3)
  })
})
