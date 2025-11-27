# 012: Snippet Playback

## Summary
Implement the core playback functionality: play a random snippet of a track for the configured duration.

## Acceptance Criteria
- [ ] Start playback at random position in track
- [ ] Auto-stop after snippet duration
- [ ] Replay button replays same snippet (same start position)
- [ ] Visual playback progress indicator
- [ ] Handle playback errors

## Technical Details

### Playback via Spotify API
The Web Playback SDK creates a device, but playback is controlled via the Web API:

```typescript
// Start playback on our device
PUT https://api.spotify.com/v1/me/player/play?device_id={deviceId}
{
  "uris": ["spotify:track:xxx"],
  "position_ms": 45000  // Start position
}
```

### Snippet Controller (`src/hooks/useSnippetPlayer.ts`)
```typescript
interface UseSnippetPlayerReturn {
  play: (track: SpotifyTrack) => Promise<void>
  replay: () => Promise<void>
  stop: () => void
  isPlaying: boolean
  progress: number  // 0-100
  error: string | null
}

export function useSnippetPlayer(
  accessToken: string,
  deviceId: string,
  durationSeconds: number
): UseSnippetPlayerReturn
```

### Random Start Position
```typescript
function getRandomStartPosition(trackDurationMs: number, snippetDurationMs: number): number {
  // Ensure snippet doesn't extend past track end
  const maxStart = Math.max(0, trackDurationMs - snippetDurationMs)
  return Math.floor(Math.random() * maxStart)
}
```

### Playback Flow
1. Calculate random start position
2. Store start position for replay
3. Call Spotify API to start playback
4. Start timer for snippet duration
5. After duration, pause playback
6. On replay, use stored start position

### Progress Indicator
- Update every 100ms during playback
- Show visual progress bar
- Display remaining time

### API Method
```typescript
async startPlayback(
  deviceId: string,
  trackUri: string,
  positionMs: number
): Promise<void>

async pausePlayback(deviceId: string): Promise<void>
```

## Testing
**Unit tests:**
- Random position calculation stays within bounds
- Timer logic for auto-stop
- Replay uses same start position

**Manual verification:**
1. Play snippet → music plays for configured duration
2. Plays from random point (not always the beginning)
3. Click replay → same section plays again
4. Progress bar updates smoothly
5. Playback errors show message

## Dependencies
- 003_spotify-types
- 011_spotify-player-sdk

## Notes
- Brief delay expected before audio starts (~500ms)
- Position may not be frame-accurate due to API latency

## Estimated Complexity
Large
