# 010: Game Settings UI

## Summary
Create the pre-game settings screen where users configure round count and snippet duration.

## Acceptance Criteria
- [ ] Number input for round count (default: 8)
- [ ] Number input or slider for snippet duration (default: 10s)
- [ ] Validation: rounds between 1 and playlist track count
- [ ] Validation: duration between 5 and 30 seconds
- [ ] "Start Game" button
- [ ] Display selected playlist info

## Technical Details

### Component (`src/components/GameSettings.tsx`)
```typescript
interface Props {
  playlist: SpotifyPlaylist
  availableTrackCount: number
  onStart: (settings: GameSettings) => void
  onBack: () => void
}
```

### Layout
```
┌─────────────────────────────────┐
│ 🎵 [Playlist Name]              │
│    [X] tracks available         │
├─────────────────────────────────┤
│ Number of rounds:               │
│ [    8    ] (1-50 max)         │
│                                 │
│ Snippet duration:               │
│ [   10   ] seconds (5-30)      │
│                                 │
│ [← Back]        [Start Game →] │
└─────────────────────────────────┘
```

### Validation
- Round count: min 1, max = min(availableTrackCount, 50)
- Duration: min 5s, max 30s
- Show inline validation errors

### Defaults
```typescript
const DEFAULT_SETTINGS: GameSettings = {
  roundCount: 8,
  snippetDuration: 10
}
```

## Testing
**Component tests:**
```typescript
describe('GameSettings', () => {
  it('renders playlist info')
  it('shows default values')
  it('limits rounds to available tracks')
  it('shows error for invalid round count')
  it('shows error for invalid duration')
  it('calls onStart with settings')
  it('calls onBack when back clicked')
  it('disables start for invalid settings')
})
```

**Manual verification:**
1. See playlist name and track count
2. Adjust round count → validation works
3. Adjust duration → validation works
4. Click start → game begins with settings

## Dependencies
- 009_game-state

## Estimated Complexity
Small
