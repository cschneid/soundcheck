export interface SpotifyPlayerOptions {
  name: string
  getOAuthToken: (cb: (token: string) => void) => void
  volume?: number
}

export interface SpotifyReadyState {
  device_id: string
}

export interface SpotifyErrorState {
  message: string
}

export interface SpotifyPlaybackState {
  position: number
  duration: number
  paused: boolean
  track_window: {
    current_track: SpotifyWebPlaybackTrack
  }
}

export interface SpotifyWebPlaybackTrack {
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

export interface SpotifyPlayer {
  connect(): Promise<boolean>
  disconnect(): void
  addListener(event: 'ready', callback: (state: SpotifyReadyState) => void): void
  addListener(event: 'not_ready', callback: (state: SpotifyReadyState) => void): void
  addListener(event: 'player_state_changed', callback: (state: SpotifyPlaybackState | null) => void): void
  addListener(event: 'initialization_error', callback: (error: SpotifyErrorState) => void): void
  addListener(event: 'authentication_error', callback: (error: SpotifyErrorState) => void): void
  addListener(event: 'account_error', callback: (error: SpotifyErrorState) => void): void
  addListener(event: 'playback_error', callback: (error: SpotifyErrorState) => void): void
  removeListener(event: string, callback?: unknown): void
  getCurrentState(): Promise<SpotifyPlaybackState | null>
  setVolume(volume: number): Promise<void>
  pause(): Promise<void>
  resume(): Promise<void>
  seek(positionMs: number): Promise<void>
  togglePlay(): Promise<void>
}

export interface SpotifyPlayerConstructor {
  new(options: SpotifyPlayerOptions): SpotifyPlayer
}

export interface SpotifySDK {
  Player: SpotifyPlayerConstructor
}

declare global {
  interface Window {
    Spotify: SpotifySDK
    onSpotifyWebPlaybackSDKReady: () => void
  }
}
