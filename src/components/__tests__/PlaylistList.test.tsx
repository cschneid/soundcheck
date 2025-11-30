import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../test/utils'
import { PlaylistList } from '../PlaylistList'
import type { SpotifyPlaylist } from '../../types/spotify'

const mockPlaylists: SpotifyPlaylist[] = [
  {
    id: 'playlist1',
    name: 'My Playlist',
    images: [{ url: 'https://example.com/image.jpg', height: 300, width: 300 }],
    tracks: { total: 50, href: 'https://api.spotify.com/v1/playlists/playlist1/tracks' },
    owner: { display_name: 'Test User' },
  },
  {
    id: 'playlist2',
    name: 'Another Playlist',
    images: [],
    tracks: { total: 25, href: 'https://api.spotify.com/v1/playlists/playlist2/tracks' },
    owner: { display_name: null },
  },
]

describe('PlaylistList', () => {
  it('renders loading state', () => {
    render(
      <PlaylistList playlists={[]} onSelect={() => {}} isLoading={true} />
    )

    expect(screen.getByText('Loading playlists...')).toBeInTheDocument()
  })

  it('renders error state', () => {
    render(
      <PlaylistList
        playlists={[]}
        onSelect={() => {}}
        error="Failed to load"
      />
    )

    expect(screen.getByText('Error: Failed to load')).toBeInTheDocument()
  })

  it('renders empty state', () => {
    render(<PlaylistList playlists={[]} onSelect={() => {}} />)

    expect(screen.getByText('No playlists found')).toBeInTheDocument()
    expect(
      screen.getByText('Create some playlists in Spotify to get started')
    ).toBeInTheDocument()
  })

  it('renders playlist items', () => {
    render(<PlaylistList playlists={mockPlaylists} onSelect={() => {}} />)

    expect(screen.getByText('My Playlist')).toBeInTheDocument()
    expect(screen.getByText('50 tracks')).toBeInTheDocument()
    expect(screen.getByText('by Test User')).toBeInTheDocument()

    expect(screen.getByText('Another Playlist')).toBeInTheDocument()
    expect(screen.getByText('25 tracks')).toBeInTheDocument()
  })

  it('calls onSelect when playlist is clicked', () => {
    const onSelect = vi.fn()
    render(<PlaylistList playlists={mockPlaylists} onSelect={onSelect} />)

    fireEvent.click(screen.getByText('My Playlist'))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(mockPlaylists[0])
  })

  it('highlights selected playlist', () => {
    render(
      <PlaylistList
        playlists={mockPlaylists}
        onSelect={() => {}}
        selectedId="playlist1"
      />
    )

    const selectedButton = screen.getByText('My Playlist').closest('button')
    expect(selectedButton).toHaveClass('ring-2')
    expect(selectedButton).toHaveClass('ring-[var(--accent)]')
  })

  it('renders playlist image when available', () => {
    render(<PlaylistList playlists={mockPlaylists} onSelect={() => {}} />)

    // Image has alt="" for decorative purposes, so query by tag
    const images = document.querySelectorAll('img')
    expect(images.length).toBe(1)
    expect(images[0]).toHaveAttribute('src', 'https://example.com/image.jpg')
  })
})
