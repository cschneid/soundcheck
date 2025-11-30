import type { SpotifyPlaylist } from '../types/spotify'

interface Props {
  playlists: SpotifyPlaylist[]
  onSelect: (playlist: SpotifyPlaylist) => void
  selectedId?: string
  isLoading?: boolean
  error?: string | null
}

export function PlaylistList({
  playlists,
  onSelect,
  selectedId,
  isLoading,
  error,
}: Props) {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Loading playlists...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-[var(--error)]">Error: {error}</p>
      </div>
    )
  }

  if (playlists.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No playlists found</p>
        <p className="text-gray-500 text-sm mt-2">
          Create some playlists in Spotify to get started
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {playlists.map((playlist) => (
        <PlaylistCard
          key={playlist.id}
          playlist={playlist}
          isSelected={playlist.id === selectedId}
          onClick={() => onSelect(playlist)}
        />
      ))}
    </div>
  )
}

interface CardProps {
  playlist: SpotifyPlaylist
  isSelected: boolean
  onClick: () => void
}

function PlaylistCard({ playlist, isSelected, onClick }: CardProps) {
  const imageUrl = playlist.images[0]?.url

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-4 p-3 rounded-lg text-left w-full
        transition-default focus-ring cursor-pointer
        ${
          isSelected
            ? 'bg-[var(--accent)]/20 ring-2 ring-[var(--accent)]'
            : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-elevated)]'
        }
      `}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="w-16 h-16 rounded object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-16 h-16 rounded bg-gray-700 flex items-center justify-center flex-shrink-0">
          <MusicIcon />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-medium text-white truncate">{playlist.name}</p>
        <p className="text-sm text-gray-400 truncate">
          {playlist.tracks.total} tracks
        </p>
        {playlist.owner.display_name && (
          <p className="text-xs text-gray-500 truncate">
            by {playlist.owner.display_name}
          </p>
        )}
      </div>
    </button>
  )
}

function MusicIcon() {
  return (
    <svg
      className="w-8 h-8 text-gray-500"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  )
}
