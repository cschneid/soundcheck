import { describe, it, expect } from 'vitest'
import {
  normalizeString,
  removeLeadingThe,
  removePunctuation,
  levenshteinDistance,
  similarityScore,
  fuzzyMatch,
} from '../fuzzyMatch'

describe('normalizeString', () => {
  it('converts to lowercase', () => {
    expect(normalizeString('QUEEN')).toBe('queen')
    expect(normalizeString('Taylor Swift')).toBe('taylor swift')
  })

  it('trims whitespace', () => {
    expect(normalizeString('  queen  ')).toBe('queen')
    expect(normalizeString('\tqueen\n')).toBe('queen')
  })

  it('removes punctuation', () => {
    expect(normalizeString('Mr. Brightside')).toBe('mr brightside')
    expect(normalizeString('Rock & Roll')).toBe('rock roll') // spaces collapsed
  })

  it('preserves internal apostrophes', () => {
    expect(normalizeString("Don't Stop")).toBe("don't stop")
    expect(normalizeString("Rock 'n' Roll")).toBe("rock 'n' roll")
  })

  it('collapses multiple spaces', () => {
    expect(normalizeString('Led  Zeppelin')).toBe('led zeppelin')
    expect(normalizeString('a   b    c')).toBe('a b c')
  })
})

describe('removeLeadingThe', () => {
  it('removes "The " prefix', () => {
    expect(removeLeadingThe('The Beatles')).toBe('Beatles')
  })

  it('removes "the " prefix (lowercase)', () => {
    expect(removeLeadingThe('the beatles')).toBe('beatles')
  })

  it('does not remove "The" mid-string', () => {
    expect(removeLeadingThe('Over The Rainbow')).toBe('Over The Rainbow')
  })

  it('handles empty string', () => {
    expect(removeLeadingThe('')).toBe('')
  })

  it('handles "The" alone', () => {
    expect(removeLeadingThe('The')).toBe('The')
  })
})

describe('removePunctuation', () => {
  it('removes all punctuation', () => {
    expect(removePunctuation("Don't")).toBe('Dont')
    expect(removePunctuation('Mr. Brightside')).toBe('Mr Brightside')
  })

  it('preserves letters and numbers', () => {
    expect(removePunctuation('1999')).toBe('1999')
    expect(removePunctuation('24K Magic')).toBe('24K Magic')
  })
})

describe('levenshteinDistance', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshteinDistance('queen', 'queen')).toBe(0)
    expect(levenshteinDistance('', '')).toBe(0)
  })

  it('returns length for completely different strings', () => {
    expect(levenshteinDistance('abc', 'xyz')).toBe(3)
  })

  it('handles insertions', () => {
    expect(levenshteinDistance('cat', 'cats')).toBe(1)
    expect(levenshteinDistance('test', 'testing')).toBe(3)
  })

  it('handles deletions', () => {
    expect(levenshteinDistance('cats', 'cat')).toBe(1)
    expect(levenshteinDistance('testing', 'test')).toBe(3)
  })

  it('handles substitutions', () => {
    expect(levenshteinDistance('cat', 'bat')).toBe(1)
    expect(levenshteinDistance('abc', 'axc')).toBe(1)
  })

  it('handles transpositions as 2 operations', () => {
    expect(levenshteinDistance('ab', 'ba')).toBe(2)
  })

  it('handles empty strings', () => {
    expect(levenshteinDistance('', 'abc')).toBe(3)
    expect(levenshteinDistance('abc', '')).toBe(3)
  })
})

describe('similarityScore', () => {
  it('returns 1 for identical strings', () => {
    expect(similarityScore('queen', 'queen')).toBe(1)
  })

  it('returns 1 for two empty strings', () => {
    expect(similarityScore('', '')).toBe(1)
  })

  it('returns 0 when one string is empty', () => {
    expect(similarityScore('', 'queen')).toBe(0)
    expect(similarityScore('queen', '')).toBe(0)
  })

  it('returns high score for minor typos', () => {
    const score = similarityScore('beatles', 'bealtes')
    expect(score).toBeGreaterThan(0.7)
  })

  it('returns low score for very different strings', () => {
    const score = similarityScore('queen', 'metallica')
    expect(score).toBeLessThan(0.3)
  })
})

describe('fuzzyMatch', () => {
  describe('case insensitivity', () => {
    it('matches "Queen" to "queen"', () => {
      const result = fuzzyMatch('Queen', 'queen')
      expect(result.isMatch).toBe(true)
      expect(result.similarity).toBe(1)
    })

    it('matches "METALLICA" to "Metallica"', () => {
      const result = fuzzyMatch('METALLICA', 'Metallica')
      expect(result.isMatch).toBe(true)
    })
  })

  describe('leading "The"', () => {
    it('matches "Beatles" to "The Beatles"', () => {
      const result = fuzzyMatch('Beatles', 'The Beatles')
      expect(result.isMatch).toBe(true)
    })

    it('matches "The Rolling Stones" to "Rolling Stones"', () => {
      const result = fuzzyMatch('The Rolling Stones', 'Rolling Stones')
      expect(result.isMatch).toBe(true)
    })

    it('respects ignoreThe: false option', () => {
      const result = fuzzyMatch('Beatles', 'The Beatles', { ignoreThe: false })
      expect(result.similarity).toBeLessThan(1)
    })
  })

  describe('punctuation', () => {
    it('matches "Dont Stop" to "Don\'t Stop"', () => {
      const result = fuzzyMatch('Dont Stop', "Don't Stop")
      expect(result.isMatch).toBe(true)
    })

    it('matches "Mr Brightside" to "Mr. Brightside"', () => {
      const result = fuzzyMatch('Mr Brightside', 'Mr. Brightside')
      expect(result.isMatch).toBe(true)
    })

    it('matches "Rock N Roll" to "Rock \'n\' Roll"', () => {
      const result = fuzzyMatch('Rock N Roll', "Rock 'n' Roll")
      expect(result.isMatch).toBe(true)
    })
  })

  describe('common misspellings', () => {
    it('matches "Nirvan" to "Nirvana"', () => {
      const result = fuzzyMatch('Nirvan', 'Nirvana')
      expect(result.isMatch).toBe(true)
    })

    it('matches "Metalica" to "Metallica"', () => {
      const result = fuzzyMatch('Metalica', 'Metallica')
      expect(result.isMatch).toBe(true)
    })

    it('matches "Bealtes" to "Beatles"', () => {
      // Bealtes vs Beatles: distance=2 (swap e/a, swap l/t), similarity=5/7=0.71
      // Using lower threshold for transposition-heavy typos
      const result = fuzzyMatch('Bealtes', 'Beatles', { threshold: 0.7 })
      expect(result.isMatch).toBe(true)
    })

    it('matches "Arianna Grande" to "Ariana Grande"', () => {
      const result = fuzzyMatch('Arianna Grande', 'Ariana Grande')
      expect(result.isMatch).toBe(true)
    })
  })

  describe('whitespace', () => {
    it('matches "  queen  " to "Queen"', () => {
      const result = fuzzyMatch('  queen  ', 'Queen')
      expect(result.isMatch).toBe(true)
    })

    it('matches "Led Zeppelin" to "Led  Zeppelin"', () => {
      const result = fuzzyMatch('Led Zeppelin', 'Led  Zeppelin')
      expect(result.isMatch).toBe(true)
    })
  })

  describe('should NOT match', () => {
    it('does not match "Queen" to "Kings"', () => {
      const result = fuzzyMatch('Queen', 'Kings')
      expect(result.isMatch).toBe(false)
    })

    it('does not match "Taylor" to "Swift"', () => {
      const result = fuzzyMatch('Taylor', 'Swift')
      expect(result.isMatch).toBe(false)
    })

    it('does not match empty string to anything', () => {
      const result = fuzzyMatch('', 'Queen')
      expect(result.isMatch).toBe(false)
    })

    it('does not match "totally wrong" to "Queen"', () => {
      const result = fuzzyMatch('totally wrong', 'Queen')
      expect(result.isMatch).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('handles empty strings', () => {
      expect(fuzzyMatch('', '').isMatch).toBe(true)
      expect(fuzzyMatch('', 'test').isMatch).toBe(false)
    })

    it('handles very long strings', () => {
      const long = 'a'.repeat(1000)
      const result = fuzzyMatch(long, long)
      expect(result.isMatch).toBe(true)
    })

    it('handles unicode characters', () => {
      const result = fuzzyMatch('Beyoncé', 'Beyonce')
      expect(result.similarity).toBeGreaterThan(0.8)
    })

    it('handles numbers in titles', () => {
      const result = fuzzyMatch('1999', '1999')
      expect(result.isMatch).toBe(true)
    })

    it('handles "24K Magic" variations', () => {
      const result = fuzzyMatch('24k magic', '24K Magic')
      expect(result.isMatch).toBe(true)
    })
  })

  describe('threshold option', () => {
    it('uses custom threshold', () => {
      const result = fuzzyMatch('cat', 'bat', { threshold: 0.5 })
      expect(result.isMatch).toBe(true)

      const strict = fuzzyMatch('cat', 'bat', { threshold: 0.9 })
      expect(strict.isMatch).toBe(false)
    })
  })

  describe('returns normalized strings', () => {
    it('includes normalized input and target', () => {
      const result = fuzzyMatch('The BEATLES!', 'beatles')
      expect(result.normalized.input).toBe('beatles')
      expect(result.normalized.target).toBe('beatles')
    })
  })
})
