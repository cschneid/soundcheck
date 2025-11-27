# 009: Game State Management

## Summary
Create the core game state management: track selection, shuffling, round progression, and scoring.

## Acceptance Criteria
- [ ] Shuffle and select N tracks from playlist
- [ ] Track current round number
- [ ] Store answers and scores per round
- [ ] Calculate running and final scores
- [ ] Game state transitions: setup → playing → complete

## Technical Details

### Game Types (`src/types/game.ts`)
```typescript
type GamePhase = 'setup' | 'playing' | 'complete'

interface RoundResult {
  track: SpotifyTrack
  artistAnswer: string
  titleAnswer: string
  artistCorrect: boolean
  titleCorrect: boolean
}

interface GameState {
  phase: GamePhase
  tracks: SpotifyTrack[]
  currentRoundIndex: number
  results: RoundResult[]
  settings: GameSettings
}

interface GameSettings {
  roundCount: number
  snippetDuration: number  // seconds
}
```

### Game Hook (`src/hooks/useGameState.ts`)
```typescript
interface UseGameStateReturn {
  state: GameState
  startGame: (tracks: SpotifyTrack[], settings: GameSettings) => void
  submitAnswer: (artistAnswer: string, titleAnswer: string) => void
  nextRound: () => void
  resetGame: () => void
  currentTrack: SpotifyTrack | null
  score: { artist: number; title: number; total: number; max: number }
  isLastRound: boolean
}

export function useGameState(): UseGameStateReturn
```

### Shuffle Utility (`src/utils/shuffle.ts`)
```typescript
// Fisher-Yates shuffle
export function shuffle<T>(array: T[]): T[]

// Select n random items
export function selectRandom<T>(array: T[], count: number): T[]
```

## Testing
**Unit tests for shuffle:**
```typescript
describe('shuffle', () => {
  it('returns array of same length')
  it('contains all original elements')
  it('does not mutate original array')
})

describe('selectRandom', () => {
  it('returns requested number of items')
  it('returns all items if count > array length')
  it('returns unique items (no duplicates)')
})
```

**Unit tests for game state:**
```typescript
describe('useGameState', () => {
  it('initializes in setup phase')
  it('transitions to playing on startGame')
  it('shuffles and limits tracks to roundCount')
  it('tracks current round correctly')
  it('stores submitted answers')
  it('advances to next round')
  it('transitions to complete after last round')
  it('calculates score correctly')
  it('resets to setup phase')
})
```

**Manual verification:**
1. Start game with 8 rounds → 8 tracks selected
2. Submit answers → stored in results
3. Progress through all rounds → game completes
4. Reset → back to setup

## Dependencies
- 002_testing-infrastructure
- 003_spotify-types

## Estimated Complexity
Medium
