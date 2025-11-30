import { useState, useRef, useEffect } from 'react'
import { AnswerInput } from './AnswerInput'
import { ResultFeedback } from './ResultFeedback'
import { scoreAnswer } from '../utils/scoring'
import type { AnswerInputHandle } from './AnswerInput'
import type { SpotifyTrack } from '../types/spotify'
import type { RoundResult } from '../types/game'

interface SnippetPlayer {
  play: (track: SpotifyTrack) => Promise<void>
  replay: () => Promise<void>
  stop: () => void
  isPlaying: boolean
  progress: number
  error: string | null
}

interface Props {
  roundNumber: number
  totalRounds: number
  track: SpotifyTrack
  score: { artist: number; title: number }
  snippetPlayer: SnippetPlayer
  onSubmit: (result: RoundResult) => void
  onNext: () => void
  isLastRound: boolean
}

export function GameRound({
  roundNumber,
  totalRounds,
  track,
  score,
  snippetPlayer,
  onSubmit,
  onNext,
  isLastRound,
}: Props) {
  const answerInputRef = useRef<AnswerInputHandle>(null)
  const [answerSubmitted, setAnswerSubmitted] = useState(false)
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null)

  // Reset state when track changes (new round)
  useEffect(() => {
    setAnswerSubmitted(false)
    setRoundResult(null)
    answerInputRef.current?.clear()
    answerInputRef.current?.focus()
  }, [track])

  const handleAnswerSubmit = (artistGuess: string, titleGuess: string) => {
    setAnswerSubmitted(true)
    snippetPlayer.stop()
    const result = scoreAnswer(artistGuess, titleGuess, track)
    const roundResult: RoundResult = {
      track,
      artistAnswer: artistGuess,
      titleAnswer: titleGuess,
      artistCorrect: result.artistCorrect,
      titleCorrect: result.titleCorrect,
    }
    setRoundResult(roundResult)
    onSubmit(roundResult)
  }

  const totalScore = score.artist + score.title
  const maxScore = (roundNumber - 1) * 2

  return (
    <div className="mt-8 p-4 bg-[var(--bg-secondary)] rounded-lg">
      {/* Header with round info and score */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-white font-medium">
          Round {roundNumber} of {totalRounds}
        </p>
        <p className="text-gray-400">
          Score: <span className="text-white font-medium">{totalScore}/{maxScore}</span>
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-[var(--bg-elevated)] rounded-full h-2 overflow-hidden">
        <div
          className="bg-[var(--accent)] h-full transition-all duration-100"
          style={{ width: `${snippetPlayer.progress}%` }}
        />
      </div>

      {/* Playback controls */}
      <div className="mt-4 flex gap-4">
        <button
          onClick={() => snippetPlayer.replay()}
          disabled={snippetPlayer.isPlaying}
          className="px-4 py-2 bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-elevated)]/80 disabled:opacity-50 transition-default focus-ring"
        >
          Replay
        </button>
        {snippetPlayer.isPlaying && (
          <button
            onClick={() => snippetPlayer.stop()}
            className="px-4 py-2 bg-[var(--error)] text-[var(--text-primary)] rounded-lg hover:opacity-90 transition-default focus-ring"
          >
            Stop
          </button>
        )}
      </div>

      {snippetPlayer.error && (
        <div className="mt-4 bg-[var(--error)]/10 border border-[var(--error)]/30 rounded-lg p-3">
          <p className="text-[var(--error)] text-sm">{snippetPlayer.error}</p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => snippetPlayer.replay()}
              className="px-3 py-1 text-sm bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded hover:opacity-80 transition-default"
            >
              Retry
            </button>
            <button
              onClick={() => {
                // Submit empty answers and skip to next
                handleAnswerSubmit('', '')
              }}
              className="px-3 py-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-default"
            >
              Skip Track
            </button>
          </div>
        </div>
      )}

      {/* Answer input */}
      <div className="mt-6">
        <AnswerInput
          ref={answerInputRef}
          onSubmit={handleAnswerSubmit}
          disabled={answerSubmitted}
        />
      </div>

      {/* Result feedback */}
      {answerSubmitted && roundResult && (
        <div className="mt-6">
          <ResultFeedback
            result={roundResult}
            track={track}
            onNext={onNext}
            isLastRound={isLastRound}
          />
        </div>
      )}
    </div>
  )
}
