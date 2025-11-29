const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize'
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const STORAGE_KEY = 'spotify_auth'
const VERIFIER_KEY = 'spotify_code_verifier'

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

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope: string
}

// PKCE helpers
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const values = crypto.getRandomValues(new Uint8Array(length))
  return values.reduce((acc, x) => acc + possible[x % possible.length], '')
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return crypto.subtle.digest('SHA-256', data)
}

function base64urlencode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let str = ''
  bytes.forEach((b) => (str += String.fromCharCode(b)))
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const hashed = await sha256(verifier)
  return base64urlencode(hashed)
}

export async function getAuthUrl(): Promise<string> {
  const codeVerifier = generateRandomString(64)
  const codeChallenge = await generateCodeChallenge(codeVerifier)

  // Store verifier for token exchange (use localStorage - sessionStorage can be lost on redirect)
  localStorage.setItem(VERIFIER_KEY, codeVerifier)

  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  })
  return `${SPOTIFY_AUTH_URL}?${params}`
}

export function parseAuthCallback(search: string): string | null {
  const params = new URLSearchParams(search)
  const code = params.get('code')
  const error = params.get('error')

  if (error) {
    console.error('Auth error:', error)
    return null
  }

  return code
}

export async function exchangeCodeForToken(code: string): Promise<TokenResponse | null> {
  const codeVerifier = localStorage.getItem(VERIFIER_KEY)
  if (!codeVerifier) {
    console.error('No code verifier found')
    return null
  }

  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
    grant_type: 'authorization_code',
    code,
    redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
    code_verifier: codeVerifier,
  })

  try {
    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Token exchange failed:', error)
      return null
    }

    // Clear the verifier
    localStorage.removeItem(VERIFIER_KEY)

    return response.json()
  } catch (error) {
    console.error('Token exchange error:', error)
    return null
  }
}

export function storeAuth(token: string, expiresIn: number): void {
  const expiresAt = Date.now() + expiresIn * 1000
  const auth: StoredAuth = { accessToken: token, expiresAt }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
}

export function getStoredAuth(): StoredAuth | null {
  const stored = localStorage.getItem(STORAGE_KEY)
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
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(VERIFIER_KEY)
}

export function isExpired(expiresAt: number): boolean {
  // Add 60 second buffer to avoid edge cases
  return Date.now() > expiresAt - 60000
}
