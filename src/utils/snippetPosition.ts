/**
 * Calculate a random start position for a snippet that doesn't extend past the track end.
 * @param trackDurationMs - Total track duration in milliseconds
 * @param snippetDurationMs - Desired snippet duration in milliseconds
 * @returns Start position in milliseconds
 */
export function getRandomStartPosition(
  trackDurationMs: number,
  snippetDurationMs: number
): number {
  const maxStart = Math.max(0, trackDurationMs - snippetDurationMs)
  return Math.floor(Math.random() * (maxStart + 1))
}
