/**
 * Extracts a Spotify playlist ID from various input formats.
 *
 * Supported formats:
 * - spotify:playlist:37i9dQZF1DXcBWIGoYBM5M (Spotify URI)
 * - https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
 * - https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=abc123
 * - open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
 * - 37i9dQZF1DXcBWIGoYBM5M (raw ID)
 */
export function parsePlaylistId(input: string): string | null {
  if (!input || typeof input !== 'string') {
    return null
  }

  const trimmed = input.trim()
  if (!trimmed) {
    return null
  }

  // Spotify URI format: spotify:playlist:ID
  const uriMatch = trimmed.match(/^spotify:playlist:([a-zA-Z0-9]+)$/)
  if (uriMatch) {
    return uriMatch[1]
  }

  // URL format: extract from path
  // Handle with or without protocol
  const urlPattern = /(?:https?:\/\/)?(?:open\.)?spotify\.com\/playlist\/([a-zA-Z0-9]+)/
  const urlMatch = trimmed.match(urlPattern)
  if (urlMatch) {
    return urlMatch[1]
  }

  // Raw ID: alphanumeric, typically 22 characters
  // Spotify IDs are base62 encoded
  const rawIdMatch = trimmed.match(/^[a-zA-Z0-9]{22}$/)
  if (rawIdMatch) {
    return trimmed
  }

  return null
}
