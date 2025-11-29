# Spotify Trainer

Music quiz app for bar trivia practice. Users pick a Spotify playlist, listen to random song snippets, and guess the artist/title. Frontend-only, requires Spotify Premium.

## Development Rules

**Current date**: November 2025. Use this when searching for docs/solutions.

**Proactive error research**: When encountering errors during init, library setup, or API calls, immediately web search for current docs/solutions. APIs and CLI commands change frequently - don't assume knowledge cutoff info is accurate. Search before guessing.

## Stack
- React + TypeScript + Vite
- Tailwind CSS
- Vitest + React Testing Library
- Spotify Web API + Web Playback SDK
- No backend (frontend-only, implicit OAuth grant)

## Key Decisions
- **Audio**: Web Playback SDK (requires Premium)
- **Snippet**: 10s default, configurable, random start point, replayable
- **Answers**: Two fields (Artist, Title), fuzzy matched, one attempt
- **Scoring**: Simple correct/incorrect per field
- **Playlist**: User picks from their list OR pastes playlist ID
- **Rounds**: User configurable, default 8

## Testing Strategy

### Unit Tests (Vitest)
Run: `npm test`

Focus areas:
- `src/utils/fuzzyMatch.ts` - extensive coverage required
- `src/utils/parsePlaylistUrl.ts`
- `src/utils/shuffle.ts`
- `src/hooks/useGameState.ts`

### Component Tests (React Testing Library)
All components in `src/components/` should have `__tests__/` coverage.

### E2E Testing (Chrome DevTools MCP)
Use the `chrome-task-executor` agent for automated browser testing.

For each ticket, after implementation:
1. Launch local dev server
2. Use Chrome DevTools MCP to verify UI renders correctly
3. Test user flows (click, fill, navigate)
4. Capture screenshots for visual verification
5. Check console for errors

Example verification tasks:
- Login flow redirects correctly
- Playlist list populates
- Game round displays and accepts input
- Results show after submission
- End screen displays final score

### Test Commands
```bash
npm test          # watch mode
npm run test:run  # single run
npm run test:coverage  # with coverage
```

## File Structure
```
src/
  components/
    __tests__/
  hooks/
  utils/
    __tests__/
  types/
  test/
    setup.ts
```

## Git Workflow
- Commit after each completed ticket
- Commit message format: `[XXX] Brief description` (e.g., `[001] Project setup with Vite/React/TS/Tailwind`)
- Run tests before committing

## Environment Variables
```bash
# .env (git-ignored)
VITE_SPOTIFY_CLIENT_ID=xxx
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback

# For automated E2E testing only
SPOTIFY_TEST_USERNAME=xxx
SPOTIFY_TEST_PASSWORD=xxx
```

Note: `VITE_` prefix required for client-side access in Vite.

## Spotify App Config
- Redirect URI (add to Spotify Dashboard): `http://localhost:5173/callback`
- Scopes: user-read-private, user-read-email, playlist-read-private, playlist-read-collaborative, streaming, user-modify-playback-state, user-read-playback-state

## Dev Commands
```bash
npm run dev       # start dev server (port 5173)
npm run build     # production build
npm run preview   # preview prod build
```
- Use the chrome-task-executor agent when doing full-path testing. Provide comprehensive instructions to the subtask. This is important to isolate token usage into the subagent, away from our main conversation.