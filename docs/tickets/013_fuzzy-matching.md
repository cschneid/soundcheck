# 013: Fuzzy Matching

## Summary
Implement fuzzy string matching for comparing user answers to correct song titles and artist names.

## Acceptance Criteria
- [ ] Case-insensitive matching
- [ ] Ignore leading "The" in artist names
- [ ] Ignore punctuation differences
- [ ] Handle common misspellings (Levenshtein distance)
- [ ] Configurable threshold for "close enough"
- [ ] Comprehensive unit test coverage

## Technical Details

### Dependencies
```bash
npm install fuse.js
# OR implement custom Levenshtein
```

### Matching Module (`src/utils/fuzzyMatch.ts`)
```typescript
interface MatchResult {
  isMatch: boolean
  similarity: number  // 0-1
  normalized: {
    input: string
    target: string
  }
}

interface MatchOptions {
  threshold?: number  // default 0.8
  ignoreThe?: boolean  // default true (for artists)
}

export function fuzzyMatch(
  input: string,
  target: string,
  options?: MatchOptions
): MatchResult

// Normalization helpers
export function normalizeString(str: string): string
export function removeLeadingThe(str: string): string
export function removePunctuation(str: string): string
export function levenshteinDistance(a: string, b: string): number
export function similarityScore(a: string, b: string): number
```

### Normalization Rules
1. Trim whitespace
2. Convert to lowercase
3. Remove punctuation (except internal apostrophes)
4. Collapse multiple spaces
5. Optionally remove leading "The "

### Similarity Calculation
```typescript
// Levenshtein-based similarity
function similarityScore(a: string, b: string): number {
  const distance = levenshteinDistance(a, b)
  const maxLength = Math.max(a.length, b.length)
  return 1 - (distance / maxLength)
}
```

### Match Examples
| Input | Target | Match? |
|-------|--------|--------|
| "beatles" | "The Beatles" | ✓ |
| "Bealtes" | "Beatles" | ✓ (typo) |
| "dont stop believing" | "Don't Stop Believin'" | ✓ |
| "taylor swift" | "Taylor Swift" | ✓ |
| "journey" | "The Journey" | ? (context) |
| "queen" | "Queen" | ✓ |
| "totally wrong" | "Queen" | ✗ |

## Testing
**Extensive unit tests required:**

```typescript
describe('normalizeString', () => {
  it('converts to lowercase')
  it('trims whitespace')
  it('removes punctuation')
  it('preserves internal apostrophes')
  it('collapses multiple spaces')
})

describe('removeLeadingThe', () => {
  it('removes "The " prefix')
  it('removes "the " prefix (lowercase)')
  it('does not remove "The" mid-string')
  it('handles empty string')
})

describe('levenshteinDistance', () => {
  it('returns 0 for identical strings')
  it('returns length for completely different strings')
  it('handles insertions')
  it('handles deletions')
  it('handles substitutions')
  it('handles transpositions')
})

describe('similarityScore', () => {
  it('returns 1 for identical strings')
  it('returns 0 for completely different strings')
  it('returns high score for minor typos')
})

describe('fuzzyMatch', () => {
  // Case insensitivity
  it('matches "Queen" to "queen"')
  it('matches "METALLICA" to "Metallica"')

  // Leading "The"
  it('matches "Beatles" to "The Beatles"')
  it('matches "The Rolling Stones" to "Rolling Stones"')

  // Punctuation
  it('matches "Dont Stop" to "Don\'t Stop"')
  it('matches "Mr Brightside" to "Mr. Brightside"')
  it('matches "Rock N Roll" to "Rock \'n\' Roll"')

  // Common misspellings
  it('matches "Nirvan" to "Nirvana"')
  it('matches "Metalica" to "Metallica"')
  it('matches "Bealtes" to "Beatles"')
  it('matches "Arianna Grande" to "Ariana Grande"')

  // Whitespace
  it('matches "  queen  " to "Queen"')
  it('matches "Led Zeppelin" to "Led  Zeppelin"')

  // Should NOT match
  it('does not match "Queen" to "Kings"')
  it('does not match "Taylor" to "Swift"')
  it('does not match empty string to anything')

  // Edge cases
  it('handles empty strings')
  it('handles very long strings')
  it('handles unicode characters')
  it('handles numbers in titles')
})
```

## Dependencies
- 002_testing-infrastructure

## Notes
- Threshold of 0.8 is a starting point; may need tuning
- Consider showing "almost correct" feedback for near-misses (0.6-0.8)

## Estimated Complexity
Medium
