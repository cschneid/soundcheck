import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/utils'
import { PlaylistInput } from '../PlaylistInput'

const mockGetPlaylist = vi.fn()

vi.mock('../../utils/spotify', () => {
  return {
    SpotifyClient: class MockSpotifyClient {
      getPlaylist = mockGetPlaylist
    },
  }
})

const mockPlaylist = {
  id: '37i9dQZF1DXcBWIGoYBM5M',
  name: 'Test Playlist',
  images: [],
  tracks: { total: 50, href: '' },
  owner: { display_name: 'Test User' },
}

describe('PlaylistInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders input and button', () => {
    render(<PlaylistInput accessToken="token" onPlaylistLoad={() => {}} />)

    expect(
      screen.getByPlaceholderText('Paste Spotify playlist URL or ID')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Load' })).toBeInTheDocument()
  })

  it('button is disabled when input is empty', () => {
    render(<PlaylistInput accessToken="token" onPlaylistLoad={() => {}} />)

    expect(screen.getByRole('button', { name: 'Load' })).toBeDisabled()
  })

  it('button is enabled when input has value', () => {
    render(<PlaylistInput accessToken="token" onPlaylistLoad={() => {}} />)

    fireEvent.change(
      screen.getByPlaceholderText('Paste Spotify playlist URL or ID'),
      { target: { value: '37i9dQZF1DXcBWIGoYBM5M' } }
    )

    expect(screen.getByRole('button', { name: 'Load' })).not.toBeDisabled()
  })

  it('shows error for invalid input', async () => {
    render(<PlaylistInput accessToken="token" onPlaylistLoad={() => {}} />)

    fireEvent.change(
      screen.getByPlaceholderText('Paste Spotify playlist URL or ID'),
      { target: { value: 'invalid' } }
    )
    fireEvent.click(screen.getByRole('button', { name: 'Load' }))

    expect(screen.getByText('Invalid playlist URL or ID')).toBeInTheDocument()
  })

  it('calls onPlaylistLoad with fetched playlist', async () => {
    mockGetPlaylist.mockResolvedValue(mockPlaylist)
    const onPlaylistLoad = vi.fn()

    render(
      <PlaylistInput accessToken="token" onPlaylistLoad={onPlaylistLoad} />
    )

    fireEvent.change(
      screen.getByPlaceholderText('Paste Spotify playlist URL or ID'),
      { target: { value: '37i9dQZF1DXcBWIGoYBM5M' } }
    )
    fireEvent.click(screen.getByRole('button', { name: 'Load' }))

    await waitFor(() => {
      expect(onPlaylistLoad).toHaveBeenCalledWith(mockPlaylist)
    })
  })

  it('shows loading state while fetching', async () => {
    mockGetPlaylist.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockPlaylist), 100))
    )

    render(<PlaylistInput accessToken="token" onPlaylistLoad={() => {}} />)

    fireEvent.change(
      screen.getByPlaceholderText('Paste Spotify playlist URL or ID'),
      { target: { value: '37i9dQZF1DXcBWIGoYBM5M' } }
    )
    fireEvent.click(screen.getByRole('button', { name: 'Load' }))

    expect(screen.getByRole('button', { name: 'Loading...' })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Load' })).toBeInTheDocument()
    })
  })

  it('shows error for not found playlist', async () => {
    mockGetPlaylist.mockRejectedValue(new Error('404 Not Found'))

    render(<PlaylistInput accessToken="token" onPlaylistLoad={() => {}} />)

    fireEvent.change(
      screen.getByPlaceholderText('Paste Spotify playlist URL or ID'),
      { target: { value: '37i9dQZF1DXcBWIGoYBM5M' } }
    )
    fireEvent.click(screen.getByRole('button', { name: 'Load' }))

    await waitFor(() => {
      expect(
        screen.getByText('Playlist not found. It may be private or deleted.')
      ).toBeInTheDocument()
    })
  })

  it('clears input after successful load', async () => {
    mockGetPlaylist.mockResolvedValue(mockPlaylist)

    render(<PlaylistInput accessToken="token" onPlaylistLoad={() => {}} />)

    const input = screen.getByPlaceholderText('Paste Spotify playlist URL or ID')
    fireEvent.change(input, { target: { value: '37i9dQZF1DXcBWIGoYBM5M' } })
    fireEvent.click(screen.getByRole('button', { name: 'Load' }))

    await waitFor(() => {
      expect(input).toHaveValue('')
    })
  })
})
