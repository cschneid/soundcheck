import type { RoundResult } from '../types/game'
import type { SpotifyPlaylist } from '../types/spotify'

interface Props {
  results: RoundResult[]
  playlist: SpotifyPlaylist
  onPlayAgain: () => void
  onNewPlaylist: () => void
}

function getScoreTier(percentage: number): {
  label: string
  className: string
} {
  if (percentage >= 90) {
    return { label: 'Amazing!', className: 'text-yellow-400' }
  }
  if (percentage >= 70) {
    return { label: 'Great!', className: 'text-green-400' }
  }
  if (percentage >= 50) {
    return { label: 'Good effort', className: 'text-blue-400' }
  }
  return { label: 'Keep practicing', className: 'text-gray-400' }
}

export function EndScreen({
  results,
  playlist,
  onPlayAgain,
  onNewPlaylist,
}: Props) {
  const artistCorrect = results.filter((r) => r.artistCorrect).length
  const titleCorrect = results.filter((r) => r.titleCorrect).length
  const totalCorrect = artistCorrect + titleCorrect
  const maxScore = results.length * 2
  const percentage = maxScore > 0 ? Math.round((totalCorrect / maxScore) * 100) : 0
  const tier = getScoreTier(percentage)

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Game Complete!</h2>
        <p className="text-gray-400">Playlist: {playlist.name}</p>
      </div>

      {/* Score summary */}
      <div className="bg-gray-800 rounded-lg p-6 text-center mb-6">
        <p className="text-5xl font-bold text-white mb-2">
          {totalCorrect}/{maxScore}
        </p>
        <p className="text-2xl text-gray-300 mb-4">{percentage}%</p>
        <p className={`text-xl font-medium ${tier.className}`}>{tier.label}</p>

        <div className="mt-6 flex justify-center gap-8 text-sm">
          <div>
            <p className="text-gray-400">Artists</p>
            <p className="text-white font-medium text-lg">
              {artistCorrect}/{results.length}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Titles</p>
            <p className="text-white font-medium text-lg">
              {titleCorrect}/{results.length}
            </p>
          </div>
        </div>
      </div>

      {/* Round results */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Round Results</h3>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {results.map((result, index) => (
            <div
              key={result.track.id}
              className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white truncate">
                  <span className="text-gray-500 mr-2">{index + 1}.</span>
                  "{result.track.name}"
                </p>
                <p className="text-gray-400 text-sm truncate">
                  {result.track.artists.map((a) => a.name).join(', ')}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <span
                  className={result.artistCorrect ? 'text-green-400' : 'text-red-400'}
                  title={result.artistCorrect ? 'Artist correct' : 'Artist incorrect'}
                >
                  {result.artistCorrect ? '✓' : '✗'}
                </span>
                <span
                  className={result.titleCorrect ? 'text-green-400' : 'text-red-400'}
                  title={result.titleCorrect ? 'Title correct' : 'Title incorrect'}
                >
                  {result.titleCorrect ? '✓' : '✗'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={onPlayAgain}
          className="px-6 py-2 bg-green-500 text-white rounded-full font-semibold hover:bg-green-400"
        >
          Play Again
        </button>
        <button
          onClick={onNewPlaylist}
          className="px-6 py-2 bg-gray-700 text-white rounded-full font-semibold hover:bg-gray-600"
        >
          Choose New Playlist
        </button>
      </div>
    </div>
  )
}
