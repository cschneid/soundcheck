let sdkPromise: Promise<void> | null = null

export function loadSpotifySDK(): Promise<void> {
  if (sdkPromise) return sdkPromise

  sdkPromise = new Promise((resolve, reject) => {
    if (window.Spotify) {
      resolve()
      return
    }

    window.onSpotifyWebPlaybackSDKReady = () => resolve()

    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.onerror = () => reject(new Error('Failed to load Spotify SDK'))
    document.body.appendChild(script)
  })

  return sdkPromise
}
