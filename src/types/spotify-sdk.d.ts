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
    addListener(event: 'ready', callback: (state: ReadyState) => void): void
    addListener(event: 'not_ready', callback: (state: ReadyState) => void): void
    addListener(event: 'player_state_changed', callback: (state: PlaybackState | null) => void): void
    addListener(event: 'initialization_error', callback: (error: ErrorState) => void): void
    addListener(event: 'authentication_error', callback: (error: ErrorState) => void): void
    addListener(event: 'account_error', callback: (error: ErrorState) => void): void
    addListener(event: 'playback_error', callback: (error: ErrorState) => void): void
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

  interface ReadyState {
    device_id: string
  }

  interface ErrorState {
    message: string
  }

  interface PlaybackState {
    position: number
    duration: number
    paused: boolean
    track_window: {
      current_track: WebPlaybackTrack
    }
  }

  interface WebPlaybackTrack {
    uri: string
    id: string
    type: string
    media_type: string
    name: string
    is_playable: boolean
    album: {
      uri: string
      name: string
      images: Array<{ url: string }>
    }
    artists: Array<{
      uri: string
      name: string
    }>
  }
}

export {}
