import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { usePlaylistTracks } from '../usePlaylistTracks'

const mockGetPlaylistTracks = vi.fn()

vi.mock('../../utils/spotify', () => ({
  SpotifyClient: class MockSpotifyClient {
    getPlaylistTracks = mockGetPlaylistTracks
  },
}))

const mockTracks = [
  {
    id: '1',
    name: 'Track 1',
    artists: [{ id: 'a1', name: 'Artist 1' }],
    album: { name: 'Album 1', images: [] },
    duration_ms: 180000,
    uri: 'spotify:track:1',
  },
  {
    id: '2',
    name: 'Track 2',
    artists: [{ id: 'a2', name: 'Artist 2' }],
    album: { name: 'Album 2', images: [] },
    duration_ms: 200000,
    uri: 'spotify:track:2',
  },
]

describe('usePlaylistTracks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty tracks when no playlist selected', () => {
    const { result } = renderHook(() => usePlaylistTracks(null, 'token'))

    expect(result.current.tracks).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('returns empty tracks when no access token', () => {
    const { result } = renderHook(() => usePlaylistTracks('playlist123', null))

    expect(result.current.tracks).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  it('fetches tracks when playlist selected', async () => {
    mockGetPlaylistTracks.mockResolvedValue(mockTracks)

    const { result } = renderHook(() =>
      usePlaylistTracks('playlist123', 'token')
    )

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.tracks).toEqual(mockTracks)
    expect(result.current.error).toBeNull()
  })

  it('sets error on fetch failure', async () => {
    mockGetPlaylistTracks.mockRejectedValue(new Error('API Error'))

    const { result } = renderHook(() =>
      usePlaylistTracks('playlist123', 'token')
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('API Error')
    expect(result.current.tracks).toEqual([])
  })

  it('refetches when playlist changes', async () => {
    mockGetPlaylistTracks.mockResolvedValue(mockTracks)

    const { result, rerender } = renderHook(
      ({ playlistId }) => usePlaylistTracks(playlistId, 'token'),
      { initialProps: { playlistId: 'playlist1' } }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockGetPlaylistTracks).toHaveBeenCalledWith('playlist1')

    rerender({ playlistId: 'playlist2' })

    await waitFor(() => {
      expect(mockGetPlaylistTracks).toHaveBeenCalledWith('playlist2')
    })
  })

  it('handles empty playlist', async () => {
    mockGetPlaylistTracks.mockResolvedValue([])

    const { result } = renderHook(() =>
      usePlaylistTracks('emptyPlaylist', 'token')
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.tracks).toEqual([])
    expect(result.current.error).toBeNull()
  })
})
