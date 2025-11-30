import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GameRound } from '../GameRound'
import type { SpotifyTrack } from '../../types/spotify'

const createTrack = (): SpotifyTrack => ({
  id: '1',
  name: "Don't Stop Believin'",
  artists: [{ id: '1', name: 'Journey' }],
  album: {
    name: 'Escape',
    images: [{ url: 'https://example.com/album.jpg', height: 300, width: 300 }],
  },
  duration_ms: 250000,
  uri: 'spotify:track:1',
})

const createSnippetPlayer = (overrides = {}) => ({
  play: vi.fn().mockResolvedValue(undefined),
  replay: vi.fn().mockResolvedValue(undefined),
  stop: vi.fn(),
  isPlaying: false,
  progress: 50,
  error: null,
  ...overrides,
})

describe('GameRound', () => {
  it('displays round number and total', () => {
    render(
      <GameRound
        roundNumber={3}
        totalRounds={8}
        track={createTrack()}
        score={{ artist: 2, title: 2 }}
        snippetPlayer={createSnippetPlayer()}
        onSubmit={vi.fn()}
        onNext={vi.fn()}
        isLastRound={false}
      />
    )

    expect(screen.getByText('Round 3 of 8')).toBeInTheDocument()
  })

  it('displays current score', () => {
    render(
      <GameRound
        roundNumber={3}
        totalRounds={8}
        track={createTrack()}
        score={{ artist: 2, title: 2 }}
        snippetPlayer={createSnippetPlayer()}
        onSubmit={vi.fn()}
        onNext={vi.fn()}
        isLastRound={false}
      />
    )

    expect(screen.getByText('4/4')).toBeInTheDocument()
  })

  it('shows replay button', () => {
    render(
      <GameRound
        roundNumber={1}
        totalRounds={8}
        track={createTrack()}
        score={{ artist: 0, title: 0 }}
        snippetPlayer={createSnippetPlayer()}
        onSubmit={vi.fn()}
        onNext={vi.fn()}
        isLastRound={false}
      />
    )

    expect(screen.getByRole('button', { name: /replay/i })).toBeInTheDocument()
  })

  it('shows answer inputs', () => {
    render(
      <GameRound
        roundNumber={1}
        totalRounds={8}
        track={createTrack()}
        score={{ artist: 0, title: 0 }}
        snippetPlayer={createSnippetPlayer()}
        onSubmit={vi.fn()}
        onNext={vi.fn()}
        isLastRound={false}
      />
    )

    expect(screen.getByLabelText('Artist')).toBeInTheDocument()
    expect(screen.getByLabelText('Song Title')).toBeInTheDocument()
  })

  it('transitions to result on submit', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <GameRound
        roundNumber={1}
        totalRounds={8}
        track={createTrack()}
        score={{ artist: 0, title: 0 }}
        snippetPlayer={createSnippetPlayer()}
        onSubmit={onSubmit}
        onNext={vi.fn()}
        isLastRound={false}
      />
    )

    await user.type(screen.getByLabelText('Artist'), 'Journey')
    await user.type(screen.getByLabelText('Song Title'), "Don't Stop Believin'")
    await user.click(screen.getByRole('button', { name: /submit answer/i }))

    // Result feedback should now be visible
    expect(screen.getByText('by Journey')).toBeInTheDocument()
    expect(onSubmit).toHaveBeenCalled()
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        artistCorrect: true,
        titleCorrect: true,
      })
    )
  })

  it('calls onNext when next clicked', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()

    render(
      <GameRound
        roundNumber={1}
        totalRounds={8}
        track={createTrack()}
        score={{ artist: 0, title: 0 }}
        snippetPlayer={createSnippetPlayer()}
        onSubmit={vi.fn()}
        onNext={onNext}
        isLastRound={false}
      />
    )

    // Submit answer first
    await user.click(screen.getByRole('button', { name: /submit answer/i }))

    // Click next
    await user.click(screen.getByRole('button', { name: /next song/i }))

    expect(onNext).toHaveBeenCalled()
  })

  it('shows stop button when playing', () => {
    render(
      <GameRound
        roundNumber={1}
        totalRounds={8}
        track={createTrack()}
        score={{ artist: 0, title: 0 }}
        snippetPlayer={createSnippetPlayer({ isPlaying: true })}
        onSubmit={vi.fn()}
        onNext={vi.fn()}
        isLastRound={false}
      />
    )

    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
  })

  it('disables replay button when playing', () => {
    render(
      <GameRound
        roundNumber={1}
        totalRounds={8}
        track={createTrack()}
        score={{ artist: 0, title: 0 }}
        snippetPlayer={createSnippetPlayer({ isPlaying: true })}
        onSubmit={vi.fn()}
        onNext={vi.fn()}
        isLastRound={false}
      />
    )

    expect(screen.getByRole('button', { name: /replay/i })).toBeDisabled()
  })

  it('shows error message when snippetPlayer has error', () => {
    render(
      <GameRound
        roundNumber={1}
        totalRounds={8}
        track={createTrack()}
        score={{ artist: 0, title: 0 }}
        snippetPlayer={createSnippetPlayer({ error: 'Playback failed' })}
        onSubmit={vi.fn()}
        onNext={vi.fn()}
        isLastRound={false}
      />
    )

    expect(screen.getByText('Playback failed')).toBeInTheDocument()
  })

  it('shows "See Results" on last round', async () => {
    const user = userEvent.setup()

    render(
      <GameRound
        roundNumber={8}
        totalRounds={8}
        track={createTrack()}
        score={{ artist: 7, title: 7 }}
        snippetPlayer={createSnippetPlayer()}
        onSubmit={vi.fn()}
        onNext={vi.fn()}
        isLastRound={true}
      />
    )

    await user.click(screen.getByRole('button', { name: /submit answer/i }))

    expect(screen.getByRole('button', { name: /see results/i })).toBeInTheDocument()
  })

  it('stops playback on submit', async () => {
    const user = userEvent.setup()
    const snippetPlayer = createSnippetPlayer({ isPlaying: true })

    render(
      <GameRound
        roundNumber={1}
        totalRounds={8}
        track={createTrack()}
        score={{ artist: 0, title: 0 }}
        snippetPlayer={snippetPlayer}
        onSubmit={vi.fn()}
        onNext={vi.fn()}
        isLastRound={false}
      />
    )

    await user.click(screen.getByRole('button', { name: /submit answer/i }))

    expect(snippetPlayer.stop).toHaveBeenCalled()
  })
})
