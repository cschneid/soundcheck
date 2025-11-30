import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorDisplay } from '../ErrorDisplay'

describe('ErrorDisplay', () => {
  it('shows error title for auth_expired', () => {
    render(<ErrorDisplay error={{ type: 'auth_expired', message: 'Session expired' }} />)
    expect(screen.getByText('Session Expired')).toBeInTheDocument()
  })

  it('shows error title for network', () => {
    render(<ErrorDisplay error={{ type: 'network', message: 'No connection' }} />)
    expect(screen.getByText('Connection Lost')).toBeInTheDocument()
  })

  it('shows error title for api', () => {
    render(<ErrorDisplay error={{ type: 'api', status: 500, message: 'Server error' }} />)
    expect(screen.getByText('Request Failed')).toBeInTheDocument()
  })

  it('shows error title for playback', () => {
    render(<ErrorDisplay error={{ type: 'playback', message: 'Playback failed' }} />)
    expect(screen.getByText('Playback Error')).toBeInTheDocument()
  })

  it('shows error message', () => {
    render(<ErrorDisplay error={{ type: 'network', message: 'Custom error message' }} />)
    expect(screen.getByText('Custom error message')).toBeInTheDocument()
  })

  it('shows retry button when onRetry provided and not auth error', () => {
    const onRetry = vi.fn()
    render(
      <ErrorDisplay
        error={{ type: 'network', message: 'Error' }}
        onRetry={onRetry}
      />
    )
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('calls onRetry when retry button clicked', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(
      <ErrorDisplay
        error={{ type: 'network', message: 'Error' }}
        onRetry={onRetry}
      />
    )

    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })

  it('shows log in again button for auth_expired', () => {
    render(<ErrorDisplay error={{ type: 'auth_expired', message: 'Expired' }} />)
    expect(screen.getByRole('button', { name: /log in again/i })).toBeInTheDocument()
  })

  it('does not show retry button for auth_expired', () => {
    const onRetry = vi.fn()
    render(
      <ErrorDisplay
        error={{ type: 'auth_expired', message: 'Expired' }}
        onRetry={onRetry}
      />
    )
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument()
  })

  it('shows dismiss button when onDismiss provided', () => {
    const onDismiss = vi.fn()
    render(
      <ErrorDisplay
        error={{ type: 'network', message: 'Error' }}
        onDismiss={onDismiss}
      />
    )
    expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument()
  })

  it('calls onDismiss when dismiss button clicked', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()
    render(
      <ErrorDisplay
        error={{ type: 'network', message: 'Error' }}
        onDismiss={onDismiss}
      />
    )

    await user.click(screen.getByRole('button', { name: /dismiss/i }))
    expect(onDismiss).toHaveBeenCalled()
  })
})
