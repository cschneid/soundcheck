import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PremiumRequired } from '../PremiumRequired'

describe('PremiumRequired', () => {
  it('renders the premium required message', () => {
    render(<PremiumRequired onLogout={() => {}} />)

    expect(screen.getByText('Spotify Premium Required')).toBeInTheDocument()
    expect(
      screen.getByText(/Web Playback SDK to play music directly/)
    ).toBeInTheDocument()
  })

  it('explains why premium is required', () => {
    render(<PremiumRequired onLogout={() => {}} />)

    expect(screen.getByText('Why is this required?')).toBeInTheDocument()
    expect(
      screen.getByText(/only allows third-party apps to control playback/)
    ).toBeInTheDocument()
  })

  it('shows logout button', () => {
    render(<PremiumRequired onLogout={() => {}} />)

    expect(
      screen.getByRole('button', { name: /log out and try another account/i })
    ).toBeInTheDocument()
  })

  it('calls onLogout when button is clicked', () => {
    const onLogout = vi.fn()
    render(<PremiumRequired onLogout={onLogout} />)

    fireEvent.click(
      screen.getByRole('button', { name: /log out and try another account/i })
    )

    expect(onLogout).toHaveBeenCalledTimes(1)
  })
})
