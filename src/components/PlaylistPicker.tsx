import { useState } from 'react'
import { PlaylistList } from './PlaylistList'
import { PlaylistInput } from './PlaylistInput'
import { SuggestedPlaylists } from './SuggestedPlaylists'
import type { SpotifyPlaylist } from '../types/spotify'

type Tab = 'my-playlists' | 'suggestions' | 'enter-url'

interface Props {
  playlists: SpotifyPlaylist[]
  playlistsLoading: boolean
  playlistsError: string | null
  accessToken: string
  onSelect: (playlist: SpotifyPlaylist) => void
  selectedId?: string
}

export function PlaylistPicker({
  playlists,
  playlistsLoading,
  playlistsError,
  accessToken,
  onSelect,
  selectedId,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('my-playlists')
  const [playlistQuery, setPlaylistQuery] = useState('')

  const normalizedQuery = playlistQuery.trim().toLowerCase()
  const displayedPlaylists =
    normalizedQuery.length === 0
      ? playlists
      : playlists
          .map((p, idx) => ({
            playlist: p,
            idx,
            name: p.name.toLowerCase(),
            owner: (p.owner.display_name ?? '').toLowerCase(),
          }))
          .filter(({ name, owner }) => name.includes(normalizedQuery) || owner.includes(normalizedQuery))
          .sort((a, b) => {
            const aNamePrefix = a.name.startsWith(normalizedQuery) ? 1 : 0
            const bNamePrefix = b.name.startsWith(normalizedQuery) ? 1 : 0
            if (aNamePrefix !== bNamePrefix) return bNamePrefix - aNamePrefix

            const aOwnerPrefix = a.owner.startsWith(normalizedQuery) ? 1 : 0
            const bOwnerPrefix = b.owner.startsWith(normalizedQuery) ? 1 : 0
            if (aOwnerPrefix !== bOwnerPrefix) return bOwnerPrefix - aOwnerPrefix

            // Stable for everything else
            return a.idx - b.idx
          })
          .map(({ playlist }) => playlist)

  return (
    <div>
      <div className="flex gap-1 mb-6">
        <TabButton
          active={activeTab === 'my-playlists'}
          onClick={() => setActiveTab('my-playlists')}
        >
          My Playlists
        </TabButton>
        <TabButton
          active={activeTab === 'suggestions'}
          onClick={() => setActiveTab('suggestions')}
        >
          Suggestions
        </TabButton>
        <TabButton
          active={activeTab === 'enter-url'}
          onClick={() => setActiveTab('enter-url')}
        >
          Enter URL
        </TabButton>
      </div>

      {activeTab === 'my-playlists' && (
        <div className="space-y-4">
          <input
            type="search"
            value={playlistQuery}
            onChange={(e) => setPlaylistQuery(e.target.value)}
            placeholder="Search your playlists"
            className="w-full bg-[var(--bg-secondary)] border border-[var(--bg-elevated)] rounded-lg px-4 py-2 text-[var(--text-primary)] placeholder-[var(--text-secondary)] transition-default focus-ring"
            disabled={playlistsLoading}
          />

          <PlaylistList
            playlists={displayedPlaylists}
            onSelect={onSelect}
            selectedId={selectedId}
            isLoading={playlistsLoading}
            error={playlistsError}
            emptyTitle={normalizedQuery ? 'No matches' : undefined}
            emptySubtitle={normalizedQuery ? 'Try a different search.' : undefined}
          />
        </div>
      )}

      {activeTab === 'suggestions' && (
        <SuggestedPlaylists
          accessToken={accessToken}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      )}

      {activeTab === 'enter-url' && (
        <PlaylistInput accessToken={accessToken} onPlaylistLoad={onSelect} />
      )}
    </div>
  )
}

interface TabButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-lg font-medium transition-default focus-ring
        ${
          active
            ? 'bg-[var(--accent)] text-black'
            : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
        }
      `}
    >
      {children}
    </button>
  )
}
