# Known Bugs

## Fuzzy Matching

### Phonetic misspellings not matched
- "jamoraqui" should match "Jamiroquai" (similarity 0.7, threshold 0.8)
- "ah ha" should match "a-ha" (similarity 0.6)
- Levenshtein distance doesn't account for phonetic similarity
- Options: lower threshold, add spaceless comparison, or add Soundex/Metaphone

### Spacing variations
- User types "ah ha", target is "a-ha" (becomes "aha" after normalization)
- Extra space hurts similarity score
- Could add spaceless comparison as secondary check

## Track Availability

### ~~Unavailable tracks play as silence~~ (Fixed in [028])
- ~~Tracks removed from Spotify but still in playlists are selectable~~
- ~~They play as silent/empty audio~~
- Fixed: Added `market=from_token` to playlist tracks request, filtering on `is_playable` with `available_markets` fallback
- Refs: https://developer.spotify.com/documentation/web-api/concepts/track-relinking

## Game Flow

### ~~URL playlist lost on "Play Again"~~ (Fixed in [027])
- ~~User pastes playlist URL to start game~~
- ~~After game ends, clicking "Play Again" loses the playlist~~
- Fixed: Two-phase setup flow properly retains playlist after "Play Again"
