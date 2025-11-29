import { useState, useEffect, useCallback } from 'react'
import { SpotifyClient } from '../utils/spotify'
import type { SpotifyPlaylist } from '../types/spotify'

export interface PlaylistsResult {
  playlists: SpotifyPlaylist[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function usePlaylists(accessToken: string | null): PlaylistsResult {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPlaylists = useCallback(async () => {
    if (!accessToken) return

    setIsLoading(true)
    setError(null)

    try {
      const client = new SpotifyClient(accessToken)
      const result = await client.getUserPlaylists()
      setPlaylists(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch playlists')
      setPlaylists([])
    } finally {
      setIsLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    fetchPlaylists()
  }, [fetchPlaylists])

  return { playlists, isLoading, error, refetch: fetchPlaylists }
}
