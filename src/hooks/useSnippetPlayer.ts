import { useState, useRef, useCallback, useEffect } from 'react'
import { SpotifyClient } from '../utils/spotify'
import { getRandomStartPosition } from '../utils/snippetPosition'
import type { SpotifyTrack } from '../types/spotify'
import '../types/spotify-sdk.d.ts'

export interface UseSnippetPlayerReturn {
  play: (track: SpotifyTrack) => Promise<void>
  replay: () => Promise<void>
  stop: () => void
  isPlaying: boolean
  progress: number // 0-100
  error: string | null
}

export function useSnippetPlayer(
  accessToken: string | null,
  deviceId: string | null,
  durationSeconds: number,
  player: Spotify.Player | null = null
): UseSnippetPlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const currentTrackRef = useRef<SpotifyTrack | null>(null)
  const startPositionRef = useRef<number>(0)
  const timerRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const pendingPlaybackRef = useRef<boolean>(false)
  const playbackTimeoutRef = useRef<number | null>(null)

  const durationMs = durationSeconds * 1000
  const PLAYBACK_TIMEOUT_MS = 5000 // 5 seconds to detect playback failure

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current)
      playbackTimeoutRef.current = null
    }
  }, [])

  const stop = useCallback(async () => {
    clearTimers()
    setIsPlaying(false)
    setProgress(0)

    if (accessToken && deviceId) {
      try {
        const client = new SpotifyClient(accessToken)
        await client.pausePlayback(deviceId)
      } catch {
        // Ignore pause errors
      }
    }
  }, [accessToken, deviceId, clearTimers])

  const startTimers = useCallback(() => {
    startTimeRef.current = Date.now()

    // Progress update via requestAnimationFrame for smoother animation
    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current
      const pct = Math.min(100, (elapsed / durationMs) * 100)
      setProgress(pct)
      if (elapsed < durationMs) {
        rafRef.current = requestAnimationFrame(updateProgress)
      }
    }
    rafRef.current = requestAnimationFrame(updateProgress)

    // Auto-stop after duration
    timerRef.current = window.setTimeout(async () => {
      await stop()
    }, durationMs)
  }, [durationMs, stop])

  const startPlaybackWithTimer = useCallback(
    async (track: SpotifyTrack, positionMs: number) => {
      if (!accessToken || !deviceId) {
        setError('Player not ready')
        return
      }

      setError(null)
      setProgress(0)
      clearTimers()
      pendingPlaybackRef.current = true

      try {
        const client = new SpotifyClient(accessToken)
        await client.startPlayback(deviceId, track.uri, positionMs)

        setIsPlaying(true)

        // If no player instance, fall back to starting timers immediately
        if (!player) {
          pendingPlaybackRef.current = false
          startTimers()
        } else {
          // Set timeout to detect if playback never starts
          playbackTimeoutRef.current = window.setTimeout(() => {
            if (pendingPlaybackRef.current) {
              pendingPlaybackRef.current = false
              setError('Track failed to play - may be unavailable')
              setIsPlaying(false)
            }
          }, PLAYBACK_TIMEOUT_MS)
        }
      } catch (err) {
        pendingPlaybackRef.current = false
        setError(err instanceof Error ? err.message : 'Playback failed')
        setIsPlaying(false)
      }
    },
    [accessToken, deviceId, player, clearTimers, startTimers, PLAYBACK_TIMEOUT_MS]
  )

  const play = useCallback(
    async (track: SpotifyTrack) => {
      currentTrackRef.current = track
      const randomStart = getRandomStartPosition(track.duration_ms, durationMs)
      startPositionRef.current = randomStart
      await startPlaybackWithTimer(track, randomStart)
    },
    [durationMs, startPlaybackWithTimer]
  )

  const replay = useCallback(async () => {
    if (!currentTrackRef.current) {
      setError('No track to replay')
      return
    }
    await startPlaybackWithTimer(currentTrackRef.current, startPositionRef.current)
  }, [startPlaybackWithTimer])

  // Listen for player state changes to start timers when playback actually begins
  useEffect(() => {
    if (!player) return

    const handleStateChange = (state: Spotify.PlaybackState | null) => {
      if (state && !state.paused && pendingPlaybackRef.current) {
        pendingPlaybackRef.current = false
        // Clear the timeout since playback started successfully
        if (playbackTimeoutRef.current) {
          clearTimeout(playbackTimeoutRef.current)
          playbackTimeoutRef.current = null
        }
        startTimers()
      }
    }

    const handlePlaybackError = ({ message }: Spotify.ErrorState) => {
      if (pendingPlaybackRef.current || isPlaying) {
        pendingPlaybackRef.current = false
        clearTimers()
        setError(`Playback error: ${message}`)
        setIsPlaying(false)
      }
    }

    player.addListener('player_state_changed', handleStateChange)
    player.addListener('playback_error', handlePlaybackError)
    return () => {
      player.removeListener('player_state_changed')
      player.removeListener('playback_error')
    }
  }, [player, startTimers, isPlaying, clearTimers])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [clearTimers])

  return {
    play,
    replay,
    stop,
    isPlaying,
    progress,
    error,
  }
}
