import type { SpotifyTrack } from './spotify'

export type GamePhase = 'setup' | 'playing' | 'complete'

export interface RoundResult {
  track: SpotifyTrack
  artistAnswer: string
  titleAnswer: string
  artistCorrect: boolean
  titleCorrect: boolean
}

export interface GameSettings {
  roundCount: number
  snippetDuration: number // seconds
}

export interface GameState {
  phase: GamePhase
  tracks: SpotifyTrack[]
  currentRoundIndex: number
  results: RoundResult[]
  settings: GameSettings
}

export const DEFAULT_SETTINGS: GameSettings = {
  roundCount: 8,
  snippetDuration: 10,
}
