import { describe, it, expect } from 'vitest'
import { scoreAnswer } from '../scoring'
import type { SpotifyTrack } from '../../types/spotify'

const createTrack = (
  name: string,
  artists: { id: string; name: string }[]
): SpotifyTrack => ({
  id: '1',
  name,
  artists,
  album: { name: 'Test Album', images: [] },
  duration_ms: 180000,
  uri: 'spotify:track:1',
})

describe('scoreAnswer', () => {
  it('scores correct artist as correct', () => {
    const track = createTrack('Bohemian Rhapsody', [{ id: '1', name: 'Queen' }])
    const result = scoreAnswer('Queen', 'Wrong Title', track)
    expect(result.artistCorrect).toBe(true)
  })

  it('scores correct title as correct', () => {
    const track = createTrack('Bohemian Rhapsody', [{ id: '1', name: 'Queen' }])
    const result = scoreAnswer('Wrong Artist', 'Bohemian Rhapsody', track)
    expect(result.titleCorrect).toBe(true)
  })

  it('scores wrong artist as incorrect', () => {
    const track = createTrack('Bohemian Rhapsody', [{ id: '1', name: 'Queen' }])
    const result = scoreAnswer('Metallica', 'Bohemian Rhapsody', track)
    expect(result.artistCorrect).toBe(false)
  })

  it('scores wrong title as incorrect', () => {
    const track = createTrack('Bohemian Rhapsody', [{ id: '1', name: 'Queen' }])
    const result = scoreAnswer('Queen', 'Stairway to Heaven', track)
    expect(result.titleCorrect).toBe(false)
  })

  it('matches any of multiple artists', () => {
    const track = createTrack('Under Pressure', [
      { id: '1', name: 'Queen' },
      { id: '2', name: 'David Bowie' },
    ])

    const result1 = scoreAnswer('Queen', 'Under Pressure', track)
    expect(result1.artistCorrect).toBe(true)
    expect(result1.artistMatch.matchedArtist).toBe('Queen')

    const result2 = scoreAnswer('David Bowie', 'Under Pressure', track)
    expect(result2.artistCorrect).toBe(true)
    expect(result2.artistMatch.matchedArtist).toBe('David Bowie')
  })

  it('handles empty artist guess', () => {
    const track = createTrack('Bohemian Rhapsody', [{ id: '1', name: 'Queen' }])
    const result = scoreAnswer('', 'Bohemian Rhapsody', track)
    expect(result.artistCorrect).toBe(false)
    expect(result.artistMatch.similarity).toBe(0)
  })

  it('handles empty title guess', () => {
    const track = createTrack('Bohemian Rhapsody', [{ id: '1', name: 'Queen' }])
    const result = scoreAnswer('Queen', '', track)
    expect(result.titleCorrect).toBe(false)
  })

  it('handles fuzzy artist matches', () => {
    const track = createTrack('Bohemian Rhapsody', [{ id: '1', name: 'Queen' }])
    const result = scoreAnswer('Quen', 'Bohemian Rhapsody', track)
    expect(result.artistCorrect).toBe(true)
  })

  it('handles fuzzy title matches', () => {
    const track = createTrack('Bohemian Rhapsody', [{ id: '1', name: 'Queen' }])
    const result = scoreAnswer('Queen', 'Bohemian Rapsody', track)
    expect(result.titleCorrect).toBe(true)
  })

  it('ignores "The" in artist names', () => {
    const track = createTrack('Come Together', [{ id: '1', name: 'The Beatles' }])
    const result = scoreAnswer('Beatles', 'Come Together', track)
    expect(result.artistCorrect).toBe(true)
  })

  it('handles case insensitivity', () => {
    const track = createTrack('Bohemian Rhapsody', [{ id: '1', name: 'Queen' }])
    const result = scoreAnswer('QUEEN', 'BOHEMIAN RHAPSODY', track)
    expect(result.artistCorrect).toBe(true)
    expect(result.titleCorrect).toBe(true)
  })

  it('returns similarity scores', () => {
    const track = createTrack('Bohemian Rhapsody', [{ id: '1', name: 'Queen' }])
    const result = scoreAnswer('Queen', 'Bohemian Rhapsody', track)
    expect(result.artistMatch.similarity).toBe(1)
    expect(result.titleMatch.similarity).toBe(1)
  })

  it('returns best similarity even when no match', () => {
    const track = createTrack('Bohemian Rhapsody', [
      { id: '1', name: 'Queen' },
      { id: '2', name: 'Freddie Mercury' },
    ])
    const result = scoreAnswer('Totally Wrong', 'Bohemian Rhapsody', track)
    expect(result.artistCorrect).toBe(false)
    expect(result.artistMatch.similarity).toBeGreaterThan(0)
  })
})
