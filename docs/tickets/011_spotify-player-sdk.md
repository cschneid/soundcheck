# 011: Spotify Web Playback SDK Integration

## Summary
Integrate the Spotify Web Playback SDK to enable audio playback directly in the browser.

## Acceptance Criteria
- [ ] SDK script loaded dynamically
- [ ] Player instance created and connected
- [ ] Device registered with Spotify
- [ ] Player ready state tracked
- [ ] Handle connection errors gracefully
- [ ] Clean up on unmount

## Technical Details

### SDK Loading (`src/utils/loadSpotifySDK.ts`)
```typescript
export function loadSpotifySDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Spotify) {
      resolve()
      return
    }

    window.onSpotifyWebPlaybackSDKReady = () => resolve()

    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.onerror = reject
    document.body.appendChild(script)
  })
}
```

### Type Definitions (`src/types/spotify-sdk.d.ts`)
```typescript
declare global {
  interface Window {
    Spotify: typeof Spotify
    onSpotifyWebPlaybackSDKReady: () => void
  }
}

declare namespace Spotify {
  class Player {
    constructor(options: PlayerOptions)
    connect(): Promise<boolean>
    disconnect(): void
    addListener(event: string, callback: Function): void
    removeListener(event: string): void
    getCurrentState(): Promise<PlaybackState | null>
    setVolume(volume: number): Promise<void>
    pause(): Promise<void>
    resume(): Promise<void>
    seek(positionMs: number): Promise<void>
    togglePlay(): Promise<void>
  }

  interface PlayerOptions {
    name: string
    getOAuthToken: (cb: (token: string) => void) => void
    volume?: number
  }

  interface PlaybackState {
    position: number
    duration: number
    paused: boolean
    track_window: {
      current_track: WebPlaybackTrack
    }
  }
}
```

### Player Hook (`src/hooks/useSpotifyPlayer.ts`)
```typescript
interface UseSpotifyPlayerReturn {
  player: Spotify.Player | null
  deviceId: string | null
  isReady: boolean
  error: string | null
}

export function useSpotifyPlayer(accessToken: string): UseSpotifyPlayerReturn
```

### Player Events to Handle
- `ready` → store device ID
- `not_ready` → device went offline
- `initialization_error` → SDK failed to initialize
- `authentication_error` → token issue
- `account_error` → Premium required
- `playback_error` → track won't play

## Testing
**Unit tests:**
- SDK loading logic
- Error handling for failed loads

**Manual verification:**
1. Login → player connects (check Spotify app shows "Web Playback SDK")
2. SDK errors handled gracefully
3. Logout → player disconnects

## Dependencies
- 004_spotify-oauth
- 005_premium-check

## Notes
- SDK requires HTTPS in production (localhost is exempt)
- Only one player instance should exist at a time
- Player name appears in Spotify's device list

## Estimated Complexity
Large
