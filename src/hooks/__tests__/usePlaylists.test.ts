import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { usePlaylists } from '../usePlaylists'

const mockGetUserPlaylists = vi.fn()

vi.mock('../../utils/spotify', () => {
  return {
    SpotifyClient: class MockSpotifyClient {
      getUserPlaylists = mockGetUserPlaylists
    },
  }
})

const mockPlaylists = [
  {
    id: 'playlist1',
    name: 'My Playlist',
    images: [{ url: 'https://example.com/image.jpg', height: 300, width: 300 }],
    tracks: { total: 50, href: 'https://api.spotify.com/v1/playlists/playlist1/tracks' },
    owner: { display_name: 'Test User' },
  },
  {
    id: 'playlist2',
    name: 'Another Playlist',
    images: [],
    tracks: { total: 25, href: 'https://api.spotify.com/v1/playlists/playlist2/tracks' },
    owner: { display_name: null },
  },
]

describe('usePlaylists', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty array and not loading when no token', () => {
    const { result } = renderHook(() => usePlaylists(null))

    expect(result.current.playlists).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('fetches playlists on mount with token', async () => {
    mockGetUserPlaylists.mockResolvedValue(mockPlaylists)

    const { result } = renderHook(() => usePlaylists('test-token'))

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.playlists).toEqual(mockPlaylists)
    expect(result.current.error).toBeNull()
    expect(mockGetUserPlaylists).toHaveBeenCalledTimes(1)
  })

  it('handles empty playlist response', async () => {
    mockGetUserPlaylists.mockResolvedValue([])

    const { result } = renderHook(() => usePlaylists('test-token'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.playlists).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('handles API errors', async () => {
    mockGetUserPlaylists.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => usePlaylists('test-token'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.playlists).toEqual([])
    expect(result.current.error).toBe('Network error')
  })

  it('handles non-Error objects', async () => {
    mockGetUserPlaylists.mockRejectedValue('string error')

    const { result } = renderHook(() => usePlaylists('test-token'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to fetch playlists')
  })

  it('provides refetch function', async () => {
    mockGetUserPlaylists.mockResolvedValue(mockPlaylists)

    const { result } = renderHook(() => usePlaylists('test-token'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockGetUserPlaylists).toHaveBeenCalledTimes(1)

    // Call refetch
    act(() => {
      result.current.refetch()
    })

    await waitFor(() => {
      expect(mockGetUserPlaylists).toHaveBeenCalledTimes(2)
    })
  })
})
