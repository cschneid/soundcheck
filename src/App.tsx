import { useAuth } from './hooks/useAuth'
import { LoginButton } from './components/LoginButton'

function App() {
  const { isAuthenticated, isLoading, login, logout } = useAuth()

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

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-500 mb-4">
          Spotify Trainer
        </h1>
        <p className="text-gray-400 mb-8">You're logged in!</p>
        <button
          onClick={logout}
          className="text-gray-400 hover:text-white underline"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default App
