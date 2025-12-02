import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSnippetPlayer } from '../useSnippetPlayer'

const mockStartPlayback = vi.fn()
const mockPausePlayback = vi.fn()

vi.mock('../../utils/spotify', () => ({
  SpotifyClient: class MockSpotifyClient {
    startPlayback = mockStartPlayback
    pausePlayback = mockPausePlayback
  },
}))

vi.mock('../../utils/snippetPosition', () => ({
  getRandomStartPosition: vi.fn(() => 5000),
}))

const mockTrack = {
  id: '1',
  name: 'Test Track',
  artists: [{ id: 'a1', name: 'Test Artist' }],
  album: { name: 'Test Album', images: [] },
  duration_ms: 180000,
  uri: 'spotify:track:1',
}

describe('useSnippetPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns initial state', () => {
    const { result } = renderHook(() =>
      useSnippetPlayer('token', 'device123', 10)
    )

    expect(result.current.isPlaying).toBe(false)
    expect(result.current.progress).toBe(0)
    expect(result.current.error).toBeNull()
  })

  it('sets error when player not ready', async () => {
    const { result } = renderHook(() => useSnippetPlayer(null, null, 10))

    await act(async () => {
      await result.current.play(mockTrack)
    })

    expect(result.current.error).toBe('Player not ready')
  })

  it('starts playback with random position', async () => {
    mockStartPlayback.mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useSnippetPlayer('token', 'device123', 10)
    )

    await act(async () => {
      await result.current.play(mockTrack)
    })

    expect(mockStartPlayback).toHaveBeenCalledWith(
      'device123',
      'spotify:track:1',
      5000 // mocked random position
    )
    expect(result.current.isPlaying).toBe(true)
  })

  it('updates progress during playback', async () => {
    mockStartPlayback.mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useSnippetPlayer('token', 'device123', 10)
    )

    await act(async () => {
      await result.current.play(mockTrack)
    })

    expect(result.current.progress).toBe(0)

    await act(async () => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current.progress).toBeGreaterThan(40)
    expect(result.current.progress).toBeLessThanOrEqual(55)
  })

  it('auto-stops after duration', async () => {
    mockStartPlayback.mockResolvedValue(undefined)
    mockPausePlayback.mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useSnippetPlayer('token', 'device123', 10)
    )

    await act(async () => {
      await result.current.play(mockTrack)
    })

    expect(result.current.isPlaying).toBe(true)

    await act(async () => {
      vi.advanceTimersByTime(10100) // slightly past duration
    })

    expect(result.current.isPlaying).toBe(false)
    expect(mockPausePlayback).toHaveBeenCalledWith('device123')
  })

  it('replays same position', async () => {
    mockStartPlayback.mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useSnippetPlayer('token', 'device123', 10)
    )

    await act(async () => {
      await result.current.play(mockTrack)
    })

    await act(async () => {
      await result.current.stop()
    })

    mockStartPlayback.mockClear()

    await act(async () => {
      await result.current.replay()
    })

    expect(mockStartPlayback).toHaveBeenCalledWith(
      'device123',
      'spotify:track:1',
      5000 // same position as before
    )
  })

  it('sets error when no track to replay', async () => {
    const { result } = renderHook(() =>
      useSnippetPlayer('token', 'device123', 10)
    )

    await act(async () => {
      await result.current.replay()
    })

    expect(result.current.error).toBe('No track to replay')
  })

  it('handles playback error', async () => {
    mockStartPlayback.mockRejectedValue(new Error('API Error'))

    const { result } = renderHook(() =>
      useSnippetPlayer('token', 'device123', 10)
    )

    await act(async () => {
      await result.current.play(mockTrack)
    })

    expect(result.current.error).toBe('API Error')
    expect(result.current.isPlaying).toBe(false)
  })

  it('stops playback manually', async () => {
    mockStartPlayback.mockResolvedValue(undefined)
    mockPausePlayback.mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useSnippetPlayer('token', 'device123', 10)
    )

    await act(async () => {
      await result.current.play(mockTrack)
    })

    expect(result.current.isPlaying).toBe(true)

    await act(async () => {
      await result.current.stop()
    })

    expect(result.current.isPlaying).toBe(false)
    expect(result.current.progress).toBe(0)
  })
})
