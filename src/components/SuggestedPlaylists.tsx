import { useState, useEffect } from 'react'
import { SUGGESTED_PLAYLISTS, type SuggestedPlaylist } from '../config/suggestedPlaylists'
import { SpotifyClient } from '../utils/spotify'
import type { SpotifyPlaylist } from '../types/spotify'

interface PlaylistWithImage extends SuggestedPlaylist {
  imageUrl?: string
  trackCount?: number
}

interface Props {
  accessToken: string
  onSelect: (playlist: SpotifyPlaylist) => void
  selectedId?: string
}

export function SuggestedPlaylists({ accessToken, onSelect, selectedId }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [playlists, setPlaylists] = useState<PlaylistWithImage[]>(SUGGESTED_PLAYLISTS)

  // Fetch playlist images on mount
  useEffect(() => {
    if (!accessToken || SUGGESTED_PLAYLISTS.length === 0) return

    const fetchImages = async () => {
      const client = new SpotifyClient(accessToken)
      const updated = await Promise.all(
        SUGGESTED_PLAYLISTS.map(async (suggestion) => {
          try {
            const playlist = await client.getPlaylist(suggestion.id)
            return {
              ...suggestion,
              imageUrl: playlist.images[0]?.url,
              trackCount: playlist.tracks.total,
            }
          } catch {
            return suggestion
          }
        })
      )
      setPlaylists(updated)
    }

    fetchImages()
  }, [accessToken])

  if (SUGGESTED_PLAYLISTS.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No suggestions available yet</p>
        <p className="text-gray-500 text-sm mt-2">
          Check back soon for curated playlists
        </p>
      </div>
    )
  }

  const handleSelect = async (id: string) => {
    setLoadingId(id)
    setError(null)

    try {
      const client = new SpotifyClient(accessToken)
      const playlist = await client.getPlaylist(id)
      onSelect(playlist)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load playlist')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-[var(--error)]/10 border border-[var(--error)]/30 rounded-lg">
          <p className="text-[var(--error)] text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {playlists.map((playlist) => (
          <button
            key={playlist.id}
            onClick={() => handleSelect(playlist.id)}
            disabled={loadingId !== null}
            className={`
              flex items-center gap-4 p-3 rounded-lg text-left w-full
              transition-default focus-ring cursor-pointer
              disabled:opacity-50 disabled:cursor-wait
              ${
                selectedId === playlist.id
                  ? 'bg-[var(--accent)]/20 ring-2 ring-[var(--accent)]'
                  : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-elevated)]'
              }
            `}
          >
            {playlist.imageUrl ? (
              <img
                src={playlist.imageUrl}
                alt=""
                className="w-16 h-16 rounded object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded bg-gradient-to-br from-[var(--accent)] to-purple-600 flex items-center justify-center flex-shrink-0">
                <MusicIcon />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white truncate">{playlist.name}</p>
              {playlist.trackCount !== undefined ? (
                <p className="text-sm text-gray-400 truncate">
                  {playlist.trackCount} tracks
                </p>
              ) : playlist.description ? (
                <p className="text-sm text-gray-400 truncate">
                  {playlist.description}
                </p>
              ) : null}
              {loadingId === playlist.id && (
                <p className="text-xs text-[var(--accent)]">Loading...</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function MusicIcon() {
  return (
    <svg
      className="w-8 h-8 text-white/80"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  )
}
