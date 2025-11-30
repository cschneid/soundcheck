import { describe, it, expect } from 'vitest'
import { parseError, getUserFriendlyMessage } from '../error'

describe('parseError', () => {
  it('parses network errors', () => {
    const error = new Error('Failed to fetch')
    const result = parseError(error)
    expect(result.type).toBe('network')
    expect(result.message).toContain('Connection lost')
  })

  it('parses 401 auth errors', () => {
    const error = new Error('Request failed: 401 Unauthorized')
    const result = parseError(error)
    expect(result.type).toBe('auth_expired')
    expect(result.message).toContain('Session expired')
  })

  it('parses 404 not found errors', () => {
    const error = new Error('HTTP 404')
    const result = parseError(error)
    expect(result.type).toBe('api')
    expect((result as { status: number }).status).toBe(404)
    expect(result.message).toContain('not found')
  })

  it('parses 403 forbidden errors', () => {
    const error = new Error('HTTP 403')
    const result = parseError(error)
    expect(result.type).toBe('api')
    expect((result as { status: number }).status).toBe(403)
    expect(result.message).toContain('denied')
  })

  it('parses 500 server errors', () => {
    const error = new Error('HTTP 500')
    const result = parseError(error)
    expect(result.type).toBe('api')
    expect((result as { status: number }).status).toBe(500)
    expect(result.message).toContain('Spotify')
  })

  it('parses playback errors', () => {
    const error = new Error('Playback failed')
    const result = parseError(error)
    expect(result.type).toBe('playback')
  })

  it('handles string errors', () => {
    const result = parseError('Something went wrong')
    expect(result.type).toBe('unknown')
    expect(result.message).toBe('Something went wrong')
  })

  it('handles unknown errors', () => {
    const result = parseError(null)
    expect(result.type).toBe('unknown')
  })
})

describe('getUserFriendlyMessage', () => {
  it('returns message for auth_expired', () => {
    const msg = getUserFriendlyMessage({ type: 'auth_expired', message: 'Test' })
    expect(msg).toBe('Test')
  })

  it('returns message for network', () => {
    const msg = getUserFriendlyMessage({ type: 'network', message: 'Test' })
    expect(msg).toBe('Test')
  })

  it('returns message for api', () => {
    const msg = getUserFriendlyMessage({ type: 'api', status: 500, message: 'Test' })
    expect(msg).toBe('Test')
  })

  it('returns message for playback', () => {
    const msg = getUserFriendlyMessage({ type: 'playback', message: 'Test' })
    expect(msg).toBe('Test')
  })

  it('returns message for unknown', () => {
    const msg = getUserFriendlyMessage({ type: 'unknown', message: 'Test' })
    expect(msg).toBe('Test')
  })
})
