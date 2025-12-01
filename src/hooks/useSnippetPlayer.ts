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
  const progressIntervalRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const pendingPlaybackRef = useRef<boolean>(false)

  const durationMs = durationSeconds * 1000

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
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

    // Progress update every 100ms
    progressIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const pct = Math.min(100, (elapsed / durationMs) * 100)
      setProgress(pct)
    }, 100)

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
        }
        // Otherwise, timers start when player_state_changed fires (see useEffect below)
      } catch (err) {
        pendingPlaybackRef.current = false
        setError(err instanceof Error ? err.message : 'Playback failed')
        setIsPlaying(false)
      }
    },
    [accessToken, deviceId, player, clearTimers, startTimers]
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
        startTimers()
      }
    }

    player.addListener('player_state_changed', handleStateChange)
    return () => {
      player.removeListener('player_state_changed', handleStateChange)
    }
  }, [player, startTimers])

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
