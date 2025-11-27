import {
  SpotifyUser,
  SpotifyPlaylist,
  SpotifyTrack,
  SpotifyPlaylistTracksResponse,
  SpotifyPlaylistsResponse,
  SpotifyError,
} from '../types/spotify'

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

  async getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
    const tracks: SpotifyTrack[] = []
    let url: string | null = `/playlists/${playlistId}/tracks?limit=100`

    while (url) {
      const response = await this.fetch<SpotifyPlaylistTracksResponse>(url)

      for (const item of response.items) {
        if (isPlayableTrack(item.track)) {
          tracks.push(item.track)
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
  return (
    track !== null &&
    !track.is_local &&
    track.uri.startsWith('spotify:track:')
  )
}

// Export for testing
export { isPlayableTrack }
