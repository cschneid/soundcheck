import { useState, useCallback, useMemo } from 'react'
import { selectRandom } from '../utils/shuffle'
import type { SpotifyTrack } from '../types/spotify'
import type { GameState, GameSettings, RoundResult } from '../types/game'
import { DEFAULT_SETTINGS } from '../types/game'

interface Score {
  artist: number
  title: number
  total: number
  max: number
}

export interface UseGameStateReturn {
  state: GameState
  startGame: (tracks: SpotifyTrack[], settings?: Partial<GameSettings>) => void
  submitAnswer: (artistAnswer: string, titleAnswer: string, artistCorrect: boolean, titleCorrect: boolean) => void
  nextRound: () => void
  resetGame: () => void
  currentTrack: SpotifyTrack | null
  score: Score
  isLastRound: boolean
}

const initialState: GameState = {
  phase: 'setup',
  tracks: [],
  currentRoundIndex: 0,
  results: [],
  settings: DEFAULT_SETTINGS,
}

export function useGameState(): UseGameStateReturn {
  const [state, setState] = useState<GameState>(initialState)

  const startGame = useCallback(
    (tracks: SpotifyTrack[], settings?: Partial<GameSettings>) => {
      const mergedSettings = { ...DEFAULT_SETTINGS, ...settings }
      const selectedTracks = selectRandom(tracks, mergedSettings.roundCount)

      setState({
        phase: 'playing',
        tracks: selectedTracks,
        currentRoundIndex: 0,
        results: [],
        settings: mergedSettings,
      })
    },
    []
  )

  const submitAnswer = useCallback(
    (artistAnswer: string, titleAnswer: string, artistCorrect: boolean, titleCorrect: boolean) => {
      setState((prev) => {
        if (prev.phase !== 'playing') return prev

        const currentTrack = prev.tracks[prev.currentRoundIndex]
        if (!currentTrack) return prev

        const result: RoundResult = {
          track: currentTrack,
          artistAnswer,
          titleAnswer,
          artistCorrect,
          titleCorrect,
        }

        return {
          ...prev,
          results: [...prev.results, result],
        }
      })
    },
    []
  )

  const nextRound = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'playing') return prev

      const nextIndex = prev.currentRoundIndex + 1
      const isComplete = nextIndex >= prev.tracks.length

      return {
        ...prev,
        currentRoundIndex: nextIndex,
        phase: isComplete ? 'complete' : 'playing',
      }
    })
  }, [])

  const resetGame = useCallback(() => {
    setState(initialState)
  }, [])

  const currentTrack = useMemo(() => {
    if (state.phase !== 'playing') return null
    return state.tracks[state.currentRoundIndex] ?? null
  }, [state.phase, state.tracks, state.currentRoundIndex])

  const score = useMemo((): Score => {
    const artist = state.results.filter((r) => r.artistCorrect).length
    const title = state.results.filter((r) => r.titleCorrect).length
    return {
      artist,
      title,
      total: artist + title,
      max: state.tracks.length * 2,
    }
  }, [state.results, state.tracks.length])

  const isLastRound = useMemo(() => {
    return state.currentRoundIndex === state.tracks.length - 1
  }, [state.currentRoundIndex, state.tracks.length])

  return {
    state,
    startGame,
    submitAnswer,
    nextRound,
    resetGame,
    currentTrack,
    score,
    isLastRound,
  }
}
