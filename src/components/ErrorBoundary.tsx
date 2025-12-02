import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold text-[var(--error)] mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-400 mb-6">
              The app encountered an unexpected error. Please try again.
            </p>
            {this.state.error && (
              <p className="text-[var(--text-secondary)] text-sm mb-6 font-mono bg-[var(--bg-secondary)] p-2 rounded">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleReset}
              className="px-6 py-2 bg-[var(--accent)] text-black rounded-full font-semibold hover:bg-[var(--accent-hover)] active:scale-95 transition-default focus-ring"
            >
              Start Over
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
