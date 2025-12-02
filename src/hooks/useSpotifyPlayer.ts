import { useState, useEffect, useRef, useCallback } from 'react'
import { loadSpotifySDK } from '../utils/loadSpotifySDK'
import type { SpotifyPlayer } from '../types/spotify-sdk'

export interface UseSpotifyPlayerReturn {
  player: SpotifyPlayer | null
  deviceId: string | null
  isReady: boolean
  error: string | null
}

export function useSpotifyPlayer(accessToken: string | null): UseSpotifyPlayerReturn {
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const playerRef = useRef<SpotifyPlayer | null>(null)

  const getToken = useCallback(
    (cb: (token: string) => void) => {
      if (accessToken) cb(accessToken)
    },
    [accessToken]
  )

  useEffect(() => {
    if (!accessToken) {
      // Clean up if token is removed
      if (playerRef.current) {
        playerRef.current.disconnect()
        playerRef.current = null
      }
      setDeviceId(null)
      setIsReady(false)
      return
    }

    let isMounted = true

    async function initPlayer() {
      try {
        await loadSpotifySDK()

        if (!isMounted) return

        const player = new window.Spotify.Player({
          name: 'SoundCheck',
          getOAuthToken: getToken,
          volume: 0.5,
        })

        player.addListener('ready', ({ device_id }) => {
          if (isMounted) {
            console.log('Spotify player ready, device ID:', device_id)
            setDeviceId(device_id)
            setIsReady(true)
            setError(null)
          }
        })

        player.addListener('not_ready', ({ device_id }) => {
          if (isMounted) {
            console.log('Spotify player not ready:', device_id)
            setIsReady(false)
          }
        })

        player.addListener('initialization_error', ({ message }) => {
          if (isMounted) {
            console.error('Spotify initialization error:', message)
            setError(`Initialization error: ${message}`)
          }
        })

        player.addListener('authentication_error', ({ message }) => {
          if (isMounted) {
            console.error('Spotify authentication error:', message)
            setError(`Authentication error: ${message}`)
          }
        })

        player.addListener('account_error', ({ message }) => {
          if (isMounted) {
            console.error('Spotify account error:', message)
            setError(`Account error: ${message}`)
          }
        })

        player.addListener('playback_error', ({ message }) => {
          if (isMounted) {
            console.error('Spotify playback error:', message)
            setError(`Playback error: ${message}`)
          }
        })

        const connected = await player.connect()
        if (isMounted) {
          if (connected) {
            playerRef.current = player
          } else {
            setError('Failed to connect to Spotify')
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize player')
        }
      }
    }

    initPlayer()

    return () => {
      isMounted = false
      if (playerRef.current) {
        playerRef.current.disconnect()
        playerRef.current = null
      }
    }
  }, [accessToken, getToken])

  return {
    player: playerRef.current,
    deviceId,
    isReady,
    error,
  }
}
