import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { usePremiumCheck } from './hooks/usePremiumCheck'
import { usePlaylists } from './hooks/usePlaylists'
import { usePlaylistTracks } from './hooks/usePlaylistTracks'
import { useGameState } from './hooks/useGameState'
import { useSpotifyPlayer } from './hooks/useSpotifyPlayer'
import { LoginButton } from './components/LoginButton'
import { PremiumRequired } from './components/PremiumRequired'
import { PlaylistPicker } from './components/PlaylistPicker'
import { GameSettings } from './components/GameSettings'
import type { SpotifyPlaylist } from './types/spotify'
import type { GameSettings as GameSettingsType } from './types/game'

function App() {
  const { isAuthenticated, accessToken, isLoading: authLoading, login, logout } = useAuth()
  const { isLoading: premiumLoading, isPremium, user } = usePremiumCheck(accessToken)
  const { playlists, isLoading: playlistsLoading, error: playlistsError } = usePlaylists(accessToken)
  const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyPlaylist | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const { tracks, isLoading: tracksLoading, error: tracksError } = usePlaylistTracks(
    selectedPlaylist?.id ?? null,
    accessToken
  )
  const { state: gameState, startGame, resetGame } = useGameState()
  const { deviceId, isReady: playerReady, error: playerError } = useSpotifyPlayer(accessToken)

  const handlePlaylistSelect = (playlist: SpotifyPlaylist) => {
    setSelectedPlaylist(playlist)
    setShowSettings(false)
  }

  const handleConfigureGame = () => {
    setShowSettings(true)
  }

  const handleStartGame = (settings: GameSettingsType) => {
    startGame(tracks, settings)
  }

  const handleBackToPlaylist = () => {
    setShowSettings(false)
  }

  const isLoading = authLoading || (isAuthenticated && premiumLoading)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-green-500 mb-4">
            Spotify Trainer
          </h1>
          <p className="text-gray-400 mb-8">
            Train for bar trivia with your Spotify playlists
          </p>
          <LoginButton onClick={login} />
        </div>
      </div>
    )
  }

  if (!isPremium) {
    return <PremiumRequired onLogout={logout} />
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-green-500">Spotify Trainer</h1>
            <p className="text-gray-400 text-sm">
              Welcome{user?.display_name ? `, ${user.display_name}` : ''}
              {playerReady && (
                <span className="ml-2 text-green-400">• Player ready</span>
              )}
              {playerError && (
                <span className="ml-2 text-red-400">• {playerError}</span>
              )}
            </p>
          </div>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-white text-sm underline"
          >
            Logout
          </button>
        </header>

        <section>
          <h2 className="text-lg font-semibold text-white mb-4">
            Select a playlist
          </h2>
          <PlaylistPicker
            playlists={playlists}
            playlistsLoading={playlistsLoading}
            playlistsError={playlistsError}
            accessToken={accessToken!}
            onSelect={handlePlaylistSelect}
            selectedId={selectedPlaylist?.id}
          />
        </section>

        {selectedPlaylist && !showSettings && gameState.phase === 'setup' && (
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <p className="text-white">
              Selected: <strong>{selectedPlaylist.name}</strong>
            </p>
            {tracksLoading && (
              <p className="text-gray-400 mt-2">Loading tracks...</p>
            )}
            {tracksError && (
              <p className="text-red-400 mt-2">{tracksError}</p>
            )}
            {!tracksLoading && !tracksError && (
              <>
                <p className="text-gray-400 mt-2">
                  {tracks.length} playable tracks
                </p>
                <button
                  onClick={handleConfigureGame}
                  disabled={tracks.length === 0}
                  className="mt-4 px-6 py-2 bg-green-500 text-white rounded-full font-semibold hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Configure Game
                </button>
              </>
            )}
          </div>
        )}

        {selectedPlaylist && showSettings && gameState.phase === 'setup' && (
          <div className="mt-8">
            <GameSettings
              playlist={selectedPlaylist}
              availableTrackCount={tracks.length}
              onStart={handleStartGame}
              onBack={handleBackToPlaylist}
            />
          </div>
        )}

        {gameState.phase === 'playing' && (
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <p className="text-white">
              Playing round {gameState.currentRoundIndex + 1} of {gameState.tracks.length}
            </p>
            <p className="text-gray-400">
              Current track: {gameState.tracks[gameState.currentRoundIndex]?.name}
            </p>
          </div>
        )}

        {gameState.phase === 'complete' && (
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <p className="text-white text-xl">Game Complete!</p>
            <button
              onClick={resetGame}
              className="mt-4 px-6 py-2 bg-green-500 text-white rounded-full font-semibold hover:bg-green-400"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
