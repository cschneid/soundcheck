# 017: Game Round UI

## Summary
Create the main game round component that orchestrates snippet playback, answer input, and result display.

## Acceptance Criteria
- [ ] Display round number (e.g., "Round 3 of 8")
- [ ] Display running score
- [ ] Integrate snippet player controls
- [ ] Integrate answer input
- [ ] Transition to result feedback on submit
- [ ] Transition to next round or end screen

## Technical Details

### Component (`src/components/GameRound.tsx`)
```typescript
interface Props {
  roundNumber: number
  totalRounds: number
  track: SpotifyTrack
  score: { artist: number; title: number }
  onSubmit: (artistGuess: string, titleGuess: string) => RoundResult
  onNext: () => void
  snippetDuration: number
}
```

### Round States
```typescript
type RoundPhase = 'listening' | 'answering' | 'result'
```

Flow:
1. `listening` - Snippet plays, can replay
2. `answering` - User types answers (can still replay)
3. `result` - Shows feedback, waiting for next

### Layout - Listening/Answering Phase
```
┌─────────────────────────────────────────┐
│  Round 3 of 8          Score: 4/4       │
├─────────────────────────────────────────┤
│                                         │
│        [▶ Play Snippet]                 │
│        [↻ Replay]                       │
│                                         │
│        ████████░░░░ 7s / 10s           │
│                                         │
├─────────────────────────────────────────┤
│  Artist: [___________________]          │
│  Title:  [___________________]          │
│                                         │
│           [Submit Answer]               │
└─────────────────────────────────────────┘
```

### Layout - Result Phase
Shows `ResultFeedback` component

### Auto-play Behavior
- Auto-play snippet when round starts
- User can replay anytime before submitting

### Keyboard Shortcuts (stretch)
- Space: Play/Pause snippet
- Enter: Submit answer (when in answer field)

## Testing
**Component tests:**
```typescript
describe('GameRound', () => {
  it('displays round number and total')
  it('displays current score')
  it('shows play button initially')
  it('shows answer inputs')
  it('transitions to result on submit')
  it('calls onNext when next clicked')
  it('shows replay button after playing')
})
```

**Integration test:**
- Mock Spotify player
- Full round flow: play → answer → result → next

**Manual verification:**
1. Round starts → snippet auto-plays
2. Can replay snippet
3. Submit answer → see result
4. Click next → proceeds

## Dependencies
- 012_snippet-playback
- 014_answer-input-ui
- 016_result-feedback

## Estimated Complexity
Large
