export interface SpotifyImage {
  url: string
  height: number | null
  width: number | null
}

export interface SpotifyUser {
  id: string
  display_name: string | null
  product: 'premium' | 'free' | 'open'
  images: SpotifyImage[]
}

export interface SpotifyArtist {
  id: string
  name: string
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: SpotifyArtist[]
  album: {
    name: string
    images: SpotifyImage[]
  }
  duration_ms: number
  uri: string
  is_local?: boolean
  // When market param is provided, is_playable replaces available_markets
  // But is_playable can be unreliable (sometimes missing) per github.com/spotify/web-api/issues/1033
  is_playable?: boolean
  available_markets?: string[]
}

export interface SpotifyPlaylist {
  id: string
  name: string
  images: SpotifyImage[]
  tracks: {
    total: number
    href: string
  }
  owner: {
    display_name: string | null
  }
}

export interface SpotifyPlaylistItem {
  track: SpotifyTrack | null
}

export interface SpotifyPlaylistTracksResponse {
  items: SpotifyPlaylistItem[]
  next: string | null
  total: number
}

export interface SpotifyPlaylistsResponse {
  items: SpotifyPlaylist[]
  next: string | null
  total: number
}

export class SpotifyError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'SpotifyError'
  }
}
