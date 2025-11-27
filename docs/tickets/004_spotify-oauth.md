# 004: Spotify OAuth Authentication

## Summary
Implement Spotify OAuth implicit grant flow for user authentication. Handle token storage and expiry.

## Acceptance Criteria
- [ ] Login button redirects to Spotify auth
- [ ] Callback handles access token from URL hash
- [ ] Token stored in sessionStorage (not localStorage for security)
- [ ] Token expiry tracked
- [ ] Logout clears token
- [ ] Auth state available via context/hook

## Technical Details

### Environment Variables
Create `.env.example`:
```
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
```

### OAuth Config (`src/utils/auth.ts`)
```typescript
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize'

const SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative',
  'streaming',
  'user-modify-playback-state',
  'user-read-playback-state'
].join(' ')

export function getAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
    response_type: 'token',
    redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
    scope: SCOPES,
    show_dialog: 'false'
  })
  return `${SPOTIFY_AUTH_URL}?${params}`
}

export function parseAuthCallback(): AuthResult | null {
  // Parse hash fragment for access_token, expires_in
}

export function getStoredAuth(): StoredAuth | null
export function storeAuth(token: string, expiresIn: number): void
export function clearAuth(): void
export function isTokenExpired(): boolean
```

### Auth Context (`src/hooks/useAuth.ts`)
```typescript
interface AuthState {
  isAuthenticated: boolean
  accessToken: string | null
  expiresAt: number | null
  login: () => void
  logout: () => void
}
```

### Components
- `LoginButton.tsx` - styled login button
- `AuthCallback.tsx` - handles /callback route, extracts token

### Routing
Simple hash-based routing or check pathname:
- `/` - main app
- `/callback` - OAuth callback handler

## Testing
**Unit tests:**
- `getAuthUrl()` constructs correct URL with all scopes
- `parseAuthCallback()` extracts token from various hash formats
- Token storage/retrieval works correctly
- Expiry calculation is accurate

**Manual verification:**
1. Click login → redirected to Spotify
2. Authorize → redirected back with token
3. Refresh page → still logged in (until expiry)
4. Logout → token cleared, shows login button

## Dependencies
- 001_project-setup
- 002_testing-infrastructure

## Notes
- Implicit grant tokens expire in 1 hour
- No refresh token available with implicit grant
- User will need to re-auth after expiry

## Estimated Complexity
Medium
