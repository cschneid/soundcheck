import { describe, it, expect, beforeEach } from 'vitest'
import {
  getAuthUrl,
  parseAuthCallback,
  storeAuth,
  getStoredAuth,
  clearAuth,
  isExpired,
} from '../auth'

describe('auth utilities', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  describe('getAuthUrl', () => {
    it('constructs correct URL structure', () => {
      const url = getAuthUrl()
      expect(url).toContain('https://accounts.spotify.com/authorize')
      expect(url).toContain('client_id=')
    })

    it('includes all required scopes', () => {
      const url = getAuthUrl()
      expect(url).toContain('user-read-private')
      expect(url).toContain('streaming')
      expect(url).toContain('playlist-read-private')
    })

    it('includes redirect URI parameter', () => {
      const url = getAuthUrl()
      expect(url).toContain('redirect_uri=')
    })

    it('uses implicit grant (token response type)', () => {
      const url = getAuthUrl()
      expect(url).toContain('response_type=token')
    })
  })

  describe('parseAuthCallback', () => {
    it('extracts token from hash', () => {
      const hash = '#access_token=abc123&token_type=Bearer&expires_in=3600'
      const result = parseAuthCallback(hash)

      expect(result).toEqual({
        accessToken: 'abc123',
        expiresIn: 3600,
      })
    })

    it('returns null for empty hash', () => {
      expect(parseAuthCallback('')).toBeNull()
      expect(parseAuthCallback('#')).toBeNull()
    })

    it('returns null for missing token', () => {
      const hash = '#expires_in=3600'
      expect(parseAuthCallback(hash)).toBeNull()
    })

    it('returns null for missing expires_in', () => {
      const hash = '#access_token=abc123'
      expect(parseAuthCallback(hash)).toBeNull()
    })
  })

  describe('storeAuth / getStoredAuth', () => {
    it('stores and retrieves auth data', () => {
      storeAuth('test-token', 3600)
      const stored = getStoredAuth()

      expect(stored).not.toBeNull()
      expect(stored?.accessToken).toBe('test-token')
    })

    it('returns null when nothing stored', () => {
      expect(getStoredAuth()).toBeNull()
    })

    it('returns null for expired token', () => {
      // Store token that expires in the past
      const expiredAuth = {
        accessToken: 'old-token',
        expiresAt: Date.now() - 1000,
      }
      sessionStorage.setItem('spotify_auth', JSON.stringify(expiredAuth))

      expect(getStoredAuth()).toBeNull()
    })

    it('returns null for invalid JSON', () => {
      sessionStorage.setItem('spotify_auth', 'not-json')
      expect(getStoredAuth()).toBeNull()
    })
  })

  describe('clearAuth', () => {
    it('removes stored auth', () => {
      storeAuth('test-token', 3600)
      expect(getStoredAuth()).not.toBeNull()

      clearAuth()
      expect(getStoredAuth()).toBeNull()
    })
  })

  describe('isExpired', () => {
    it('returns false for future time', () => {
      const future = Date.now() + 3600000
      expect(isExpired(future)).toBe(false)
    })

    it('returns true for past time', () => {
      const past = Date.now() - 1000
      expect(isExpired(past)).toBe(true)
    })

    it('returns true within 60 second buffer', () => {
      const almostExpired = Date.now() + 30000 // 30 seconds
      expect(isExpired(almostExpired)).toBe(true)
    })
  })
})
