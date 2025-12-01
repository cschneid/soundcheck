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
        <PlaylistList
          playlists={playlists}
          onSelect={onSelect}
          selectedId={selectedId}
          isLoading={playlistsLoading}
          error={playlistsError}
        />
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
