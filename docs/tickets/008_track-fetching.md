# 008: Fetch Playlist Tracks

## Summary
Fetch all tracks from a selected playlist, handling pagination and filtering out unplayable tracks.

## Acceptance Criteria
- [ ] Fetch all tracks from playlist (handle pagination)
- [ ] Filter out local files (track is null)
- [ ] Filter out tracks without preview capability
- [ ] Handle playlists with 100+ tracks
- [ ] Return track data needed for game

## Technical Details

### API Method (extend SpotifyClient)
```typescript
async getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
  // GET /playlists/{id}/tracks
  // Pagination: limit=100, follow 'next' URLs
  // Filter: remove items where track is null
  // Return array of valid tracks
}
```

### Track Validation
```typescript
function isPlayableTrack(item: PlaylistItem): boolean {
  return (
    item.track !== null &&
    !item.track.is_local &&
    item.track.uri.startsWith('spotify:track:')
  )
}
```

### Hook (`src/hooks/usePlaylistTracks.ts`)
```typescript
interface TracksResult {
  tracks: SpotifyTrack[]
  isLoading: boolean
  error: string | null
  totalFiltered: number  // How many tracks were removed
}

export function usePlaylistTracks(
  playlistId: string | null,
  accessToken: string
): TracksResult
```

## Testing
**Unit tests:**
- Pagination concatenates all pages
- Filters out null tracks
- Filters out local files
- Handles empty playlist
- Handles playlist with only local files (returns empty, shows message)

**Manual verification:**
1. Select a playlist → tracks load
2. Select a large playlist (100+) → all tracks load
3. Select playlist with local files → they're filtered out

## Dependencies
- 003_spotify-types
- 006_playlist-fetching

## Estimated Complexity
Medium
