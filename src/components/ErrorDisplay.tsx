import type { AppError } from '../types/error'
import { getUserFriendlyMessage } from '../types/error'

interface Props {
  error: AppError
  onRetry?: () => void
  onDismiss?: () => void
}

export function ErrorDisplay({ error, onRetry, onDismiss }: Props) {
  const message = getUserFriendlyMessage(error)
  const showRetry = error.type !== 'auth_expired' && onRetry
  const isAuthError = error.type === 'auth_expired'

  return (
    <div className="bg-[var(--error)]/10 border border-[var(--error)]/30 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="text-[var(--error)] text-xl flex-shrink-0">⚠</div>
        <div className="flex-1">
          <p className="text-[var(--text-primary)] font-medium">
            {getErrorTitle(error.type)}
          </p>
          <p className="text-[var(--text-secondary)] text-sm mt-1">{message}</p>

          <div className="flex gap-3 mt-4">
            {showRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-1.5 bg-[var(--accent)] text-black rounded-lg text-sm font-medium hover:bg-[var(--accent-hover)] transition-default focus-ring"
              >
                Try Again
              </button>
            )}
            {isAuthError && (
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-1.5 bg-[var(--accent)] text-black rounded-lg text-sm font-medium hover:bg-[var(--accent-hover)] transition-default focus-ring"
              >
                Log In Again
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-4 py-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-default"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function getErrorTitle(type: AppError['type']): string {
  switch (type) {
    case 'auth_expired':
      return 'Session Expired'
    case 'network':
      return 'Connection Lost'
    case 'api':
      return 'Request Failed'
    case 'playback':
      return 'Playback Error'
    case 'unknown':
      return 'Something Went Wrong'
  }
}
