interface Props {
  message?: string
}

export function LoadingSpinner({ message = 'Loading...' }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-gray-600 border-t-green-500 rounded-full animate-spin mb-4" />
        <p className="text-gray-400">{message}</p>
      </div>
    </div>
  )
}
