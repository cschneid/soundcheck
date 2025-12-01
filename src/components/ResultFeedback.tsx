import type { RoundResult } from '../types/game'
import type { SpotifyTrack } from '../types/spotify'

interface Props {
  result: RoundResult
  track: SpotifyTrack
  onNext: () => void
  isLastRound: boolean
}

export function ResultFeedback({ result, track, onNext, isLastRound }: Props) {
  const bothCorrect = result.artistCorrect && result.titleCorrect
  const eitherCorrect = result.artistCorrect || result.titleCorrect
  const roundScore = (result.artistCorrect ? 1 : 0) + (result.titleCorrect ? 1 : 0)

  const albumImage = track.album.images[0]?.url
  const artistNames = track.artists.map(a => a.name).join(', ')

  return (
    <div
      className={`p-6 rounded-lg ${
        bothCorrect
          ? 'bg-green-900/30 animate-celebrate'
          : eitherCorrect
          ? 'bg-yellow-900/30'
          : 'bg-red-900/30 animate-whomp'
      }`}
    >
      <div className="flex gap-6">
        {albumImage && (
          <img
            src={albumImage}
            alt={`${track.album.name} album art`}
            className="w-32 h-32 rounded-lg shadow-lg"
          />
        )}

        <div className="flex-1">
          <h3 className="text-xl font-bold text-white">{track.name}</h3>
          <p className="text-gray-300">by {artistNames}</p>
          <p className="text-gray-500 text-sm mt-1">{track.album.name}</p>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-lg ${
                  result.titleCorrect ? 'text-[var(--success)]' : 'text-[var(--error)]'
                }`}
                aria-label={result.titleCorrect ? 'correct' : 'incorrect'}
              >
                {result.titleCorrect ? '✓' : '✗'}
              </span>
              <span className="text-gray-400">Title:</span>
              <span className="text-white">{result.titleAnswer || '(no guess)'}</span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-lg ${
                  result.artistCorrect ? 'text-[var(--success)]' : 'text-[var(--error)]'
                }`}
                aria-label={result.artistCorrect ? 'correct' : 'incorrect'}
              >
                {result.artistCorrect ? '✓' : '✗'}
              </span>
              <span className="text-gray-400">Artist:</span>
              <span className="text-white">{result.artistAnswer || '(no guess)'}</span>
            </div>
          </div>

          <p className="mt-4 text-gray-400">
            Score this round: <span className="text-white font-medium">{roundScore}/2</span>
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onNext}
          className="px-6 py-2 bg-[var(--accent)] text-black rounded-full font-semibold hover:bg-[var(--accent-hover)] active:scale-95 transition-default focus-ring"
        >
          {isLastRound ? 'See Results' : 'Next Song →'}
        </button>
      </div>
    </div>
  )
}
