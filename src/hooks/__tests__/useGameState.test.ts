import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGameState } from '../useGameState'
import type { SpotifyTrack } from '../../types/spotify'

const mockTracks: SpotifyTrack[] = Array.from({ length: 10 }, (_, i) => ({
  id: `track-${i}`,
  name: `Track ${i}`,
  artists: [{ id: `artist-${i}`, name: `Artist ${i}` }],
  album: { name: `Album ${i}`, images: [] },
  duration_ms: 180000,
  uri: `spotify:track:${i}`,
}))

describe('useGameState', () => {
  it('initializes in setup phase', () => {
    const { result } = renderHook(() => useGameState())

    expect(result.current.state.phase).toBe('setup')
    expect(result.current.state.tracks).toEqual([])
    expect(result.current.state.currentRoundIndex).toBe(0)
    expect(result.current.state.results).toEqual([])
  })

  it('transitions to playing on startGame', () => {
    const { result } = renderHook(() => useGameState())

    act(() => {
      result.current.startGame(mockTracks)
    })

    expect(result.current.state.phase).toBe('playing')
  })

  it('shuffles and limits tracks to roundCount', () => {
    const { result } = renderHook(() => useGameState())

    act(() => {
      result.current.startGame(mockTracks, { roundCount: 5 })
    })

    expect(result.current.state.tracks.length).toBe(5)
  })

  it('uses default settings when none provided', () => {
    const { result } = renderHook(() => useGameState())

    act(() => {
      result.current.startGame(mockTracks)
    })

    expect(result.current.state.settings.roundCount).toBe(8)
    expect(result.current.state.settings.snippetDuration).toBe(10)
  })

  it('tracks current round correctly', () => {
    const { result } = renderHook(() => useGameState())

    act(() => {
      result.current.startGame(mockTracks, { roundCount: 3 })
    })

    expect(result.current.state.currentRoundIndex).toBe(0)
    expect(result.current.currentTrack).toBe(result.current.state.tracks[0])
  })

  it('stores submitted answers', () => {
    const { result } = renderHook(() => useGameState())

    act(() => {
      result.current.startGame(mockTracks, { roundCount: 3 })
    })

    act(() => {
      result.current.submitAnswer('Artist 0', 'Track 0', true, true)
    })

    expect(result.current.state.results.length).toBe(1)
    expect(result.current.state.results[0].artistAnswer).toBe('Artist 0')
    expect(result.current.state.results[0].titleAnswer).toBe('Track 0')
    expect(result.current.state.results[0].artistCorrect).toBe(true)
    expect(result.current.state.results[0].titleCorrect).toBe(true)
  })

  it('advances to next round', () => {
    const { result } = renderHook(() => useGameState())

    act(() => {
      result.current.startGame(mockTracks, { roundCount: 3 })
    })

    act(() => {
      result.current.submitAnswer('test', 'test', false, false)
      result.current.nextRound()
    })

    expect(result.current.state.currentRoundIndex).toBe(1)
  })

  it('transitions to complete after last round', () => {
    const { result } = renderHook(() => useGameState())

    act(() => {
      result.current.startGame(mockTracks, { roundCount: 2 })
    })

    // Round 1
    act(() => {
      result.current.submitAnswer('a', 't', true, true)
      result.current.nextRound()
    })

    expect(result.current.state.phase).toBe('playing')

    // Round 2 (last)
    act(() => {
      result.current.submitAnswer('a', 't', true, false)
      result.current.nextRound()
    })

    expect(result.current.state.phase).toBe('complete')
  })

  it('calculates score correctly', () => {
    const { result } = renderHook(() => useGameState())

    act(() => {
      result.current.startGame(mockTracks, { roundCount: 3 })
    })

    act(() => {
      result.current.submitAnswer('a', 't', true, true) // 2 points
      result.current.nextRound()
    })

    act(() => {
      result.current.submitAnswer('a', 't', true, false) // 1 point
      result.current.nextRound()
    })

    act(() => {
      result.current.submitAnswer('a', 't', false, true) // 1 point
      result.current.nextRound()
    })

    expect(result.current.score.artist).toBe(2)
    expect(result.current.score.title).toBe(2)
    expect(result.current.score.total).toBe(4)
    expect(result.current.score.max).toBe(6)
  })

  it('resets to setup phase', () => {
    const { result } = renderHook(() => useGameState())

    act(() => {
      result.current.startGame(mockTracks, { roundCount: 3 })
    })

    act(() => {
      result.current.submitAnswer('a', 't', true, true)
      result.current.nextRound()
    })

    act(() => {
      result.current.resetGame()
    })

    expect(result.current.state.phase).toBe('setup')
    expect(result.current.state.tracks).toEqual([])
    expect(result.current.state.results).toEqual([])
    expect(result.current.state.currentRoundIndex).toBe(0)
  })

  it('isLastRound returns true on final round', () => {
    const { result } = renderHook(() => useGameState())

    act(() => {
      result.current.startGame(mockTracks, { roundCount: 2 })
    })

    expect(result.current.isLastRound).toBe(false)

    act(() => {
      result.current.submitAnswer('a', 't', true, true)
      result.current.nextRound()
    })

    expect(result.current.isLastRound).toBe(true)
  })

  it('currentTrack is null in setup phase', () => {
    const { result } = renderHook(() => useGameState())

    expect(result.current.currentTrack).toBeNull()
  })

  it('currentTrack is null in complete phase', () => {
    const { result } = renderHook(() => useGameState())

    act(() => {
      result.current.startGame(mockTracks, { roundCount: 1 })
    })

    act(() => {
      result.current.submitAnswer('a', 't', true, true)
      result.current.nextRound()
    })

    expect(result.current.state.phase).toBe('complete')
    expect(result.current.currentTrack).toBeNull()
  })
})
