export interface MatchResult {
  isMatch: boolean
  similarity: number // 0-1
  normalized: {
    input: string
    target: string
  }
}

export interface MatchOptions {
  threshold?: number // default 0.8
  ignoreThe?: boolean // default true (for artists)
}

/**
 * Normalize string for comparison:
 * 1. Trim whitespace
 * 2. Convert to lowercase
 * 3. Remove punctuation (except internal apostrophes)
 * 4. Collapse multiple spaces
 */
export function normalizeString(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^\w\s']/g, '') // remove punctuation except apostrophe
    .replace(/\s+/g, ' ') // collapse multiple spaces
}

/**
 * Remove leading "The " from artist names
 */
export function removeLeadingThe(str: string): string {
  return str.replace(/^the\s+/i, '')
}

/**
 * Remove all punctuation including apostrophes
 */
export function removePunctuation(str: string): string {
  return str.replace(/[^\w\s]/g, '')
}

/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  const matrix: number[][] = []

  // Initialize first column
  for (let i = 0; i <= a.length; i++) {
    matrix[i] = [i]
  }

  // Initialize first row
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j
  }

  // Fill in rest of matrix
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      )
    }
  }

  return matrix[a.length][b.length]
}

/**
 * Calculate similarity score (0-1) based on Levenshtein distance
 */
export function similarityScore(a: string, b: string): number {
  if (a.length === 0 && b.length === 0) return 1
  if (a.length === 0 || b.length === 0) return 0

  const distance = levenshteinDistance(a, b)
  const maxLength = Math.max(a.length, b.length)
  return 1 - distance / maxLength
}

/**
 * Fuzzy match input against target with configurable threshold
 */
export function fuzzyMatch(
  input: string,
  target: string,
  options: MatchOptions = {}
): MatchResult {
  const { threshold = 0.8, ignoreThe = true } = options

  // Normalize both strings
  let normalizedInput = normalizeString(input)
  let normalizedTarget = normalizeString(target)

  // Optionally remove leading "The"
  if (ignoreThe) {
    normalizedInput = removeLeadingThe(normalizedInput)
    normalizedTarget = removeLeadingThe(normalizedTarget)
  }

  // Calculate similarity
  const similarity = similarityScore(normalizedInput, normalizedTarget)
  const isMatch = similarity >= threshold

  return {
    isMatch,
    similarity,
    normalized: {
      input: normalizedInput,
      target: normalizedTarget,
    },
  }
}
