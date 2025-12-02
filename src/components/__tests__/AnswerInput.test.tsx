import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { AnswerInput, type AnswerInputHandle } from '../AnswerInput'

describe('AnswerInput', () => {
  it('renders two input fields', () => {
    render(<AnswerInput onSubmit={vi.fn()} />)

    expect(screen.getByLabelText('Artist')).toBeInTheDocument()
    expect(screen.getByLabelText('Song Title')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<AnswerInput onSubmit={vi.fn()} />)

    expect(screen.getByRole('button', { name: /submit answer/i })).toBeInTheDocument()
  })

  it('calls onSubmit with both values', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<AnswerInput onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Artist'), 'Queen')
    await user.type(screen.getByLabelText('Song Title'), 'Bohemian Rhapsody')
    await user.click(screen.getByRole('button', { name: /submit answer/i }))

    expect(onSubmit).toHaveBeenCalledWith('Queen', 'Bohemian Rhapsody')
  })

  it('allows empty submissions', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<AnswerInput onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: /submit answer/i }))

    expect(onSubmit).toHaveBeenCalledWith('', '')
  })

  it('submits on Enter in artist field', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<AnswerInput onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Song Title'), 'Bohemian Rhapsody')
    await user.type(screen.getByLabelText('Artist'), 'Queen{enter}')

    expect(onSubmit).toHaveBeenCalledWith('Queen', 'Bohemian Rhapsody')
  })

  it('clears inputs via ref.clear()', async () => {
    const ref = createRef<AnswerInputHandle>()
    const user = userEvent.setup()
    render(<AnswerInput ref={ref} onSubmit={vi.fn()} />)

    await user.type(screen.getByLabelText('Artist'), 'Queen')
    await user.type(screen.getByLabelText('Song Title'), 'Bohemian Rhapsody')

    expect(screen.getByLabelText('Artist')).toHaveValue('Queen')
    expect(screen.getByLabelText('Song Title')).toHaveValue('Bohemian Rhapsody')

    act(() => {
      ref.current?.clear()
    })

    expect(screen.getByLabelText('Artist')).toHaveValue('')
    expect(screen.getByLabelText('Song Title')).toHaveValue('')
  })

  it('focuses title input via ref.focus()', () => {
    const ref = createRef<AnswerInputHandle>()
    render(<AnswerInput ref={ref} onSubmit={vi.fn()} />)

    ref.current?.focus()

    expect(screen.getByLabelText('Song Title')).toHaveFocus()
  })

  it('disables inputs when disabled prop true', () => {
    render(<AnswerInput onSubmit={vi.fn()} disabled />)

    expect(screen.getByLabelText('Artist')).toBeDisabled()
    expect(screen.getByLabelText('Song Title')).toBeDisabled()
  })

  it('disables submit button when disabled', () => {
    render(<AnswerInput onSubmit={vi.fn()} disabled />)

    expect(screen.getByRole('button', { name: /submit answer/i })).toBeDisabled()
  })

  it('shows placeholders', () => {
    render(<AnswerInput onSubmit={vi.fn()} />)

    expect(screen.getByPlaceholderText('Enter artist name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter song title')).toBeInTheDocument()
  })
})
