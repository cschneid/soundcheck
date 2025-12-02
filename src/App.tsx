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
import { Footer } from './components/Footer'
import type { SpotifyPlaylist } from './types/spotify'
import type { GameSettings as GameSettingsType, RoundResult } from './types/game'

function App() {
  const { isAuthenticated, accessToken, isLoading: authLoading, login, logout } = useAuth()
  const { isLoading: premiumLoading, isPremium, user } = usePremiumCheck(accessToken)
  const { playlists, isLoading: playlistsLoading, error: playlistsError } = usePlaylists(accessToken)
  const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyPlaylist | null>(null)
  const { tracks, isLoading: tracksLoading, error: tracksError } = usePlaylistTracks(
    selectedPlaylist?.id ?? null,
    accessToken
  )
  const { state: gameState, startGame, resetGame, submitAnswer, nextRound, currentTrack, score, isLastRound } = useGameState()
  const { player, deviceId, isReady: playerReady, error: playerError } = useSpotifyPlayer(accessToken)
  const snippetPlayer = useSnippetPlayer(
    accessToken,
    deviceId,
    gameState.settings.snippetDuration,
    player
  )

  const handlePlaylistSelect = (playlist: SpotifyPlaylist) => {
    setSelectedPlaylist(playlist)
  }

  const handleStartGame = (settings: GameSettingsType) => {
    startGame(tracks, settings)
  }

  const handleRoundSubmit = (result: RoundResult) => {
    submitAnswer(result.artistAnswer, result.titleAnswer, result.artistCorrect, result.titleCorrect)
  }

  const handlePlayAgain = () => {
    resetGame()
  }

  const handleNewPlaylist = () => {
    resetGame()
    setSelectedPlaylist(null)
  }

  // Auto-play snippet when game starts or round changes
  useEffect(() => {
    if (gameState.phase === 'playing' && currentTrack && playerReady) {
      snippetPlayer.play(currentTrack)
    }
  }, [gameState.phase, currentTrack, playerReady])

  const isLoading = authLoading || (isAuthenticated && premiumLoading)

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <LoadingSpinner message="Loading your profile..." />
        <Footer />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[var(--accent)] mb-4">
              SoundCheck
            </h1>
            <p className="text-gray-400 mb-8">
              Train for bar trivia with your Spotify playlists
            </p>
            <LoginButton onClick={login} />
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!isPremium) {
    return (
      <div className="min-h-screen flex flex-col">
        <PremiumRequired onLogout={logout} />
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col p-8">
      <div className="w-full max-w-4xl mx-auto flex-1">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--accent)]">SoundCheck</h1>
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

        {/* Phase 1: Playlist Selection (only shown when no playlist selected) */}
        {gameState.phase === 'setup' && !selectedPlaylist && (
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
              selectedId={undefined}
            />
          </section>
        )}

        {/* Playing indicator (during game) */}
        {gameState.phase !== 'setup' && selectedPlaylist && (
          <div className="mb-4 text-gray-400">
            Playing: <span className="text-white font-medium">{selectedPlaylist.name}</span>
          </div>
        )}

        {/* Phase 2: Game Configuration (shown after playlist selected) */}
        {selectedPlaylist && gameState.phase === 'setup' && (
          <section>
            {/* Selected playlist summary */}
            <div className="mb-6 p-4 bg-[var(--bg-secondary)] rounded-lg flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Selected playlist</p>
                <p className="text-white font-semibold">{selectedPlaylist.name}</p>
                {tracksLoading && (
                  <p className="text-gray-400 text-sm mt-1">Loading tracks...</p>
                )}
                {!tracksLoading && !tracksError && tracks.length > 0 && (
                  <p className="text-gray-400 text-sm mt-1">{tracks.length} playable tracks</p>
                )}
              </div>
              <button
                onClick={() => setSelectedPlaylist(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm underline transition-default"
              >
                Change
              </button>
            </div>

            {/* Error states */}
            {tracksError && (
              <div className="mb-6 p-4 bg-[var(--error)]/10 border border-[var(--error)]/30 rounded-lg">
                <p className="text-[var(--error)]">{tracksError}</p>
              </div>
            )}

            {!tracksLoading && !tracksError && tracks.length === 0 && (
              <div className="mb-6 p-4 bg-[var(--error)]/10 border border-[var(--error)]/30 rounded-lg">
                <p className="text-[var(--error)] font-medium">No playable tracks</p>
                <p className="text-[var(--text-secondary)] text-sm mt-1">
                  This playlist may only contain local files or unavailable tracks.
                </p>
              </div>
            )}

            {/* Game settings (show when tracks loaded successfully) */}
            {!tracksLoading && !tracksError && tracks.length > 0 && (
              <GameSettings
                playlist={selectedPlaylist}
                availableTrackCount={tracks.length}
                onStart={handleStartGame}
                onBack={() => setSelectedPlaylist(null)}
              />
            )}
          </section>
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
            onPlayAgain={handlePlayAgain}
            onNewPlaylist={handleNewPlaylist}
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
      <Footer />
    </div>
  )
}

export default App
