import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResultFeedback } from '../ResultFeedback'
import type { RoundResult } from '../../types/game'
import type { SpotifyTrack } from '../../types/spotify'

const createTrack = (overrides: Partial<SpotifyTrack> = {}): SpotifyTrack => ({
  id: '1',
  name: "Don't Stop Believin'",
  artists: [{ id: '1', name: 'Journey' }],
  album: {
    name: 'Escape',
    images: [{ url: 'https://example.com/album.jpg', height: 300, width: 300 }],
  },
  duration_ms: 250000,
  uri: 'spotify:track:1',
  ...overrides,
})

const createResult = (overrides: Partial<RoundResult> = {}): RoundResult => ({
  track: createTrack(),
  artistAnswer: 'journey',
  titleAnswer: "dont stop believin",
  artistCorrect: true,
  titleCorrect: true,
  ...overrides,
})

describe('ResultFeedback', () => {
  it('displays track title', () => {
    render(
      <ResultFeedback
        result={createResult()}
        track={createTrack()}
        onNext={vi.fn()}
        isLastRound={false}
      />
    )

    expect(screen.getByText("Don't Stop Believin'")).toBeInTheDocument()
  })

  it('displays artist name', () => {
    render(
      <ResultFeedback
        result={createResult()}
        track={createTrack()}
        onNext={vi.fn()}
        isLastRound={false}
      />
    )

    expect(screen.getByText('by Journey')).toBeInTheDocument()
  })

  it('displays album artwork', () => {
    render(
      <ResultFeedback
        result={createResult()}
        track={createTrack()}
        onNext={vi.fn()}
        isLastRound={false}
      />
    )

    const img = screen.getByRole('img', { name: /escape album art/i })
    expect(img).toHaveAttribute('src', 'https://example.com/album.jpg')
  })

  it('shows checkmark for correct artist', () => {
    render(
      <ResultFeedback
        result={createResult({ artistCorrect: true })}
        track={createTrack()}
        onNext={vi.fn()}
        isLastRound={false}
      />
    )

    const checkmarks = screen.getAllByText('✓')
    expect(checkmarks.length).toBeGreaterThanOrEqual(1)
  })

  it('shows X for incorrect artist', () => {
    render(
      <ResultFeedback
        result={createResult({ artistCorrect: false })}
        track={createTrack()}
        onNext={vi.fn()}
        isLastRound={false}
      />
    )

    expect(screen.getByText('✗')).toBeInTheDocument()
  })

  it('shows checkmark for correct title', () => {
    render(
      <ResultFeedback
        result={createResult({ titleCorrect: true })}
        track={createTrack()}
        onNext={vi.fn()}
        isLastRound={false}
      />
    )

    const checkmarks = screen.getAllByText('✓')
    expect(checkmarks.length).toBeGreaterThanOrEqual(1)
  })

  it('shows X for incorrect title', () => {
    render(
      <ResultFeedback
        result={createResult({ titleCorrect: false })}
        track={createTrack()}
        onNext={vi.fn()}
        isLastRound={false}
      />
    )

    expect(screen.getByText('✗')).toBeInTheDocument()
  })

  it('shows "Next Song" button when not last round', () => {
    render(
      <ResultFeedback
        result={createResult()}
        track={createTrack()}
        onNext={vi.fn()}
        isLastRound={false}
      />
    )

    expect(screen.getByRole('button', { name: /next song/i })).toBeInTheDocument()
  })

  it('shows "See Results" on last round', () => {
    render(
      <ResultFeedback
        result={createResult()}
        track={createTrack()}
        onNext={vi.fn()}
        isLastRound={true}
      />
    )

    expect(screen.getByRole('button', { name: /see results/i })).toBeInTheDocument()
  })

  it('calls onNext when button clicked', async () => {
    const onNext = vi.fn()
    const user = userEvent.setup()

    render(
      <ResultFeedback
        result={createResult()}
        track={createTrack()}
        onNext={onNext}
        isLastRound={false}
      />
    )

    await user.click(screen.getByRole('button', { name: /next song/i }))
    expect(onNext).toHaveBeenCalled()
  })

  it('displays user guesses', () => {
    render(
      <ResultFeedback
        result={createResult({
          artistAnswer: 'journey',
          titleAnswer: 'dont stop believin',
        })}
        track={createTrack()}
        onNext={vi.fn()}
        isLastRound={false}
      />
    )

    expect(screen.getByText('journey')).toBeInTheDocument()
    expect(screen.getByText('dont stop believin')).toBeInTheDocument()
  })

  it('shows (no guess) for empty answers', () => {
    render(
      <ResultFeedback
        result={createResult({ artistAnswer: '', titleAnswer: '' })}
        track={createTrack()}
        onNext={vi.fn()}
        isLastRound={false}
      />
    )

    expect(screen.getAllByText('(no guess)')).toHaveLength(2)
  })

  it('displays round score', () => {
    render(
      <ResultFeedback
        result={createResult({ artistCorrect: true, titleCorrect: false })}
        track={createTrack()}
        onNext={vi.fn()}
        isLastRound={false}
      />
    )

    expect(screen.getByText('1/2')).toBeInTheDocument()
  })

  it('handles multiple artists', () => {
    const track = createTrack({
      artists: [
        { id: '1', name: 'Queen' },
        { id: '2', name: 'David Bowie' },
      ],
    })

    render(
      <ResultFeedback
        result={createResult({ track })}
        track={track}
        onNext={vi.fn()}
        isLastRound={false}
      />
    )

    expect(screen.getByText('by Queen, David Bowie')).toBeInTheDocument()
  })

  it('applies celebrate animation for both correct', () => {
    const { container } = render(
      <ResultFeedback
        result={createResult({ artistCorrect: true, titleCorrect: true })}
        track={createTrack()}
        onNext={vi.fn()}
        isLastRound={false}
      />
    )

    expect(container.firstChild).toHaveClass('animate-celebrate')
  })

  it('applies whomp animation when both wrong', () => {
    const { container } = render(
      <ResultFeedback
        result={createResult({ artistCorrect: false, titleCorrect: false })}
        track={createTrack()}
        onNext={vi.fn()}
        isLastRound={false}
      />
    )

    expect(container.firstChild).toHaveClass('animate-whomp')
  })
})
