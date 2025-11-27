import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { usePremiumCheck } from '../usePremiumCheck'

const mockGetCurrentUser = vi.fn()

vi.mock('../../utils/spotify', () => {
  return {
    SpotifyClient: class MockSpotifyClient {
      getCurrentUser = mockGetCurrentUser
    },
  }
})

describe('usePremiumCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns loading false and null values when no token', () => {
    const { result } = renderHook(() => usePremiumCheck(null))

    expect(result.current.isLoading).toBe(false)
    expect(result.current.isPremium).toBeNull()
    expect(result.current.user).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('returns isPremium true for premium user', async () => {
    const mockUser = {
      id: 'user123',
      display_name: 'Test User',
      product: 'premium' as const,
      images: [],
    }

    mockGetCurrentUser.mockResolvedValue(mockUser)

    const { result } = renderHook(() => usePremiumCheck('test-token'))

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.isPremium).toBe(true)
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.error).toBeNull()
  })

  it('returns isPremium false for free user', async () => {
    const mockUser = {
      id: 'user456',
      display_name: 'Free User',
      product: 'free' as const,
      images: [],
    }

    mockGetCurrentUser.mockResolvedValue(mockUser)

    const { result } = renderHook(() => usePremiumCheck('test-token'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.isPremium).toBe(false)
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.error).toBeNull()
  })

  it('returns isPremium false for open user', async () => {
    const mockUser = {
      id: 'user789',
      display_name: 'Open User',
      product: 'open' as const,
      images: [],
    }

    mockGetCurrentUser.mockResolvedValue(mockUser)

    const { result } = renderHook(() => usePremiumCheck('test-token'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.isPremium).toBe(false)
    expect(result.current.user).toEqual(mockUser)
  })

  it('handles API errors gracefully', async () => {
    mockGetCurrentUser.mockRejectedValue(new Error('API Error'))

    const { result } = renderHook(() => usePremiumCheck('test-token'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.isPremium).toBeNull()
    expect(result.current.user).toBeNull()
    expect(result.current.error).toBe('API Error')
  })

  it('handles non-Error objects gracefully', async () => {
    mockGetCurrentUser.mockRejectedValue('string error')

    const { result } = renderHook(() => usePremiumCheck('test-token'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to check premium status')
  })
})
