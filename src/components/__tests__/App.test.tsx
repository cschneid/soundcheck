import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test/utils'
import App from '../../App'

describe('App', () => {
  it('renders the title', () => {
    render(<App />)
    expect(screen.getByText('Spotify Trainer')).toBeInTheDocument()
  })

  it('renders setup message', () => {
    render(<App />)
    expect(screen.getByText('Setup complete. Ready to build.')).toBeInTheDocument()
  })
})
