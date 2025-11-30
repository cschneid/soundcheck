import { fuzzyMatch } from './fuzzyMatch'
import type { SpotifyTrack, SpotifyArtist } from '../types/spotify'

export interface ArtistMatchResult {
  isMatch: boolean
  similarity: number
  matchedArtist?: string
}

export interface ScoringResult {
  artistCorrect: boolean
  titleCorrect: boolean
  artistMatch: ArtistMatchResult
  titleMatch: {
    isMatch: boolean
    similarity: number
  }
}

/**
 * Match artist guess against any of the track's artists
 */
function matchArtist(guess: string, artists: SpotifyArtist[]): ArtistMatchResult {
  if (!guess.trim()) {
    return { isMatch: false, similarity: 0 }
  }

  for (const artist of artists) {
    const result = fuzzyMatch(guess, artist.name, { ignoreThe: true })
    if (result.isMatch) {
      return {
        isMatch: true,
        similarity: result.similarity,
        matchedArtist: artist.name,
      }
    }
  }

  // Find best similarity even if no match
  let bestSimilarity = 0
  for (const artist of artists) {
    const result = fuzzyMatch(guess, artist.name, { ignoreThe: true })
    if (result.similarity > bestSimilarity) {
      bestSimilarity = result.similarity
    }
  }

  return { isMatch: false, similarity: bestSimilarity }
}

/**
 * Score an answer against a track
 */
export function scoreAnswer(
  artistGuess: string,
  titleGuess: string,
  track: SpotifyTrack
): ScoringResult {
  const artistMatch = matchArtist(artistGuess, track.artists)
  const titleResult = fuzzyMatch(titleGuess, track.name, { ignoreThe: false })

  return {
    artistCorrect: artistMatch.isMatch,
    titleCorrect: titleResult.isMatch,
    artistMatch,
    titleMatch: {
      isMatch: titleResult.isMatch,
      similarity: titleResult.similarity,
    },
  }
}
