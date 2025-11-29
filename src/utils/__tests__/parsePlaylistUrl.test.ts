import { describe, it, expect } from 'vitest'
import { parsePlaylistId } from '../parsePlaylistUrl'

describe('parsePlaylistId', () => {
  it('extracts ID from spotify URI', () => {
    expect(parsePlaylistId('spotify:playlist:37i9dQZF1DXcBWIGoYBM5M')).toBe(
      '37i9dQZF1DXcBWIGoYBM5M'
    )
  })

  it('extracts ID from full URL with https', () => {
    expect(
      parsePlaylistId('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M')
    ).toBe('37i9dQZF1DXcBWIGoYBM5M')
  })

  it('extracts ID from URL with query params', () => {
    expect(
      parsePlaylistId(
        'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=abc123'
      )
    ).toBe('37i9dQZF1DXcBWIGoYBM5M')
  })

  it('extracts ID from URL without protocol', () => {
    expect(
      parsePlaylistId('open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M')
    ).toBe('37i9dQZF1DXcBWIGoYBM5M')
  })

  it('extracts ID from URL with http', () => {
    expect(
      parsePlaylistId('http://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M')
    ).toBe('37i9dQZF1DXcBWIGoYBM5M')
  })

  it('returns raw ID if valid 22-char format', () => {
    expect(parsePlaylistId('37i9dQZF1DXcBWIGoYBM5M')).toBe(
      '37i9dQZF1DXcBWIGoYBM5M'
    )
  })

  it('returns null for empty string', () => {
    expect(parsePlaylistId('')).toBeNull()
  })

  it('returns null for whitespace only', () => {
    expect(parsePlaylistId('   ')).toBeNull()
  })

  it('returns null for null/undefined input', () => {
    expect(parsePlaylistId(null as unknown as string)).toBeNull()
    expect(parsePlaylistId(undefined as unknown as string)).toBeNull()
  })

  it('returns null for track URLs', () => {
    expect(
      parsePlaylistId('https://open.spotify.com/track/37i9dQZF1DXcBWIGoYBM5M')
    ).toBeNull()
  })

  it('returns null for album URLs', () => {
    expect(
      parsePlaylistId('https://open.spotify.com/album/37i9dQZF1DXcBWIGoYBM5M')
    ).toBeNull()
  })

  it('returns null for artist URLs', () => {
    expect(
      parsePlaylistId('https://open.spotify.com/artist/37i9dQZF1DXcBWIGoYBM5M')
    ).toBeNull()
  })

  it('returns null for invalid ID length', () => {
    expect(parsePlaylistId('tooshort')).toBeNull()
    expect(parsePlaylistId('waytoolongtobeavalidspotifyid123')).toBeNull()
  })

  it('returns null for track URI', () => {
    expect(parsePlaylistId('spotify:track:37i9dQZF1DXcBWIGoYBM5M')).toBeNull()
  })

  it('trims whitespace from input', () => {
    expect(parsePlaylistId('  37i9dQZF1DXcBWIGoYBM5M  ')).toBe(
      '37i9dQZF1DXcBWIGoYBM5M'
    )
  })
})
