# 018: End Screen

## Summary
Display final results after all rounds complete, with score summary and replay option.

## Acceptance Criteria
- [ ] Display final score (artist correct, title correct, total)
- [ ] Show percentage
- [ ] List all rounds with results
- [ ] "Play Again" button (same playlist)
- [ ] "New Playlist" button (back to selection)
- [ ] Celebratory feel for high scores

## Technical Details

### Component (`src/components/EndScreen.tsx`)
```typescript
interface Props {
  results: RoundResult[]
  playlist: SpotifyPlaylist
  onPlayAgain: () => void
  onNewPlaylist: () => void
}
```

### Layout
```
┌─────────────────────────────────────────┐
│            🎵 Game Complete!            │
├─────────────────────────────────────────┤
│                                         │
│         Your Score: 12/16               │
│              75%                        │
│                                         │
│    Artists: 7/8    Titles: 5/8         │
│                                         │
├─────────────────────────────────────────┤
│  Round Results:                         │
│                                         │
│  1. "Bohemian Rhapsody" - Queen   ✓ ✓  │
│  2. "Thriller" - Michael Jackson  ✓ ✗  │
│  3. "Hotel California" - Eagles   ✓ ✓  │
│  ...                                    │
│                                         │
├─────────────────────────────────────────┤
│  [Play Again]    [Choose New Playlist]  │
└─────────────────────────────────────────┘
```

### Score Tiers (visual treatment)
- 90-100%: Amazing! 🎉 (gold/celebration)
- 70-89%: Great! (green)
- 50-69%: Good effort (blue)
- <50%: Keep practicing (neutral)

### Round Summary
- Show track title and artist
- Show user's guesses (if wrong)
- Checkmark/X for each field

### Scrollable Results
If many rounds, results section should scroll

## Testing
**Component tests:**
```typescript
describe('EndScreen', () => {
  it('displays total score')
  it('displays percentage')
  it('displays artist score')
  it('displays title score')
  it('lists all round results')
  it('shows correct indicators')
  it('shows incorrect indicators')
  it('calls onPlayAgain when clicked')
  it('calls onNewPlaylist when clicked')
  it('shows celebration for high scores')
})
```

**Manual verification:**
1. Complete game → see end screen
2. Score displays correctly
3. Each round result shown
4. Play again → new game, same playlist
5. New playlist → back to selection

## Dependencies
- 009_game-state
- 016_result-feedback

## Estimated Complexity
Medium
