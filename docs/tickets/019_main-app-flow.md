# 019: Main App Flow Integration

## Summary
Wire together all components into a cohesive app flow with proper state management and navigation.

## Acceptance Criteria
- [ ] All screens connected with proper flow
- [ ] State managed at app level
- [ ] Clean transitions between phases
- [ ] Error boundaries for crashes
- [ ] Loading states throughout

## Technical Details

### App Phases
```typescript
type AppPhase =
  | 'login'
  | 'loading-user'
  | 'premium-required'
  | 'playlist-select'
  | 'loading-tracks'
  | 'game-settings'
  | 'playing'
  | 'complete'
```

### App State
```typescript
interface AppState {
  phase: AppPhase
  auth: AuthState
  user: SpotifyUser | null
  playlist: SpotifyPlaylist | null
  tracks: SpotifyTrack[] | null
  game: GameState | null
}
```

### Flow Diagram
```
login
  ↓ (successful auth)
loading-user
  ↓ (user loaded)
premium-required ← (not premium)
  ↓ (is premium)
playlist-select
  ↓ (playlist selected)
loading-tracks
  ↓ (tracks loaded)
game-settings
  ↓ (start clicked)
playing
  ↓ (all rounds complete)
complete
  ↓ (play again)     ↓ (new playlist)
playing            playlist-select
```

### Component (`src/App.tsx`)
```typescript
function App() {
  const [phase, setPhase] = useState<AppPhase>('login')
  const auth = useAuth()
  // ... other hooks

  switch (phase) {
    case 'login':
      return <LoginScreen />
    case 'loading-user':
      return <LoadingSpinner message="Loading your profile..." />
    case 'premium-required':
      return <PremiumRequired onLogout={...} />
    case 'playlist-select':
      return <PlaylistPicker onSelect={...} />
    // etc.
  }
}
```

### Error Boundary
```typescript
class ErrorBoundary extends React.Component {
  // Catch rendering errors
  // Show friendly error message
  // Provide "Start Over" button
}
```

### Loading Component (`src/components/LoadingSpinner.tsx`)
Reusable loading indicator with optional message

## Testing
**Integration tests:**
```typescript
describe('App Flow', () => {
  it('shows login initially')
  it('transitions to loading after auth')
  it('shows premium required for free users')
  it('shows playlist select for premium users')
  it('loads tracks after playlist selection')
  it('shows game settings after tracks load')
  it('starts game on settings submit')
  it('shows end screen after last round')
  it('resets to playlist select on new playlist')
  it('resets game on play again')
})
```

**Manual verification:**
Complete full flow end-to-end

## Dependencies
- All previous tickets (017, 018)

## Estimated Complexity
Large
