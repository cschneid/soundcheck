import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../test/utils'
import App from '../../App'

// Mock useAuth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

// Mock usePremiumCheck hook
vi.mock('../../hooks/usePremiumCheck', () => ({
  usePremiumCheck: vi.fn(),
}))

// Mock usePlaylists hook
vi.mock('../../hooks/usePlaylists', () => ({
  usePlaylists: vi.fn(),
}))

import { useAuth } from '../../hooks/useAuth'
import { usePremiumCheck } from '../../hooks/usePremiumCheck'
import { usePlaylists } from '../../hooks/usePlaylists'
const mockUseAuth = vi.mocked(useAuth)
const mockUsePremiumCheck = vi.mocked(usePremiumCheck)
const mockUsePlaylists = vi.mocked(usePlaylists)

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default premium check mock
    mockUsePremiumCheck.mockReturnValue({
      isLoading: false,
      isPremium: true,
      user: { id: 'user1', display_name: 'Test User', product: 'premium', images: [] },
      error: null,
    })
    // Default playlists mock
    mockUsePlaylists.mockReturnValue({
      playlists: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })
  })

  it('shows loading state', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      accessToken: null,
      expiresAt: null,
      isLoading: true,
      login: vi.fn(),
      logout: vi.fn(),
    })

    render(<App />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows login button when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      accessToken: null,
      expiresAt: null,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    })

    render(<App />)
    expect(screen.getByText('Login with Spotify')).toBeInTheDocument()
  })

  it('shows playlist view when authenticated with premium', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      accessToken: 'test-token',
      expiresAt: Date.now() + 3600000,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    })

    render(<App />)
    expect(screen.getByText(/Welcome.*Test User/)).toBeInTheDocument()
    expect(screen.getByText('Select a playlist')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('shows premium required when authenticated without premium', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      accessToken: 'test-token',
      expiresAt: Date.now() + 3600000,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    })
    mockUsePremiumCheck.mockReturnValue({
      isLoading: false,
      isPremium: false,
      user: { id: 'user1', display_name: 'Free User', product: 'free', images: [] },
      error: null,
    })

    render(<App />)
    expect(screen.getByText('Spotify Premium Required')).toBeInTheDocument()
  })

  it('calls login when login button clicked', async () => {
    const loginMock = vi.fn()
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      accessToken: null,
      expiresAt: null,
      isLoading: false,
      login: loginMock,
      logout: vi.fn(),
    })

    render(<App />)
    screen.getByText('Login with Spotify').click()
    expect(loginMock).toHaveBeenCalled()
  })
})
