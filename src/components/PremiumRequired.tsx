interface PremiumRequiredProps {
  onLogout: () => void
}

export function PremiumRequired({ onLogout }: PremiumRequiredProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md text-center px-4">
        <div className="text-6xl mb-6">🎵</div>
        <h1 className="text-2xl font-bold text-white mb-4">
          Spotify Premium Required
        </h1>
        <p className="text-gray-400 mb-6">
          This app uses Spotify's Web Playback SDK to play music directly in
          your browser, which requires a Premium subscription.
        </p>
        <p className="text-gray-400 mb-8">
          If you have Premium on a different account, you can:
        </p>
        <button
          onClick={onLogout}
          className="bg-green-500 hover:bg-green-600 text-black font-semibold py-3 px-6 rounded-full transition-colors"
        >
          Log out and try another account
        </button>
        <div className="mt-8 pt-6 border-t border-gray-700">
          <p className="text-sm text-gray-500">
            <strong>Why is this required?</strong>
            <br />
            Spotify only allows third-party apps to control playback for Premium
            subscribers.
          </p>
        </div>
      </div>
    </div>
  )
}
