import { useState, useRef, useImperativeHandle, forwardRef } from 'react'

interface Props {
  onSubmit: (artistGuess: string, titleGuess: string) => void
  disabled?: boolean
}

export interface AnswerInputHandle {
  focus: () => void
  clear: () => void
}

export const AnswerInput = forwardRef<AnswerInputHandle, Props>(
  ({ onSubmit, disabled = false }, ref) => {
    const [artist, setArtist] = useState('')
    const [title, setTitle] = useState('')
    const artistInputRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => ({
      focus: () => {
        artistInputRef.current?.focus()
      },
      clear: () => {
        setArtist('')
        setTitle('')
      },
    }))

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSubmit(artist, title)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        onSubmit(artist, title)
      }
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="artist-input"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Artist
          </label>
          <input
            ref={artistInputRef}
            id="artist-input"
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            disabled={disabled}
            placeholder="Enter artist name"
            className="w-full px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--bg-elevated)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)] transition-default focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label
            htmlFor="title-input"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Song Title
          </label>
          <input
            id="title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Enter song title"
            className="w-full px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--bg-elevated)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)] transition-default focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="w-full px-6 py-2 bg-[var(--accent)] text-black rounded-full font-semibold hover:bg-[var(--accent-hover)] active:scale-[0.98] transition-default focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Answer
        </button>
      </form>
    )
  }
)

AnswerInput.displayName = 'AnswerInput'
