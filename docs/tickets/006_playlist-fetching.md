# 006: Fetch User Playlists

## Summary
Retrieve and display the authenticated user's playlists from Spotify.

## Acceptance Criteria
- [ ] Fetch all user playlists (handle pagination)
- [ ] Display playlists in a selectable list
- [ ] Show playlist name, image, track count, owner
- [ ] Loading state while fetching
- [ ] Error handling for failed fetches
- [ ] Empty state if user has no playlists

## Technical Details

### API Method (extend SpotifyClient)
```typescript
async getUserPlaylists(): Promise<SpotifyPlaylist[]> {
  // GET /me/playlists
  // Handle pagination (limit=50, fetch all pages)
  // Return combined results
}
```

### Hook (`src/hooks/usePlaylists.ts`)
```typescript
interface PlaylistsResult {
  playlists: SpotifyPlaylist[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function usePlaylists(accessToken: string): PlaylistsResult
```

### Component (`src/components/PlaylistList.tsx`)
```typescript
interface Props {
  playlists: SpotifyPlaylist[]
  onSelect: (playlist: SpotifyPlaylist) => void
  selectedId?: string
}
```

Display as grid or list with:
- Playlist cover image (or placeholder)
- Playlist name
- Track count
- Owner name (helpful for collaborative playlists)

## Testing
**Unit tests:**
- Pagination logic fetches all pages
- Empty response handled correctly
- Malformed responses don't crash

**Component tests:**
- Renders loading state
- Renders playlist items
- Calls onSelect when item clicked
- Renders empty state message

**Manual verification:**
1. Login → see your playlists displayed
2. Scroll/view all playlists (if you have many)
3. Click a playlist → triggers selection

## Dependencies
- 003_spotify-types
- 004_spotify-oauth
- 005_premium-check

## Estimated Complexity
Medium
