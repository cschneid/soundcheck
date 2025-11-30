import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { usePremiumCheck } from './hooks/usePremiumCheck'
import { usePlaylists } from './hooks/usePlaylists'
import { usePlaylistTracks } from './hooks/usePlaylistTracks'
import { useGameState } from './hooks/useGameState'
import { useSpotifyPlayer } from './hooks/useSpotifyPlayer'
import { useSnippetPlayer } from './hooks/useSnippetPlayer'
import { LoginButton } from './components/LoginButton'
import { PremiumRequired } from './components/PremiumRequired'
import { PlaylistPicker } from './components/PlaylistPicker'
import { GameSettings } from './components/GameSettings'
import { GameRound } from './components/GameRound'
import { EndScreen } from './components/EndScreen'
import { LoadingSpinner } from './components/LoadingSpinner'
import type { SpotifyPlaylist } from './types/spotify'
import type { GameSettings as GameSettingsType, RoundResult } from './types/game'

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
  const { state: gameState, startGame, resetGame, submitAnswer, nextRound, currentTrack, score, isLastRound } = useGameState()
  const { deviceId, isReady: playerReady, error: playerError } = useSpotifyPlayer(accessToken)
  const snippetPlayer = useSnippetPlayer(
    accessToken,
    deviceId,
    gameState.settings.snippetDuration
  )

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

  const handleRoundSubmit = (result: RoundResult) => {
    submitAnswer(result.artistAnswer, result.titleAnswer, result.artistCorrect, result.titleCorrect)
  }

  const handlePlayAgain = () => {
    // Reset game but keep same playlist - will restart with same tracks
    resetGame()
    setShowSettings(true)
  }

  const handleNewPlaylist = () => {
    resetGame()
    setSelectedPlaylist(null)
    setShowSettings(false)
  }

  // Auto-play snippet when game starts or round changes
  useEffect(() => {
    if (gameState.phase === 'playing' && currentTrack && playerReady) {
      snippetPlayer.play(currentTrack)
    }
  }, [gameState.phase, currentTrack, playerReady])

  const isLoading = authLoading || (isAuthenticated && premiumLoading)

  if (isLoading) {
    return <LoadingSpinner message="Loading your profile..." />
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[var(--accent)] mb-4">
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
            <h1 className="text-2xl font-bold text-[var(--accent)]">Spotify Trainer</h1>
            <p className="text-gray-400 text-sm">
              Welcome{user?.display_name ? `, ${user.display_name}` : ''}
              {playerReady && (
                <span className="ml-2 text-[var(--success)]">• Player ready</span>
              )}
              {playerError && (
                <span className="ml-2 text-[var(--error)]">• {playerError}</span>
              )}
            </p>
          </div>
          <button
            onClick={logout}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm underline transition-default focus-ring rounded"
          >
            Logout
          </button>
        </header>

        {gameState.phase === 'setup' && (
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
        )}

        {gameState.phase !== 'setup' && selectedPlaylist && (
          <div className="mb-4 text-gray-400">
            Playing: <span className="text-white font-medium">{selectedPlaylist.name}</span>
          </div>
        )}

        {selectedPlaylist && !showSettings && gameState.phase === 'setup' && (
          <div className="mt-8 p-4 bg-[var(--bg-secondary)] rounded-lg">
            <p className="text-white">
              Selected: <strong>{selectedPlaylist.name}</strong>
            </p>
            {tracksLoading && (
              <p className="text-gray-400 mt-2">Loading tracks...</p>
            )}
            {tracksError && (
              <p className="text-[var(--error)] mt-2">{tracksError}</p>
            )}
            {!tracksLoading && !tracksError && (
              <>
                <p className="text-gray-400 mt-2">
                  {tracks.length} playable tracks
                </p>
                <button
                  onClick={handleConfigureGame}
                  disabled={tracks.length === 0}
                  className="mt-4 px-6 py-2 bg-[var(--accent)] text-black rounded-full font-semibold hover:bg-[var(--accent-hover)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-default focus-ring"
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

        {gameState.phase === 'playing' && currentTrack && (
          <GameRound
            roundNumber={gameState.currentRoundIndex + 1}
            totalRounds={gameState.tracks.length}
            track={currentTrack}
            score={score}
            snippetPlayer={snippetPlayer}
            onSubmit={handleRoundSubmit}
            onNext={nextRound}
            isLastRound={isLastRound}
          />
        )}

        {gameState.phase === 'complete' && selectedPlaylist && (
          <EndScreen
            results={gameState.results}
            playlist={selectedPlaylist}
            onPlayAgain={handlePlayAgain}
            onNewPlaylist={handleNewPlaylist}
          />
        )}
      </div>
    </div>
  )
}

export default App
