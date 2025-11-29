import { useState, useMemo } from 'react'
import type { SpotifyPlaylist } from '../types/spotify'
import type { GameSettings as GameSettingsType } from '../types/game'
import { DEFAULT_SETTINGS } from '../types/game'

interface Props {
  playlist: SpotifyPlaylist
  availableTrackCount: number
  onStart: (settings: GameSettingsType) => void
  onBack: () => void
}

const MIN_DURATION = 5
const MAX_DURATION = 30
const MAX_ROUNDS = 50

export function GameSettings({
  playlist,
  availableTrackCount,
  onStart,
  onBack,
}: Props) {
  const [roundCount, setRoundCount] = useState(
    Math.min(DEFAULT_SETTINGS.roundCount, availableTrackCount)
  )
  const [snippetDuration, setSnippetDuration] = useState(
    DEFAULT_SETTINGS.snippetDuration
  )

  const maxRounds = Math.min(availableTrackCount, MAX_ROUNDS)

  const errors = useMemo(() => {
    const errs: { rounds?: string; duration?: string } = {}

    if (roundCount < 1) {
      errs.rounds = 'Must be at least 1 round'
    } else if (roundCount > maxRounds) {
      errs.rounds = `Max ${maxRounds} rounds available`
    }

    if (snippetDuration < MIN_DURATION) {
      errs.duration = `Min ${MIN_DURATION} seconds`
    } else if (snippetDuration > MAX_DURATION) {
      errs.duration = `Max ${MAX_DURATION} seconds`
    }

    return errs
  }, [roundCount, snippetDuration, maxRounds])

  const isValid = Object.keys(errors).length === 0

  const handleStart = () => {
    if (isValid) {
      onStart({ roundCount, snippetDuration })
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 max-w-md">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">{playlist.name}</h2>
        <p className="text-gray-400 text-sm">
          {availableTrackCount} tracks available
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="roundCount"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Number of rounds
          </label>
          <input
            id="roundCount"
            type="number"
            min={1}
            max={maxRounds}
            value={roundCount}
            onChange={(e) => setRoundCount(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
          />
          {errors.rounds && (
            <p className="text-red-400 text-sm mt-1">{errors.rounds}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">1-{maxRounds}</p>
        </div>

        <div>
          <label
            htmlFor="snippetDuration"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Snippet duration (seconds)
          </label>
          <input
            id="snippetDuration"
            type="number"
            min={MIN_DURATION}
            max={MAX_DURATION}
            value={snippetDuration}
            onChange={(e) => setSnippetDuration(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
          />
          {errors.duration && (
            <p className="text-red-400 text-sm mt-1">{errors.duration}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            {MIN_DURATION}-{MAX_DURATION}
          </p>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-400 hover:text-white"
        >
          Back
        </button>
        <button
          onClick={handleStart}
          disabled={!isValid}
          className="px-6 py-2 bg-green-500 text-white rounded-full font-semibold hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Game
        </button>
      </div>
    </div>
  )
}
