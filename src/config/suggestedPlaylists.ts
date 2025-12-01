// Pre-populated playlist suggestions
// Add Spotify playlist IDs here with display names
export interface SuggestedPlaylist {
  id: string
  name: string
  description?: string
}

export const SUGGESTED_PLAYLISTS: SuggestedPlaylist[] = [
  { id: '3C64V048fGyQfCjmu9TIGA', name: "90's Hits", description: "90's hits" },
  { id: '26MY3qVKQFBSqNMBshJZs8', name: "2000's Hits", description: "2000's hits" },
  { id: '5XALIurWS8TuF6kk8bj438', name: "2010's Hits", description: "2010's hits" },
  { id: '4vSTV61efRmetmaoz95Vet', name: "2020's Hits", description: "2020's hits" }
]
