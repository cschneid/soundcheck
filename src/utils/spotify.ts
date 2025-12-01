import type {
  SpotifyUser,
  SpotifyPlaylist,
  SpotifyTrack,
  SpotifyPlaylistTracksResponse,
  SpotifyPlaylistsResponse,
} from '../types/spotify'
import { SpotifyError } from '../types/spotify'

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

export class SpotifyClient {
  constructor(private accessToken: string) {}

  private async fetch<T>(endpoint: string): Promise<T> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${SPOTIFY_API_BASE}${endpoint}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new SpotifyError(
        response.status,
        error.error?.message || `HTTP ${response.status}`
      )
    }

    return response.json()
  }

  async getCurrentUser(): Promise<SpotifyUser> {
    return this.fetch<SpotifyUser>('/me')
  }

  async getUserPlaylists(): Promise<SpotifyPlaylist[]> {
    const playlists: SpotifyPlaylist[] = []
    let url: string | null = '/me/playlists?limit=50'

    while (url) {
      const response = await this.fetch<SpotifyPlaylistsResponse>(url)
      playlists.push(...response.items)
      url = response.next
    }

    return playlists
  }

  async getPlaylist(playlistId: string): Promise<SpotifyPlaylist> {
    return this.fetch<SpotifyPlaylist>(`/playlists/${playlistId}`)
  }

  async getPlaylistTracks(
    playlistId: string,
    maxTracks: number = 500
  ): Promise<SpotifyTrack[]> {
    const tracks: SpotifyTrack[] = []
    // market=from_token enables is_playable field for track availability
    let url: string | null = `/playlists/${playlistId}/tracks?limit=100&market=from_token`

    while (url && tracks.length < maxTracks) {
      const response = await this.fetch<SpotifyPlaylistTracksResponse>(url)

      for (const item of response.items) {
        if (isPlayableTrack(item.track)) {
          tracks.push(item.track)
          if (tracks.length >= maxTracks) break
        }
      }

      url = response.next
    }

    return tracks
  }

  async startPlayback(
    deviceId: string,
    trackUri: string,
    positionMs: number
  ): Promise<void> {
    await fetch(`${SPOTIFY_API_BASE}/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: [trackUri],
        position_ms: positionMs,
      }),
    })
  }

  async pausePlayback(deviceId: string): Promise<void> {
    await fetch(`${SPOTIFY_API_BASE}/me/player/pause?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    })
  }
}

function isPlayableTrack(track: SpotifyTrack | null): track is SpotifyTrack {
  if (track === null || track.is_local || !track.uri.startsWith('spotify:track:')) {
    return false
  }

  // Check is_playable if present (from market=from_token)
  if (track.is_playable !== undefined) {
    return track.is_playable
  }

  // Fallback: is_playable can be unreliable/missing, check available_markets
  // If available_markets exists and is empty, track is unavailable
  if (track.available_markets !== undefined) {
    return track.available_markets.length > 0
  }

  // If neither field present, assume playable (legacy behavior)
  return true
}

// Export for testing
export { isPlayableTrack }
