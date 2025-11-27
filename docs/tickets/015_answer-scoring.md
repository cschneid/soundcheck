# 015: Answer Scoring & Submission

## Summary
Connect answer submission to fuzzy matching and record results.

## Acceptance Criteria
- [ ] Compare artist guess to track artists
- [ ] Compare title guess to track name
- [ ] Handle multiple artists (match any)
- [ ] Store result in game state
- [ ] Return scoring result to UI

## Technical Details

### Scoring Logic (`src/utils/scoring.ts`)
```typescript
interface ScoringResult {
  artistCorrect: boolean
  titleCorrect: boolean
  artistMatch?: {
    input: string
    matched: string
    similarity: number
  }
  titleMatch?: {
    input: string
    target: string
    similarity: number
  }
}

export function scoreAnswer(
  artistGuess: string,
  titleGuess: string,
  track: SpotifyTrack
): ScoringResult
```

### Multiple Artists
Tracks can have multiple artists. Match against any:
```typescript
function matchArtist(guess: string, artists: SpotifyArtist[]): MatchResult {
  for (const artist of artists) {
    const result = fuzzyMatch(guess, artist.name, { ignoreThe: true })
    if (result.isMatch) {
      return { ...result, matchedArtist: artist.name }
    }
  }
  return { isMatch: false, ... }
}
```

### Integration with Game State
When `submitAnswer` is called:
1. Get current track
2. Call `scoreAnswer`
3. Store result in `results` array
4. Return result to caller for UI feedback

### Extended Result Type
```typescript
interface RoundResult {
  track: SpotifyTrack
  artistAnswer: string
  titleAnswer: string
  artistCorrect: boolean
  titleCorrect: boolean
  artistSimilarity: number
  titleSimilarity: number
}
```

## Testing
**Unit tests:**
```typescript
describe('scoreAnswer', () => {
  it('scores correct artist as correct')
  it('scores correct title as correct')
  it('scores wrong artist as incorrect')
  it('scores wrong title as incorrect')
  it('matches any of multiple artists')
  it('handles empty artist guess')
  it('handles empty title guess')
  it('handles fuzzy matches')
})
```

**Manual verification:**
1. Enter correct answers → both marked correct
2. Enter wrong answers → both marked incorrect
3. Enter typo → fuzzy match accepts
4. Song with feat. artist → either artist accepted

## Dependencies
- 009_game-state
- 013_fuzzy-matching

## Estimated Complexity
Medium
