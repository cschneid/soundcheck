# Project Tracking

## Ticket Status

| # | Ticket | Status | Commit |
|---|--------|--------|--------|
| 001 | Project Setup | ✅ | 6f89f1e |
| 002 | Testing Infrastructure | ✅ | 6a3265e |
| 003 | Spotify Types & API Client | ✅ | e8d17e6 |
| 004 | Spotify OAuth | ✅ | 94ec298 |
| 005 | Premium Check | ✅ | 6316240 |
| 006 | Fetch User Playlists | ✅ | af10976 |
| 007 | Playlist ID Input | ✅ | a1f601b |
| 008 | Fetch Playlist Tracks | ✅ | 3b600fc |
| 009 | Game State Management | ✅ | 7a19201 |
| 010 | Game Settings UI | ✅ | ab2c3d6 |
| 011 | Spotify Player SDK | ⬜ | |
| 012 | Snippet Playback | ⬜ | |
| 013 | Fuzzy Matching | ⬜ | |
| 014 | Answer Input UI | ⬜ | |
| 015 | Answer Scoring | ⬜ | |
| 016 | Result Feedback UI | ⬜ | |
| 017 | Game Round UI | ⬜ | |
| 018 | End Screen | ⬜ | |
| 019 | Main App Flow | ⬜ | |
| 020 | Polish & Styling | ⬜ | |
| 021 | Error Handling | ⬜ | |
| 022 | Deployment | ⬜ | |

**Legend:** ⬜ Todo | 🔄 In Progress | ✅ Done

## Workflow

1. Read ticket from `docs/tickets/XXX_*.md`
2. Implement with tests
3. Verify manually + Chrome DevTools MCP for UI tickets
4. Run `npm test` (once testing infra exists)
5. Commit: `git commit -m "[XXX] description"`
6. Update this file: change ⬜ → ✅, add commit hash
