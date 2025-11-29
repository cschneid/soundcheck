import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { usePremiumCheck } from './hooks/usePremiumCheck'
import { usePlaylists } from './hooks/usePlaylists'
import { LoginButton } from './components/LoginButton'
import { PremiumRequired } from './components/PremiumRequired'
import { PlaylistPicker } from './components/PlaylistPicker'
import type { SpotifyPlaylist } from './types/spotify'

function App() {
  const { isAuthenticated, accessToken, isLoading: authLoading, login, logout } = useAuth()
  const { isLoading: premiumLoading, isPremium, user } = usePremiumCheck(accessToken)
  const { playlists, isLoading: playlistsLoading, error: playlistsError } = usePlaylists(accessToken)
  const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyPlaylist | null>(null)

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
            onSelect={setSelectedPlaylist}
            selectedId={selectedPlaylist?.id}
          />
        </section>

        {selectedPlaylist && (
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <p className="text-white">
              Selected: <strong>{selectedPlaylist.name}</strong> ({selectedPlaylist.tracks.total} tracks)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
