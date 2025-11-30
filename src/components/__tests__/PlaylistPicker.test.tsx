import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../test/utils'
import { PlaylistPicker } from '../PlaylistPicker'
import type { SpotifyPlaylist } from '../../types/spotify'

// Mock child components to simplify testing
vi.mock('../PlaylistList', () => ({
  PlaylistList: ({ playlists }: { playlists: SpotifyPlaylist[] }) => (
    <div data-testid="playlist-list">
      {playlists.length} playlists
    </div>
  ),
}))

vi.mock('../PlaylistInput', () => ({
  PlaylistInput: () => <div data-testid="playlist-input">URL Input</div>,
}))

const mockPlaylists: SpotifyPlaylist[] = [
  {
    id: 'playlist1',
    name: 'Test Playlist',
    images: [],
    tracks: { total: 10, href: '' },
    owner: { display_name: 'Test' },
  },
]

describe('PlaylistPicker', () => {
  it('renders tabs for My Playlists and Enter URL', () => {
    render(
      <PlaylistPicker
        playlists={mockPlaylists}
        playlistsLoading={false}
        playlistsError={null}
        accessToken="token"
        onSelect={() => {}}
      />
    )

    expect(screen.getByRole('button', { name: 'My Playlists' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enter URL' })).toBeInTheDocument()
  })

  it('shows My Playlists tab by default', () => {
    render(
      <PlaylistPicker
        playlists={mockPlaylists}
        playlistsLoading={false}
        playlistsError={null}
        accessToken="token"
        onSelect={() => {}}
      />
    )

    expect(screen.getByTestId('playlist-list')).toBeInTheDocument()
    expect(screen.queryByTestId('playlist-input')).not.toBeInTheDocument()
  })

  it('switches to Enter URL tab when clicked', () => {
    render(
      <PlaylistPicker
        playlists={mockPlaylists}
        playlistsLoading={false}
        playlistsError={null}
        accessToken="token"
        onSelect={() => {}}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Enter URL' }))

    expect(screen.getByTestId('playlist-input')).toBeInTheDocument()
    expect(screen.queryByTestId('playlist-list')).not.toBeInTheDocument()
  })

  it('switches back to My Playlists tab when clicked', () => {
    render(
      <PlaylistPicker
        playlists={mockPlaylists}
        playlistsLoading={false}
        playlistsError={null}
        accessToken="token"
        onSelect={() => {}}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Enter URL' }))
    fireEvent.click(screen.getByRole('button', { name: 'My Playlists' }))

    expect(screen.getByTestId('playlist-list')).toBeInTheDocument()
    expect(screen.queryByTestId('playlist-input')).not.toBeInTheDocument()
  })

  it('active tab has different styling', () => {
    render(
      <PlaylistPicker
        playlists={mockPlaylists}
        playlistsLoading={false}
        playlistsError={null}
        accessToken="token"
        onSelect={() => {}}
      />
    )

    const myPlaylistsTab = screen.getByRole('button', { name: 'My Playlists' })
    const enterUrlTab = screen.getByRole('button', { name: 'Enter URL' })

    expect(myPlaylistsTab).toHaveClass('bg-[var(--accent)]')
    expect(enterUrlTab).not.toHaveClass('bg-[var(--accent)]')
  })
})
