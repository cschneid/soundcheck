import { useState, useEffect, useCallback } from 'react'
import {
  getAuthUrl,
  parseAuthCallback,
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

  // Check for stored auth on mount
  useEffect(() => {
    const stored = getStoredAuth()
    setAuth(stored)
    setIsLoading(false)
  }, [])

  // Handle OAuth callback
  useEffect(() => {
    if (window.location.pathname === '/callback') {
      const result = parseAuthCallback(window.location.hash)
      if (result) {
        storeAuth(result.accessToken, result.expiresIn)
        setAuth({
          accessToken: result.accessToken,
          expiresAt: Date.now() + result.expiresIn * 1000,
        })
        // Clean up URL
        window.history.replaceState({}, '', '/')
      } else {
        // Auth failed, redirect home
        window.history.replaceState({}, '', '/')
      }
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(() => {
    window.location.href = getAuthUrl()
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
