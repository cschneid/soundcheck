import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../test/utils'
import { GameSettings } from '../GameSettings'
import type { SpotifyPlaylist } from '../../types/spotify'

const mockPlaylist: SpotifyPlaylist = {
  id: 'playlist1',
  name: 'Test Playlist',
  images: [],
  tracks: { total: 50, href: '' },
  owner: { display_name: 'Test User' },
}

describe('GameSettings', () => {
  it('renders playlist info', () => {
    render(
      <GameSettings
        playlist={mockPlaylist}
        availableTrackCount={50}
        onStart={() => {}}
        onBack={() => {}}
      />
    )

    expect(screen.getByText('Test Playlist')).toBeInTheDocument()
    expect(screen.getByText('50 tracks available')).toBeInTheDocument()
  })

  it('shows default values', () => {
    render(
      <GameSettings
        playlist={mockPlaylist}
        availableTrackCount={50}
        onStart={() => {}}
        onBack={() => {}}
      />
    )

    expect(screen.getByLabelText('Number of rounds')).toHaveValue(8)
    expect(screen.getByLabelText('Snippet duration (seconds)')).toHaveValue(10)
  })

  it('limits rounds to available tracks', () => {
    render(
      <GameSettings
        playlist={mockPlaylist}
        availableTrackCount={5}
        onStart={() => {}}
        onBack={() => {}}
      />
    )

    expect(screen.getByLabelText('Number of rounds')).toHaveValue(5)
    expect(screen.getByText('1-5')).toBeInTheDocument()
  })

  it('shows error for invalid round count', () => {
    render(
      <GameSettings
        playlist={mockPlaylist}
        availableTrackCount={10}
        onStart={() => {}}
        onBack={() => {}}
      />
    )

    const input = screen.getByLabelText('Number of rounds')
    fireEvent.change(input, { target: { value: '20' } })

    expect(screen.getByText('Max 10 rounds available')).toBeInTheDocument()
  })

  it('shows error for invalid duration', () => {
    render(
      <GameSettings
        playlist={mockPlaylist}
        availableTrackCount={50}
        onStart={() => {}}
        onBack={() => {}}
      />
    )

    const input = screen.getByLabelText('Snippet duration (seconds)')
    fireEvent.change(input, { target: { value: '3' } })

    expect(screen.getByText('Min 5 seconds')).toBeInTheDocument()
  })

  it('calls onStart with settings', () => {
    const onStart = vi.fn()

    render(
      <GameSettings
        playlist={mockPlaylist}
        availableTrackCount={50}
        onStart={onStart}
        onBack={() => {}}
      />
    )

    fireEvent.change(screen.getByLabelText('Number of rounds'), {
      target: { value: '10' },
    })
    fireEvent.change(screen.getByLabelText('Snippet duration (seconds)'), {
      target: { value: '15' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Start Game' }))

    expect(onStart).toHaveBeenCalledWith({
      roundCount: 10,
      snippetDuration: 15,
    })
  })

  it('calls onBack when back clicked', () => {
    const onBack = vi.fn()

    render(
      <GameSettings
        playlist={mockPlaylist}
        availableTrackCount={50}
        onStart={() => {}}
        onBack={onBack}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(onBack).toHaveBeenCalled()
  })

  it('disables start for invalid settings', () => {
    render(
      <GameSettings
        playlist={mockPlaylist}
        availableTrackCount={50}
        onStart={() => {}}
        onBack={() => {}}
      />
    )

    const input = screen.getByLabelText('Number of rounds')
    fireEvent.change(input, { target: { value: '0' } })

    expect(screen.getByRole('button', { name: 'Start Game' })).toBeDisabled()
  })
})
