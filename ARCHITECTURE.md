# Architecture

## Overview

Spotify Trainer is a frontend-only React app for bar trivia practice. Users authenticate with Spotify, select a playlist, and guess song artist/title from audio snippets.

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin)
- **Vitest** + **React Testing Library** for tests
- **Spotify Web API** for data
- **Spotify Web Playback SDK** (future) for audio

## Directory Structure

```
src/
├── main.tsx              # Entry point, renders App
├── App.tsx               # Root component, orchestrates auth flow
├── index.css             # Global styles, Tailwind import
├── components/
│   ├── LoginButton.tsx   # Spotify-branded login button
│   ├── PremiumRequired.tsx # Error screen for non-premium users
│   └── __tests__/        # Component tests
├── hooks/
│   ├── useAuth.ts        # OAuth state management
│   ├── usePremiumCheck.ts # Fetches user, checks premium status
│   └── __tests__/        # Hook tests
├── utils/
│   ├── auth.ts           # PKCE OAuth helpers, token storage
│   ├── spotify.ts        # SpotifyClient API wrapper
│   └── __tests__/        # Utility tests
├── types/
│   └── spotify.ts        # Spotify API type definitions
└── test/
    ├── setup.ts          # Vitest setup (jsdom, jest-dom)
    └── utils.tsx         # Custom render with providers
```

## Data Flow

```
┌─────────────┐
│   App.tsx   │
└──────┬──────┘
       │
       ├── useAuth() ─────────────────────────┐
       │   └── Returns: isAuthenticated,      │
       │       accessToken, login, logout     │
       │                                      │
       ├── usePremiumCheck(accessToken) ──────┤
       │   └── Returns: isPremium, user       │
       │                                      │
       │                                      ▼
       │                          ┌───────────────────┐
       │                          │   localStorage    │
       │                          │  - spotify_auth   │
       │                          │  - code_verifier  │
       │                          └───────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────┐
│                    Render Logic                       │
├──────────────────────────────────────────────────────┤
│ if (loading)        → "Loading..."                   │
│ if (!authenticated) → LoginButton                    │
│ if (!premium)       → PremiumRequired                │
│ else                → Main app (future)              │
└──────────────────────────────────────────────────────┘
```

## Authentication

### OAuth 2.0 PKCE Flow

```
1. User clicks Login
   └── getAuthUrl() generates:
       - code_verifier (random 64 chars)
       - code_challenge (SHA-256 hash, base64url)
       - Stores verifier in sessionStorage

2. Redirect to Spotify /authorize
   └── Params: client_id, redirect_uri, scope,
       code_challenge, code_challenge_method=S256

3. User authorizes, Spotify redirects to /callback?code=xxx

4. useAuth detects /callback route
   └── exchangeCodeForToken(code)
       - POSTs to /api/token with code + verifier
       - Returns access_token, expires_in

5. Token stored in sessionStorage
   └── { accessToken, expiresAt }

6. URL cleaned up → window.history.replaceState('/')
```

### Token Storage

- **Location**: `localStorage` (persists across sessions)
- **Key**: `spotify_auth`
- **Format**: `{ accessToken: string, expiresAt: number }`
- **Expiry buffer**: 60 seconds before actual expiry

### Required Scopes

```
user-read-private           # User profile
user-read-email             # Email (not used yet)
playlist-read-private       # User's private playlists
playlist-read-collaborative # Collaborative playlists
streaming                   # Web Playback SDK
user-modify-playback-state  # Control playback
user-read-playback-state    # Read playback state
```

## API Layer

### SpotifyClient (`src/utils/spotify.ts`)

Class-based API wrapper with pagination support.

```typescript
class SpotifyClient {
  constructor(accessToken: string)

  getCurrentUser(): Promise<SpotifyUser>
  getUserPlaylists(): Promise<SpotifyPlaylist[]>    // Paginated
  getPlaylist(id: string): Promise<SpotifyPlaylist>
  getPlaylistTracks(id: string): Promise<SpotifyTrack[]>  // Paginated
  startPlayback(deviceId, trackUri, positionMs): Promise<void>
  pausePlayback(deviceId): Promise<void>
}
```

### Type Imports

**Important**: Use `import type` for interfaces (Vite strips them at compile time):

```typescript
import type { SpotifyUser, SpotifyPlaylist } from '../types/spotify'
import { SpotifyError } from '../types/spotify'  // Class = runtime value
```

## State Management

Currently using React hooks only:

| Hook | Purpose | State |
|------|---------|-------|
| `useAuth` | OAuth flow, token management | `auth`, `isLoading` |
| `usePremiumCheck` | Fetch user, check premium | `isPremium`, `user`, `isLoading`, `error` |

Future hooks planned:
- `useGameState` - Round management, scoring
- `usePlayback` - Web Playback SDK control

## Components

### Current

| Component | Props | Purpose |
|-----------|-------|---------|
| `App` | none | Root, auth orchestration |
| `LoginButton` | `onClick` | Spotify-branded login CTA |
| `PremiumRequired` | `onLogout` | Error screen for free users |

### Planned

- `PlaylistSelector` - Pick from user playlists or enter ID
- `GameSettings` - Configure rounds, snippet duration
- `GameRound` - Playback controls, answer inputs
- `ResultFeedback` - Correct/incorrect feedback
- `EndScreen` - Final score summary

## Testing

### Setup

- **Environment**: jsdom
- **Globals**: Vitest globals enabled
- **Matchers**: `@testing-library/jest-dom`

### Patterns

```typescript
// Mocking hooks
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

// Mocking classes
vi.mock('../../utils/spotify', () => ({
  SpotifyClient: class MockSpotifyClient {
    getCurrentUser = vi.fn()
  },
}))

// Custom render with providers
import { render } from '../../test/utils'
```

### Coverage

```
src/utils/auth.ts       - 12 tests
src/utils/spotify.ts    - 11 tests
src/hooks/usePremiumCheck.ts - 6 tests
src/components/App.tsx  - 5 tests
src/components/PremiumRequired.tsx - 4 tests
```

## Environment Variables

```bash
# .env (git-ignored)
VITE_SPOTIFY_CLIENT_ID=xxx
VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/callback
```

Note: `VITE_` prefix required for client-side access.

## Future Architecture

### Web Playback SDK Integration

```
┌─────────────────┐     ┌──────────────────┐
│  usePlayback()  │────▶│ Spotify.Player   │
└────────┬────────┘     └────────┬─────────┘
         │                       │
         │ device_id             │ events
         ▼                       ▼
┌─────────────────┐     ┌──────────────────┐
│ SpotifyClient   │     │ onReady          │
│ .startPlayback()│     │ onStateChange    │
└─────────────────┘     │ onError          │
                        └──────────────────┘
```

### Game Flow

```
PlaylistSelection
      │
      ▼
  GameSettings
      │
      ▼
┌─────────────┐
│  GameRound  │◀──┐
│  (x8 by     │   │
│   default)  │───┘
└──────┬──────┘
       │
       ▼
   EndScreen
```
