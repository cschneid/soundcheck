export type AppError =
  | { type: 'auth_expired'; message: string }
  | { type: 'network'; message: string }
  | { type: 'api'; status: number; message: string }
  | { type: 'playback'; message: string }
  | { type: 'unknown'; message: string }

export function parseError(error: unknown): AppError {
  if (error instanceof Error) {
    const message = error.message

    // Network errors
    if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
      return { type: 'network', message: 'Connection lost. Check your internet connection.' }
    }

    // Auth expired (401)
    if (message.includes('401') || message.includes('Unauthorized')) {
      return { type: 'auth_expired', message: 'Session expired. Please log in again.' }
    }

    // API errors with status
    const statusMatch = message.match(/(\d{3})/)
    if (statusMatch) {
      const status = parseInt(statusMatch[1], 10)
      if (status === 404) {
        return { type: 'api', status, message: 'Resource not found.' }
      }
      if (status === 403) {
        return { type: 'api', status, message: 'Access denied. Premium may be required.' }
      }
      if (status >= 500) {
        return { type: 'api', status, message: 'Spotify is having issues. Try again later.' }
      }
      return { type: 'api', status, message: `Request failed (${status})` }
    }

    // Playback errors
    if (message.toLowerCase().includes('playback') || message.toLowerCase().includes('player')) {
      return { type: 'playback', message: 'Playback failed. Try again.' }
    }

    return { type: 'unknown', message: message || 'Something went wrong.' }
  }

  if (typeof error === 'string') {
    return { type: 'unknown', message: error }
  }

  return { type: 'unknown', message: 'An unexpected error occurred.' }
}

export function getUserFriendlyMessage(error: AppError): string {
  switch (error.type) {
    case 'auth_expired':
      return error.message
    case 'network':
      return error.message
    case 'api':
      return error.message
    case 'playback':
      return error.message
    case 'unknown':
      return error.message
  }
}
