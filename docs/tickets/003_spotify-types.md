# 003: Spotify Types & API Client

## Summary
Define TypeScript types for Spotify API responses and create a typed API client wrapper.

## Acceptance Criteria
- [ ] Type definitions for Spotify entities (User, Playlist, Track, etc.)
- [ ] API client class/module with typed methods
- [ ] Error types defined
- [ ] Unit tests for API client utilities

## Technical Details

### Types File (`src/types/spotify.ts`)
```typescript
export interface SpotifyUser {
  id: string
  display_name: string
  product: 'premium' | 'free' | 'open'
  images: SpotifyImage[]
}

export interface SpotifyImage {
  url: string
  height: number
  width: number
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
    display_name: string
  }
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
}

export interface SpotifyArtist {
  id: string
  name: string
}

export interface SpotifyPlaylistTracksResponse {
  items: Array<{
    track: SpotifyTrack | null  // null for local files
  }>
  next: string | null
  total: number
}

export interface SpotifyError {
  status: number
  message: string
}
```

### API Client (`src/utils/spotify.ts`)
```typescript
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

export class SpotifyClient {
  constructor(private accessToken: string) {}

  private async fetch<T>(endpoint: string): Promise<T>

  async getCurrentUser(): Promise<SpotifyUser>
  async getUserPlaylists(): Promise<SpotifyPlaylist[]>
  async getPlaylist(playlistId: string): Promise<SpotifyPlaylist>
  async getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]>
}
```

### Error Handling
- 401: Token expired → redirect to login
- 403: Forbidden (e.g., private playlist) → show user message
- 404: Playlist not found → show user message
- 429: Rate limited → retry with backoff

## Testing
Unit tests for:
- URL construction
- Response parsing
- Error handling logic
- Pagination handling (getPlaylistTracks should fetch all pages)

```typescript
// src/utils/__tests__/spotify.test.ts
describe('SpotifyClient', () => {
  it('constructs correct API URLs')
  it('includes auth header in requests')
  it('parses user response correctly')
  it('handles pagination for large playlists')
  it('filters out null tracks (local files)')
  it('throws SpotifyError on API errors')
})
```

## Dependencies
- 001_project-setup
- 002_testing-infrastructure

## Estimated Complexity
Medium
