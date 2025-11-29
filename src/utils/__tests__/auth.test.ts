import { describe, it, expect, beforeEach } from 'vitest'
import {
  parseAuthCallback,
  storeAuth,
  getStoredAuth,
  clearAuth,
  isExpired,
} from '../auth'

describe('auth utilities', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('parseAuthCallback', () => {
    it('extracts code from search params', () => {
      const search = '?code=abc123'
      const result = parseAuthCallback(search)
      expect(result).toBe('abc123')
    })

    it('returns null for empty search', () => {
      expect(parseAuthCallback('')).toBeNull()
    })

    it('returns null when error present', () => {
      const search = '?error=access_denied'
      expect(parseAuthCallback(search)).toBeNull()
    })

    it('returns null when no code', () => {
      const search = '?state=123'
      expect(parseAuthCallback(search)).toBeNull()
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
      const expiredAuth = {
        accessToken: 'old-token',
        expiresAt: Date.now() - 1000,
      }
      localStorage.setItem('spotify_auth', JSON.stringify(expiredAuth))

      expect(getStoredAuth()).toBeNull()
    })

    it('returns null for invalid JSON', () => {
      localStorage.setItem('spotify_auth', 'not-json')
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
      const almostExpired = Date.now() + 30000
      expect(isExpired(almostExpired)).toBe(true)
    })
  })
})
