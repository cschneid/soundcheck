import { useState, useEffect, useCallback } from 'react'
import {
  getAuthUrl,
  parseAuthCallback,
  exchangeCodeForToken,
  storeAuth,
  getStoredAuth,
  clearAuth,
} from '../utils/auth'
import type { StoredAuth } from '../utils/auth'

export interface AuthState {
  isAuthenticated: boolean
  accessToken: string | null
  expiresAt: number | null
  isLoading: boolean
  login: () => void
  logout: () => void
}

export function useAuth(): AuthState {
  const [auth, setAuth] = useState<StoredAuth | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for stored auth on mount and validate it's not expired
  useEffect(() => {
    const stored = getStoredAuth()
    if (stored) {
      // Check if token is expired (with 5 minute buffer)
      const bufferMs = 5 * 60 * 1000
      if (stored.expiresAt && stored.expiresAt < Date.now() + bufferMs) {
        clearAuth()
        setIsLoading(false)
        return
      }
      setAuth(stored)
      setIsLoading(false)
    }
  }, [])

  // Handle OAuth callback
  useEffect(() => {
    async function handleCallback() {
      if (window.location.pathname === '/callback') {
        const code = parseAuthCallback(window.location.search)
        console.log('Callback received, code:', code ? 'present' : 'missing')

        if (code) {
          const tokenResponse = await exchangeCodeForToken(code)
          console.log('Token response:', tokenResponse ? 'success' : 'failed')

          if (tokenResponse) {
            storeAuth(tokenResponse.access_token, tokenResponse.expires_in)
            setAuth({
              accessToken: tokenResponse.access_token,
              expiresAt: Date.now() + tokenResponse.expires_in * 1000,
            })
          }
        }

        // Clean up URL
        window.history.replaceState({}, '', '/')
        setIsLoading(false)
      } else {
        setIsLoading(false)
      }
    }

    handleCallback()
  }, [])

  const login = useCallback(async () => {
    const url = await getAuthUrl()
    window.location.href = url
  }, [])

  const logout = useCallback(() => {
    clearAuth()
    setAuth(null)
  }, [])

  return {
    isAuthenticated: auth !== null,
    accessToken: auth?.accessToken ?? null,
    expiresAt: auth?.expiresAt ?? null,
    isLoading,
    login,
    logout,
  }
}
