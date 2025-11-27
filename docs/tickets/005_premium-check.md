# 005: Premium Account Check

## Summary
After authentication, verify user has Spotify Premium. Display clear error message for non-premium users explaining the limitation.

## Acceptance Criteria
- [ ] After login, fetch user profile
- [ ] Check `product` field for premium status
- [ ] Non-premium users see friendly error screen
- [ ] Error explains why Premium is required
- [ ] Provides logout option to try different account

## Technical Details

### User Fetch (uses SpotifyClient from 003)
```typescript
const user = await spotifyClient.getCurrentUser()
if (user.product !== 'premium') {
  // Show premium required screen
}
```

### Premium Check Hook (`src/hooks/usePremiumCheck.ts`)
```typescript
interface PremiumCheckResult {
  isLoading: boolean
  isPremium: boolean | null
  user: SpotifyUser | null
  error: string | null
}

export function usePremiumCheck(accessToken: string | null): PremiumCheckResult
```

### Component (`src/components/PremiumRequired.tsx`)
Display when user is not premium:
```
🎵 Spotify Premium Required

This app uses Spotify's Web Playback SDK to play music
directly in your browser, which requires a Premium subscription.

If you have Premium on a different account, you can:

[Log out and try another account]

---
Why is this required?
Spotify only allows third-party apps to control playback
for Premium subscribers.
```

## Testing
**Unit tests:**
- Hook returns `isPremium: true` for premium user
- Hook returns `isPremium: false` for free user
- Hook handles API errors gracefully

**Manual verification:**
1. Login with Premium account → proceeds to app
2. Login with free account → sees Premium Required screen
3. Logout from error screen → returns to login

## Dependencies
- 003_spotify-types
- 004_spotify-oauth

## Estimated Complexity
Small
