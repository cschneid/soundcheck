import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EndScreen } from '../EndScreen'
import type { RoundResult } from '../../types/game'
import type { SpotifyPlaylist, SpotifyTrack } from '../../types/spotify'

const createTrack = (name: string, artist: string): SpotifyTrack => ({
  id: Math.random().toString(),
  name,
  artists: [{ id: '1', name: artist }],
  album: { name: 'Test Album', images: [] },
  duration_ms: 180000,
  uri: 'spotify:track:1',
})

const createPlaylist = (): SpotifyPlaylist => ({
  id: 'playlist1',
  name: 'Test Playlist',
  images: [],
  tracks: { total: 10, href: '' },
  owner: { display_name: 'Test User' },
})

const createResults = (scores: { artist: boolean; title: boolean }[]): RoundResult[] =>
  scores.map((s, i) => ({
    track: createTrack(`Song ${i + 1}`, `Artist ${i + 1}`),
    artistAnswer: 'guess',
    titleAnswer: 'guess',
    artistCorrect: s.artist,
    titleCorrect: s.title,
  }))

describe('EndScreen', () => {
  it('displays total score', () => {
    const results = createResults([
      { artist: true, title: true },
      { artist: true, title: false },
      { artist: false, title: true },
      { artist: false, title: false },
    ])

    render(
      <EndScreen
        results={results}
        playlist={createPlaylist()}
        onPlayAgain={vi.fn()}
        onNewPlaylist={vi.fn()}
      />
    )

    expect(screen.getByText('4/8')).toBeInTheDocument()
  })

  it('displays percentage', () => {
    const results = createResults([
      { artist: true, title: true },
      { artist: true, title: true },
    ])

    render(
      <EndScreen
        results={results}
        playlist={createPlaylist()}
        onPlayAgain={vi.fn()}
        onNewPlaylist={vi.fn()}
      />
    )

    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('displays artist score', () => {
    const results = createResults([
      { artist: true, title: false },
      { artist: true, title: false },
      { artist: false, title: true },
    ])

    render(
      <EndScreen
        results={results}
        playlist={createPlaylist()}
        onPlayAgain={vi.fn()}
        onNewPlaylist={vi.fn()}
      />
    )

    expect(screen.getByText('2/3')).toBeInTheDocument()
  })

  it('displays title score', () => {
    const results = createResults([
      { artist: false, title: true },
      { artist: false, title: true },
      { artist: true, title: false },
    ])

    render(
      <EndScreen
        results={results}
        playlist={createPlaylist()}
        onPlayAgain={vi.fn()}
        onNewPlaylist={vi.fn()}
      />
    )

    expect(screen.getByText('2/3')).toBeInTheDocument()
  })

  it('lists all round results', () => {
    const results = [
      {
        track: createTrack('Bohemian Rhapsody', 'Queen'),
        artistAnswer: 'Queen',
        titleAnswer: 'Bohemian Rhapsody',
        artistCorrect: true,
        titleCorrect: true,
      },
      {
        track: createTrack('Thriller', 'Michael Jackson'),
        artistAnswer: 'MJ',
        titleAnswer: 'Thriller',
        artistCorrect: false,
        titleCorrect: true,
      },
    ]

    render(
      <EndScreen
        results={results}
        playlist={createPlaylist()}
        onPlayAgain={vi.fn()}
        onNewPlaylist={vi.fn()}
      />
    )

    expect(screen.getByText('"Bohemian Rhapsody"')).toBeInTheDocument()
    expect(screen.getByText('Queen')).toBeInTheDocument()
    expect(screen.getByText('"Thriller"')).toBeInTheDocument()
    expect(screen.getByText('Michael Jackson')).toBeInTheDocument()
  })

  it('shows correct indicators', () => {
    const results = createResults([{ artist: true, title: true }])

    render(
      <EndScreen
        results={results}
        playlist={createPlaylist()}
        onPlayAgain={vi.fn()}
        onNewPlaylist={vi.fn()}
      />
    )

    const checkmarks = screen.getAllByText('✓')
    expect(checkmarks).toHaveLength(2)
  })

  it('shows incorrect indicators', () => {
    const results = createResults([{ artist: false, title: false }])

    render(
      <EndScreen
        results={results}
        playlist={createPlaylist()}
        onPlayAgain={vi.fn()}
        onNewPlaylist={vi.fn()}
      />
    )

    const xMarks = screen.getAllByText('✗')
    expect(xMarks).toHaveLength(2)
  })

  it('calls onPlayAgain when clicked', async () => {
    const onPlayAgain = vi.fn()
    const user = userEvent.setup()

    render(
      <EndScreen
        results={createResults([{ artist: true, title: true }])}
        playlist={createPlaylist()}
        onPlayAgain={onPlayAgain}
        onNewPlaylist={vi.fn()}
      />
    )

    await user.click(screen.getByRole('button', { name: /play again/i }))

    expect(onPlayAgain).toHaveBeenCalled()
  })

  it('calls onNewPlaylist when clicked', async () => {
    const onNewPlaylist = vi.fn()
    const user = userEvent.setup()

    render(
      <EndScreen
        results={createResults([{ artist: true, title: true }])}
        playlist={createPlaylist()}
        onPlayAgain={vi.fn()}
        onNewPlaylist={onNewPlaylist}
      />
    )

    await user.click(screen.getByRole('button', { name: /choose new playlist/i }))

    expect(onNewPlaylist).toHaveBeenCalled()
  })

  it('shows "Amazing!" for 100% score', () => {
    const results = createResults([
      { artist: true, title: true },
      { artist: true, title: true },
    ])

    render(
      <EndScreen
        results={results}
        playlist={createPlaylist()}
        onPlayAgain={vi.fn()}
        onNewPlaylist={vi.fn()}
      />
    )

    expect(screen.getByText('Amazing!')).toBeInTheDocument()
  })

  it('shows "Great!" for 75% score', () => {
    const results = createResults([
      { artist: true, title: true },
      { artist: true, title: false },
      { artist: false, title: true },
      { artist: false, title: false },
    ])

    render(
      <EndScreen
        results={results}
        playlist={createPlaylist()}
        onPlayAgain={vi.fn()}
        onNewPlaylist={vi.fn()}
      />
    )

    expect(screen.getByText('Good effort')).toBeInTheDocument()
  })

  it('shows "Keep practicing" for low scores', () => {
    const results = createResults([
      { artist: false, title: false },
      { artist: false, title: false },
      { artist: true, title: false },
    ])

    render(
      <EndScreen
        results={results}
        playlist={createPlaylist()}
        onPlayAgain={vi.fn()}
        onNewPlaylist={vi.fn()}
      />
    )

    expect(screen.getByText('Keep practicing')).toBeInTheDocument()
  })

  it('displays playlist name', () => {
    const playlist = createPlaylist()
    playlist.name = 'My Awesome Playlist'

    render(
      <EndScreen
        results={createResults([{ artist: true, title: true }])}
        playlist={playlist}
        onPlayAgain={vi.fn()}
        onNewPlaylist={vi.fn()}
      />
    )

    expect(screen.getByText(/my awesome playlist/i)).toBeInTheDocument()
  })
})
