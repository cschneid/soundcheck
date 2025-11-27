import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../test/utils'
import App from '../../App'

// Mock useAuth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../../hooks/useAuth'
const mockUseAuth = vi.mocked(useAuth)

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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

  it('shows logout when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      accessToken: 'test-token',
      expiresAt: Date.now() + 3600000,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    })

    render(<App />)
    expect(screen.getByText("You're logged in!")).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
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
