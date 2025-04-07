"use client"

import { useEffect, useRef } from "react"

interface YouTubePlayerProps {
  videoId: string
  isPlaying: boolean
  volume: number
  onEnded: () => void
  onError: () => void
  onReady: () => void
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export function YouTubePlayer({ videoId, isPlaying, volume, onEnded, onError, onReady }: YouTubePlayerProps) {
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isApiLoadedRef = useRef(false)

  // Load YouTube API
  useEffect(() => {
    if (isApiLoadedRef.current) return

    // Create script element
    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"

    // Insert script before first script tag
    const firstScriptTag = document.getElementsByTagName("script")[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    // Setup callback for when API is ready
    window.onYouTubeIframeAPIReady = () => {
      isApiLoadedRef.current = true
      initPlayer()
    }

    return () => {
      // Cleanup
      window.onYouTubeIframeAPIReady = () => {}
    }
  }, [])

  // Initialize player when API is ready
  const initPlayer = () => {
    if (!containerRef.current) return

    playerRef.current = new window.YT.Player(containerRef.current, {
      height: "100%",
      width: "100%",
      videoId: videoId,
      playerVars: {
        autoplay: isPlaying ? 1 : 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
      },
      events: {
        onReady: (event: any) => {
          event.target.setVolume(volume * 100)
          if (isPlaying) {
            event.target.playVideo()
          }
          onReady()
        },
        onStateChange: (event: any) => {
          // When video ends (state = 0)
          if (event.data === 0) {
            onEnded()
          }
        },
        onError: () => {
          onError()
        },
      },
    })
  }

  // Handle play/pause
  useEffect(() => {
    if (!playerRef.current) return

    try {
      if (isPlaying) {
        playerRef.current.playVideo()
      } else {
        playerRef.current.pauseVideo()
      }
    } catch (error) {
      console.error("Error controlling YouTube player:", error)
    }
  }, [isPlaying])

  // Handle volume changes
  useEffect(() => {
    if (!playerRef.current) return

    try {
      playerRef.current.setVolume(volume * 100)
    } catch (error) {
      console.error("Error setting YouTube volume:", error)
    }
  }, [volume])

  // Handle video ID changes
  useEffect(() => {
    if (!playerRef.current) return

    try {
      playerRef.current.loadVideoById(videoId)
      if (isPlaying) {
        playerRef.current.playVideo()
      } else {
        playerRef.current.pauseVideo()
      }
    } catch (error) {
      console.error("Error loading YouTube video:", error)
      onError()
    }
  }, [videoId, isPlaying, onError])

  // Add a fallback for when the YouTube API fails to load
  useEffect(() => {
    // Set a timeout to check if the API loaded
    const timeoutId = setTimeout(() => {
      if (!isApiLoadedRef.current && !playerRef.current) {
        console.error("YouTube API failed to load")
        onError()
      }
    }, 10000) // 10 seconds timeout

    return () => clearTimeout(timeoutId)
  }, [onError])

  return (
    <div className="w-full h-full rounded-md overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
