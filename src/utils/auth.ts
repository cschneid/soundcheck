const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize'
const STORAGE_KEY = 'spotify_auth'

const SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative',
  'streaming',
  'user-modify-playback-state',
  'user-read-playback-state',
].join(' ')

export interface StoredAuth {
  accessToken: string
  expiresAt: number
}

export interface AuthResult {
  accessToken: string
  expiresIn: number
}

export function getAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
    response_type: 'token',
    redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
    scope: SCOPES,
    show_dialog: 'false',
  })
  return `${SPOTIFY_AUTH_URL}?${params}`
}

export function parseAuthCallback(hash: string): AuthResult | null {
  if (!hash || hash.length < 2) return null

  const params = new URLSearchParams(hash.substring(1))
  const accessToken = params.get('access_token')
  const expiresIn = params.get('expires_in')

  if (!accessToken || !expiresIn) return null

  return {
    accessToken,
    expiresIn: parseInt(expiresIn, 10),
  }
}

export function storeAuth(token: string, expiresIn: number): void {
  const expiresAt = Date.now() + expiresIn * 1000
  const auth: StoredAuth = { accessToken: token, expiresAt }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
}

export function getStoredAuth(): StoredAuth | null {
  const stored = sessionStorage.getItem(STORAGE_KEY)
  if (!stored) return null

  try {
    const auth: StoredAuth = JSON.parse(stored)
    if (isExpired(auth.expiresAt)) {
      clearAuth()
      return null
    }
    return auth
  } catch {
    clearAuth()
    return null
  }
}

export function clearAuth(): void {
  sessionStorage.removeItem(STORAGE_KEY)
}

export function isExpired(expiresAt: number): boolean {
  // Add 60 second buffer to avoid edge cases
  return Date.now() > expiresAt - 60000
}
