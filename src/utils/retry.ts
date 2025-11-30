export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Don't retry on auth errors (401) or not found (404)
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('404')) {
          throw error
        }
      }

      if (attempt < maxAttempts) {
        // Exponential backoff: 1s, 2s, 4s...
        const backoff = delayMs * Math.pow(2, attempt - 1)
        await sleep(backoff)
      }
    }
  }

  throw lastError
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
