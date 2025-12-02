import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SpotifyClient, isPlayableTrack } from '../spotify'
import { SpotifyError } from '../../types/spotify'
import type { SpotifyTrack } from '../../types/spotify'

const mockFetch = vi.fn()
globalThis.fetch = mockFetch

function mockResponse(data: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: () => Promise.resolve(data),
  }
}

describe('SpotifyClient', () => {
  let client: SpotifyClient

  beforeEach(() => {
    client = new SpotifyClient('test-token')
    mockFetch.mockReset()
  })

  describe('fetch', () => {
    it('includes auth header in requests', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ id: '123' }))

      await client.getCurrentUser()

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.spotify.com/v1/me',
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' },
        })
      )
    })

    it('throws SpotifyError on API errors', async () => {
      mockFetch.mockResolvedValue(
        mockResponse({ error: { message: 'Token expired' } }, false, 401)
      )

      await expect(client.getCurrentUser()).rejects.toThrow(SpotifyError)

      const error = await client.getCurrentUser().catch((e) => e)
      expect(error.status).toBe(401)
    })
  })

  describe('getCurrentUser', () => {
    it('returns user data', async () => {
      const userData = {
        id: 'user123',
        display_name: 'Test User',
        product: 'premium',
        images: [],
      }
      mockFetch.mockResolvedValueOnce(mockResponse(userData))

      const user = await client.getCurrentUser()

      expect(user).toEqual(userData)
    })
  })

  describe('getUserPlaylists', () => {
    it('handles pagination', async () => {
      mockFetch
        .mockResolvedValueOnce(
          mockResponse({
            items: [{ id: '1', name: 'Playlist 1' }],
            next: 'https://api.spotify.com/v1/me/playlists?offset=50',
            total: 2,
          })
        )
        .mockResolvedValueOnce(
          mockResponse({
            items: [{ id: '2', name: 'Playlist 2' }],
            next: null,
            total: 2,
          })
        )

      const playlists = await client.getUserPlaylists()

      expect(playlists).toHaveLength(2)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('getPlaylistTracks', () => {
    it('filters out null tracks (local files)', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          items: [
            { track: { id: '1', name: 'Track 1', uri: 'spotify:track:1' } },
            { track: null },
            { track: { id: '2', name: 'Track 2', uri: 'spotify:track:2' } },
          ],
          next: null,
          total: 3,
        })
      )

      const tracks = await client.getPlaylistTracks('playlist123')

      expect(tracks).toHaveLength(2)
      expect(tracks.map((t) => t.id)).toEqual(['1', '2'])
    })

    it('filters out local files', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          items: [
            { track: { id: '1', uri: 'spotify:track:1', is_local: false } },
            { track: { id: '2', uri: 'spotify:local:artist', is_local: true } },
          ],
          next: null,
          total: 2,
        })
      )

      const tracks = await client.getPlaylistTracks('playlist123')

      expect(tracks).toHaveLength(1)
    })

    it('handles pagination for large playlists', async () => {
      mockFetch
        .mockResolvedValueOnce(
          mockResponse({
            items: [{ track: { id: '1', uri: 'spotify:track:1' } }],
            next: 'https://api.spotify.com/v1/playlists/123/tracks?offset=100',
            total: 2,
          })
        )
        .mockResolvedValueOnce(
          mockResponse({
            items: [{ track: { id: '2', uri: 'spotify:track:2' } }],
            next: null,
            total: 2,
          })
        )

      const tracks = await client.getPlaylistTracks('123')

      expect(tracks).toHaveLength(2)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })
})

describe('isPlayableTrack', () => {
  it('returns true for valid spotify tracks', () => {
    const track = {
      id: '1',
      name: 'Test',
      uri: 'spotify:track:abc',
      is_local: false,
    } as SpotifyTrack

    expect(isPlayableTrack(track)).toBe(true)
  })

  it('returns false for null', () => {
    expect(isPlayableTrack(null)).toBe(false)
  })

  it('returns false for local files', () => {
    const track = {
      id: '1',
      name: 'Test',
      uri: 'spotify:local:abc',
      is_local: true,
    } as SpotifyTrack

    expect(isPlayableTrack(track)).toBe(false)
  })

  it('returns false for non-track URIs', () => {
    const track = {
      id: '1',
      name: 'Test',
      uri: 'spotify:episode:abc',
      is_local: false,
    } as SpotifyTrack

    expect(isPlayableTrack(track)).toBe(false)
  })

  it('returns true when is_playable is true', () => {
    const track = {
      id: '1',
      name: 'Test',
      uri: 'spotify:track:abc',
      is_playable: true,
    } as SpotifyTrack

    expect(isPlayableTrack(track)).toBe(true)
  })

  it('returns false when is_playable is false', () => {
    const track = {
      id: '1',
      name: 'Test',
      uri: 'spotify:track:abc',
      is_playable: false,
    } as SpotifyTrack

    expect(isPlayableTrack(track)).toBe(false)
  })

  it('returns false when available_markets is empty (is_playable missing)', () => {
    const track = {
      id: '1',
      name: 'Test',
      uri: 'spotify:track:abc',
      artists: [],
      album: { name: '', images: [] },
      duration_ms: 0,
      available_markets: [],
    } as SpotifyTrack

    expect(isPlayableTrack(track)).toBe(false)
  })

  it('returns true when available_markets is non-empty (is_playable missing)', () => {
    const track = {
      id: '1',
      name: 'Test',
      uri: 'spotify:track:abc',
      available_markets: ['US', 'GB'],
    } as SpotifyTrack

    expect(isPlayableTrack(track)).toBe(true)
  })
})
