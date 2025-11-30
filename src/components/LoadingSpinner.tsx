interface Props {
  message?: string
}

export function LoadingSpinner({ message = 'Loading...' }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-[var(--bg-elevated)] border-t-[var(--accent)] rounded-full animate-spin mb-4" />
        <p className="text-gray-400">{message}</p>
      </div>
    </div>
  )
}
