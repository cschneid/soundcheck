import { useState, useEffect } from 'react'
import { SpotifyClient } from '../utils/spotify'
import type { SpotifyUser } from '../types/spotify'

export interface PremiumCheckResult {
  isLoading: boolean
  isPremium: boolean | null
  user: SpotifyUser | null
  error: string | null
}

export function usePremiumCheck(accessToken: string | null): PremiumCheckResult {
  const [isLoading, setIsLoading] = useState(true)
  const [isPremium, setIsPremium] = useState<boolean | null>(null)
  const [user, setUser] = useState<SpotifyUser | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken) {
      setIsLoading(false)
      setIsPremium(null)
      setUser(null)
      return
    }

    async function checkPremium() {
      setIsLoading(true)
      setError(null)

      try {
        const client = new SpotifyClient(accessToken)
        const currentUser = await client.getCurrentUser()
        setUser(currentUser)
        setIsPremium(currentUser.product === 'premium')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check premium status')
        setIsPremium(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkPremium()
  }, [accessToken])

  return { isLoading, isPremium, user, error }
}
