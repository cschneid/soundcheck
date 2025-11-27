# 007: Playlist ID Input

## Summary
Allow users to enter a Spotify playlist URL or ID to load any public playlist, not just their own.

## Acceptance Criteria
- [ ] Text input for playlist URL/ID
- [ ] Parse various Spotify URL formats
- [ ] Validate and fetch playlist by ID
- [ ] Error message for invalid/private playlists
- [ ] Switch between "My Playlists" and "Enter URL" modes

## Technical Details

### URL Parsing (`src/utils/parsePlaylistUrl.ts`)
Handle these formats:
```
spotify:playlist:37i9dQZF1DXcBWIGoYBM5M
https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=abc123
open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
37i9dQZF1DXcBWIGoYBM5M  (raw ID)
```

```typescript
export function parsePlaylistId(input: string): string | null {
  // Returns playlist ID or null if invalid format
}
```

### Component (`src/components/PlaylistInput.tsx`)
```typescript
interface Props {
  onPlaylistLoad: (playlist: SpotifyPlaylist) => void
  isLoading: boolean
  error: string | null
}
```

Features:
- Text input with placeholder "Paste Spotify playlist URL or ID"
- Submit button
- Loading spinner during fetch
- Error display for invalid/not found

### Playlist Picker Wrapper (`src/components/PlaylistPicker.tsx`)
Tabs or toggle between:
- "My Playlists" → PlaylistList
- "Enter URL" → PlaylistInput

## Testing
**Unit tests for parsePlaylistId:**
```typescript
describe('parsePlaylistId', () => {
  it('extracts ID from spotify URI')
  it('extracts ID from full URL')
  it('extracts ID from URL with query params')
  it('extracts ID from URL without protocol')
  it('returns raw ID if valid format')
  it('returns null for invalid input')
  it('returns null for empty string')
  it('returns null for other spotify URLs (tracks, albums)')
})
```

**Component tests:**
- Renders input and button
- Calls onPlaylistLoad with fetched playlist
- Shows error for invalid input
- Shows error for not found playlist

**Manual verification:**
1. Paste various URL formats → playlist loads
2. Enter invalid URL → see error message
3. Enter private playlist ID → see appropriate error

## Dependencies
- 006_playlist-fetching

## Estimated Complexity
Small
