# SoundCheck

Music quiz app for bar trivia practice. Pick a Spotify playlist, hear random song snippets, guess artist and title.

**Requires Spotify Premium** (uses Web Playback SDK for audio).

## Human Note

This app is something that's been bouncing around my head for a while now, and I
have been using it as a test of LLM's vibe coding ability. Opus 4.5 in Claude
Code is the first LLM to actually get it done. I have failed a number of times
with other models.

My workflow was to start with a vision.md file, expand to a number of ticket
files, work through those one at a time (each getting a fresh context), and
eventually some manual testing and prompted tweaking to make it feel better.

I had the Chrome Devtools MCP to do testing after each step, which helped it
keep on track w/ minimal issues.

(Everything below is written by LLM)

## Features

- Select from your playlists or paste a playlist URL
- Configurable rounds (default 8) and snippet length (default 10s)
- Fuzzy matching for answers (handles articles, suffixes, typos)
- Replayable snippets during guessing
- Score summary with round-by-round results

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Vitest + React Testing Library
- Spotify Web API + Web Playback SDK
- Frontend-only (implicit OAuth grant)

## Setup

1. Create app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Add redirect URI: `http://localhost:5173/callback`
3. Copy `.env.example` to `.env`, add your client ID
4. `npm install && npm run dev`

## Commands

```bash
npm run dev       # dev server on :5173
npm test          # watch mode
npm run test:run  # single run
npm run build     # production build
```

## Built by Claude

This entire codebase was written by **Claude Opus 4.5** via Claude Code CLI.

### Ticket Workflow

Development follows a ticket-based approach where each feature/fix is:

1. Discussed and scoped with Claude
2. Implemented incrementally
3. Tested (unit + E2E via Chrome DevTools MCP)
4. Committed with ticket number: `[XXX] Brief description`

Example commits:
```
[034] Add abandon game option, swap result display to title-first
[032] Rename to SoundCheck, add suggested playlists tab
[027] Two-phase setup: playlist selection → game config
[021] Error handling and edge cases
```

Human provides direction, Claude writes all code, tests, and documentation.

## License

MIT
