# 021: Error Handling & Edge Cases

## Summary
Comprehensive error handling throughout the app for a robust user experience.

## Acceptance Criteria
- [ ] API errors show user-friendly messages
- [ ] Network failures handled gracefully
- [ ] Token expiry detected and handled
- [ ] Empty playlist handled
- [ ] Playback failures handled
- [ ] Recovery options provided

## Technical Details

### Error Types
```typescript
type AppError =
  | { type: 'auth_expired'; message: string }
  | { type: 'network'; message: string }
  | { type: 'api'; status: number; message: string }
  | { type: 'playback'; message: string }
  | { type: 'unknown'; message: string }
```

### Error Display Component
```typescript
interface Props {
  error: AppError
  onRetry?: () => void
  onDismiss?: () => void
}
```

### Specific Scenarios

**Token Expired:**
- Detect 401 responses
- Show "Session expired" message
- "Log in again" button

**Network Error:**
- Show "Connection lost" message
- "Retry" button

**Playlist Not Found (404):**
- "Playlist not found or is private"
- Clear input, stay on selection screen

**Empty Playlist:**
- "This playlist has no playable tracks"
- Return to playlist selection

**Playback Failed:**
- "Couldn't play this track"
- Option to skip to next track
- Option to retry

**All Tracks Filtered:**
- "All tracks in this playlist are local files"
- Return to selection

### Global Error Handler
```typescript
window.addEventListener('unhandledrejection', (event) => {
  // Log error
  // Show generic error toast
})
```

### Retry Logic
```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000
): Promise<T>
```

## Testing
**Unit tests:**
```typescript
describe('Error Handling', () => {
  it('shows friendly message for 401')
  it('shows friendly message for 404')
  it('shows friendly message for network error')
  it('retry logic attempts correct number of times')
  it('retry backs off appropriately')
})
```

**Manual verification:**
1. Disconnect network → see error, reconnect → retry works
2. Wait for token to expire → re-auth flow works
3. Enter invalid playlist ID → see helpful error
4. Try playlist with only local files → see message

## Dependencies
- 019_main-app-flow

## Estimated Complexity
Medium
