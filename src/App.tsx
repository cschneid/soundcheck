import { useAuth } from './hooks/useAuth'
import { usePremiumCheck } from './hooks/usePremiumCheck'
import { LoginButton } from './components/LoginButton'
import { PremiumRequired } from './components/PremiumRequired'

function App() {
  const { isAuthenticated, accessToken, isLoading: authLoading, login, logout } = useAuth()
  const { isLoading: premiumLoading, isPremium, user } = usePremiumCheck(accessToken)

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
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-500 mb-4">
          Spotify Trainer
        </h1>
        <p className="text-gray-400 mb-4">
          Welcome{user?.display_name ? `, ${user.display_name}` : ''}!
        </p>
        <p className="text-gray-500 text-sm mb-8">Premium account verified</p>
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
