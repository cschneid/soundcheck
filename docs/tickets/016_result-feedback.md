# 016: Result Feedback UI

## Summary
Display feedback after each answer: correct/incorrect status, the actual answer, and visual/audio celebration or disappointment effects.

## Acceptance Criteria
- [ ] Show correct answer (artist + title)
- [ ] Show album artwork
- [ ] Indicate which guesses were correct/incorrect
- [ ] Visual feedback (green check / red X)
- [ ] Animation for correct (subtle celebration)
- [ ] Animation for incorrect (whomp-whomp feel)
- [ ] "Next" button to proceed

## Technical Details

### Component (`src/components/ResultFeedback.tsx`)
```typescript
interface Props {
  result: RoundResult
  track: SpotifyTrack
  onNext: () => void
  isLastRound: boolean
}
```

### Layout
```
┌─────────────────────────────────────────┐
│  [Album Art]                            │
│                                         │
│  "Don't Stop Believin'"                 │
│   by Journey                            │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Artist: journey         ✓       │   │
│  │ Title:  dont stop beleiving ✓   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Score this round: 2/2                  │
│                                         │
│           [Next Song →]                 │
│           [See Results] (if last)       │
└─────────────────────────────────────────┘
```

### Visual Feedback
**Correct (either/both):**
- Green color scheme
- Checkmark icon
- Subtle confetti or pulse animation
- Consider CSS animation only (no heavy library)

**Incorrect:**
- Red color scheme
- X icon
- Subtle shake or fade-in
- Muted/disappointed visual tone

### CSS Animations
```css
@keyframes celebrate {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes whomp {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
```

### Optional: Sound Effects
- Could add in Phase 2
- For now, visual only

## Testing
**Component tests:**
```typescript
describe('ResultFeedback', () => {
  it('displays track title')
  it('displays artist name')
  it('displays album artwork')
  it('shows checkmark for correct artist')
  it('shows X for incorrect artist')
  it('shows checkmark for correct title')
  it('shows X for incorrect title')
  it('shows "Next Song" button')
  it('shows "See Results" on last round')
  it('calls onNext when button clicked')
  it('displays user guesses')
})
```

**Manual verification:**
1. Correct answer → celebration animation
2. Wrong answer → disappointed animation
3. Partial correct → mixed display
4. Album art loads correctly
5. Next button works

## Dependencies
- 009_game-state
- 015_answer-scoring

## Estimated Complexity
Medium
