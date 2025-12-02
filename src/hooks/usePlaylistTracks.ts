import { useState, useEffect } from 'react'
import { SpotifyClient } from '../utils/spotify'
import type { SpotifyTrack } from '../types/spotify'

export interface PlaylistTracksResult {
  tracks: SpotifyTrack[]
  isLoading: boolean
  error: string | null
}

export function usePlaylistTracks(
  playlistId: string | null,
  accessToken: string | null
): PlaylistTracksResult {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!playlistId || !accessToken) {
      setTracks([])
      setError(null)
      return
    }

    let cancelled = false

    async function fetchTracks() {
      setIsLoading(true)
      setError(null)

      try {
        const client = new SpotifyClient(accessToken!)
        const result = await client.getPlaylistTracks(playlistId!)

        if (!cancelled) {
          setTracks(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load tracks')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchTracks()

    return () => {
      cancelled = true
    }
  }, [playlistId, accessToken])

  return { tracks, isLoading, error }
}
