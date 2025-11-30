import { describe, it, expect } from 'vitest'
import {
  normalizeString,
  removeLeadingThe,
  removePunctuation,
  extractBaseTitle,
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

  it('normalizes -in\' endings to -ing', () => {
    expect(normalizeString("Walkin'")).toBe('walking')
    expect(normalizeString("Lovin' You")).toBe('loving you')
    expect(normalizeString("Rockin' Around")).toBe('rocking around')
  })

  it('collapses multiple spaces', () => {
    expect(normalizeString('Led  Zeppelin')).toBe('led zeppelin')
    expect(normalizeString('a   b    c')).toBe('a b c')
  })
})

describe('removeLeadingThe (removeLeadingArticle)', () => {
  it('removes "The " prefix', () => {
    expect(removeLeadingThe('The Beatles')).toBe('Beatles')
  })

  it('removes "the " prefix (lowercase)', () => {
    expect(removeLeadingThe('the beatles')).toBe('beatles')
  })

  it('removes "These " prefix', () => {
    expect(removeLeadingThe('These Boots')).toBe('Boots')
    expect(removeLeadingThe('these boots are made for walking')).toBe('boots are made for walking')
  })

  it('removes "A " prefix', () => {
    expect(removeLeadingThe('A Day in the Life')).toBe('Day in the Life')
  })

  it('removes "An " prefix', () => {
    expect(removeLeadingThe('An American Prayer')).toBe('American Prayer')
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

describe('extractBaseTitle', () => {
  it('removes parenthetical suffixes', () => {
    expect(extractBaseTitle("I Can't Help Myself (Sugar Pie, Honey Bunch)")).toBe("I Can't Help Myself")
    expect(extractBaseTitle('Song (Remastered 2021)')).toBe('Song')
  })

  it('removes bracketed suffixes', () => {
    expect(extractBaseTitle('Song [Live]')).toBe('Song')
    expect(extractBaseTitle('Song [Bonus Track]')).toBe('Song')
  })

  it('removes common dash suffixes', () => {
    expect(extractBaseTitle('Maybe - Vocal Version')).toBe('Maybe')
    expect(extractBaseTitle('Song - Remastered')).toBe('Song')
    expect(extractBaseTitle('Song - Live at Wembley')).toBe('Song')
    expect(extractBaseTitle('Song - Radio Edit')).toBe('Song')
    expect(extractBaseTitle('Song - Acoustic Version')).toBe('Song')
  })

  it('removes year-prefixed remaster suffixes', () => {
    expect(extractBaseTitle('Immigrant Song - 1990 Remaster')).toBe('Immigrant Song')
    expect(extractBaseTitle('Stairway to Heaven - 2007 Remaster')).toBe('Stairway to Heaven')
  })

  it('preserves titles without suffixes', () => {
    expect(extractBaseTitle('Bohemian Rhapsody')).toBe('Bohemian Rhapsody')
    expect(extractBaseTitle('Hey Jude')).toBe('Hey Jude')
  })

  it('handles dashes that are part of the title', () => {
    // Only removes known suffix patterns after dash
    expect(extractBaseTitle('Iko-Iko')).toBe('Iko-Iko')
    expect(extractBaseTitle('Ob-La-Di, Ob-La-Da')).toBe('Ob-La-Di, Ob-La-Da')
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

  describe('parenthetical/suffix matching', () => {
    it('matches base title against full title with parenthetical', () => {
      const result = fuzzyMatch("I Can't Help Myself", "I Can't Help Myself (Sugar Pie, Honey Bunch)")
      expect(result.isMatch).toBe(true)
      expect(result.similarity).toBe(1)
    })

    it('matches base title against title with remaster suffix', () => {
      const result = fuzzyMatch('Maybe', 'Maybe - Vocal Version')
      expect(result.isMatch).toBe(true)
    })

    it('matches base title against title with brackets', () => {
      const result = fuzzyMatch('Bohemian Rhapsody', 'Bohemian Rhapsody [Live]')
      expect(result.isMatch).toBe(true)
    })

    it('still matches if user includes the suffix', () => {
      const result = fuzzyMatch("I Can't Help Myself (Sugar Pie, Honey Bunch)", "I Can't Help Myself (Sugar Pie, Honey Bunch)")
      expect(result.isMatch).toBe(true)
    })

    it('handles complex suffixes', () => {
      const result = fuzzyMatch('Yesterday', 'Yesterday - Remastered 2009')
      expect(result.isMatch).toBe(true)
    })

    it('handles year-prefixed remaster in full title', () => {
      const result = fuzzyMatch('Immigrant Song', 'Immigrant Song - 1990 Remaster')
      expect(result.isMatch).toBe(true)
    })
  })

  describe('These and article handling', () => {
    it('matches "boots are made for walking" to "These Boots Are Made for Walkin\'"', () => {
      const result = fuzzyMatch('boots are made for walking', "These Boots Are Made for Walkin'")
      expect(result.isMatch).toBe(true)
    })

    it('matches "day in the life" to "A Day in the Life"', () => {
      const result = fuzzyMatch('day in the life', 'A Day in the Life')
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
