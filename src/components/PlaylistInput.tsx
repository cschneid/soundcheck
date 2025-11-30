import { useState } from 'react'
import { parsePlaylistId } from '../utils/parsePlaylistUrl'
import { SpotifyClient } from '../utils/spotify'
import type { SpotifyPlaylist } from '../types/spotify'

interface Props {
  accessToken: string
  onPlaylistLoad: (playlist: SpotifyPlaylist) => void
}

export function PlaylistInput({ accessToken, onPlaylistLoad }: Props) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const playlistId = parsePlaylistId(input)
    if (!playlistId) {
      setError('Invalid playlist URL or ID')
      return
    }

    setIsLoading(true)
    try {
      const client = new SpotifyClient(accessToken)
      const playlist = await client.getPlaylist(playlistId)
      onPlaylistLoad(playlist)
      setInput('')
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('404') || err.message.includes('Not Found')) {
          setError('Playlist not found. It may be private or deleted.')
        } else {
          setError(err.message)
        }
      } else {
        setError('Failed to load playlist')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste Spotify playlist URL or ID"
          className="flex-1 bg-[var(--bg-secondary)] border border-[var(--bg-elevated)] rounded-lg px-4 py-2 text-[var(--text-primary)] placeholder-[var(--text-secondary)] transition-default focus-ring"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:bg-[var(--bg-elevated)] disabled:text-[var(--text-secondary)] disabled:cursor-not-allowed text-black font-semibold px-6 py-2 rounded-lg transition-default focus-ring"
        >
          {isLoading ? 'Loading...' : 'Load'}
        </button>
      </div>
      {error && <p className="text-[var(--error)] text-sm">{error}</p>}
    </form>
  )
}
