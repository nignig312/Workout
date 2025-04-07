"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Music,
  Plus,
  X,
  Trash2,
  VolumeX,
  Volume1,
  ChevronRight,
  Youtube,
} from "lucide-react"
import { getMusicState, saveMusicState, addCustomSong, removeSong, isYoutubeUrl } from "@/lib/music-storage"
import type { MusicState, Song } from "@/lib/types"
import { motivationalClips } from "@/lib/music-data"
import { cn } from "@/lib/utils"
import { YouTubePlayer } from "./youtube-player"

export function MusicPlayer() {
  const [musicState, setMusicState] = useState<MusicState | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [newSongUrl, setNewSongUrl] = useState("")
  const [newSongTitle, setNewSongTitle] = useState("")
  const [newSongArtist, setNewSongArtist] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [motivationalMode, setMotivationalMode] = useState(false)
  const [youtubeReady, setYoutubeReady] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const motivationalAudioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize music state
  useEffect(() => {
    const state = getMusicState()
    setMusicState(state)

    // Create audio element with better error handling
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.volume = state.volume

      // Set up event listeners
      audioRef.current.addEventListener("ended", handleSongEnd)
      audioRef.current.addEventListener("timeupdate", handleTimeUpdate)
      audioRef.current.addEventListener("error", handleAudioError)

      // Prevent unhandled promise rejections from audio element
      audioRef.current.onerror = (e) => {
        console.error("Audio error event:", e)
      }
    }

    // Create motivational audio element with better error handling
    if (!motivationalAudioRef.current) {
      motivationalAudioRef.current = new Audio()
      motivationalAudioRef.current.onerror = (e) => {
        console.error("Motivational audio error:", e)
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.removeEventListener("ended", handleSongEnd)
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate)
        audioRef.current.removeEventListener("error", handleAudioError)
      }

      if (motivationalAudioRef.current) {
        motivationalAudioRef.current.pause()
      }
    }
  }, [])

  // Improve the audio source update logic to better handle errors
  useEffect(() => {
    if (!musicState) return

    const currentSong = musicState.songs[musicState.currentSongIndex]
    if (!currentSong) return

    // Handle YouTube videos differently
    if (currentSong.source === "youtube") {
      // YouTube player will handle this
      if (audioRef.current) {
        audioRef.current.pause()
        // Clear the audio source to prevent errors
        try {
          audioRef.current.src = ""
        } catch (e) {
          console.error("Error clearing audio source:", e)
        }
      }
      return
    }

    // Handle regular audio files with better error handling
    if (audioRef.current) {
      try {
        // Check if URL is valid before setting
        if (!currentSong.url || currentSong.url === "/placeholder-audio.mp3") {
          setError("Using placeholder audio URL. In a real app, this would be a valid audio file.")
          // Don't try to play invalid URLs
          if (musicState.isPlaying) {
            updateMusicState({ isPlaying: false })
          }
          return
        }

        // Set new source
        audioRef.current.src = currentSong.url
        audioRef.current.currentTime = musicState.currentTime

        // Play if needed
        if (musicState.isPlaying) {
          const playPromise = audioRef.current.play()
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.error("Error playing audio:", error)
              updateMusicState({ isPlaying: false })
              setError("Cannot play audio. This is expected in the demo since we're using placeholder URLs.")
            })
          }
        }
      } catch (error) {
        console.error("Error setting audio source:", error)
        updateMusicState({ isPlaying: false })
        setError("Cannot set audio source. This is expected in the demo since we're using placeholder URLs.")
      }
    }
  }, [musicState])

  // Handle play/pause state changes for audio files
  useEffect(() => {
    if (!musicState || !audioRef.current) return

    const currentSong = musicState.songs[musicState.currentSongIndex]
    if (!currentSong || currentSong.source === "youtube") return

    if (musicState.isPlaying) {
      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Error playing audio:", error)
          updateMusicState({ isPlaying: false })
        })
      }
    } else {
      audioRef.current.pause()
    }
  }, [musicState])

  // Handle volume changes
  useEffect(() => {
    if (!musicState || !audioRef.current) return

    audioRef.current.volume = musicState.volume
  }, [musicState])

  // Play random motivational clip every 2-3 minutes when in motivational mode
  useEffect(() => {
    if (!motivationalMode || !motivationalAudioRef.current || !musicState) return

    let timeout: NodeJS.Timeout

    const isPlaying = musicState.isPlaying

    const playRandomClip = () => {
      if (!motivationalAudioRef.current || !musicState) return

      // Don't play if main audio is paused
      if (!musicState.isPlaying) {
        scheduleNextClip()
        return
      }

      try {
        const randomIndex = Math.floor(Math.random() * motivationalClips.length)
        const clip = motivationalClips[randomIndex]

        // Lower music volume temporarily
        if (audioRef.current) {
          const originalVolume = audioRef.current.volume
          audioRef.current.volume = originalVolume * 0.3

          // Set up motivational clip
          motivationalAudioRef.current.src = clip.url
          motivationalAudioRef.current.volume = 1.0

          const playPromise = motivationalAudioRef.current.play()
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.error("Error playing motivational clip:", error)
              // Restore volume immediately on error
              if (audioRef.current) {
                audioRef.current.volume = originalVolume
              }
              // Don't show error for motivational clips to avoid too many alerts
            })
          }

          // Restore volume when clip ends
          motivationalAudioRef.current.onended = () => {
            if (audioRef.current) {
              audioRef.current.volume = originalVolume
            }
            scheduleNextClip()
          }

          // Also restore volume if there's an error
          motivationalAudioRef.current.onerror = () => {
            if (audioRef.current) {
              audioRef.current.volume = originalVolume
            }
            scheduleNextClip()
          }
        }
      } catch (error) {
        console.error("Error with motivational clip:", error)
        scheduleNextClip()
      }
    }

    const scheduleNextClip = () => {
      // Random time between 60-180 seconds (1-3 minutes)
      const nextClipTime = 60000 + Math.random() * 120000
      timeout = setTimeout(playRandomClip, nextClipTime)
    }

    // Start the cycle
    scheduleNextClip()

    return () => {
      clearTimeout(timeout)
      if (motivationalAudioRef.current) {
        motivationalAudioRef.current.pause()
      }
    }
  }, [motivationalMode, musicState])

  const handleSongEnd = () => {
    if (!musicState) return

    // Move to next song
    const nextIndex = (musicState.currentSongIndex + 1) % musicState.songs.length
    updateMusicState({
      currentSongIndex: nextIndex,
      currentTime: 0,
    })
  }

  const handleTimeUpdate = () => {
    if (!audioRef.current || !musicState) return

    // Update current time in state every second
    const currentTime = Math.floor(audioRef.current.currentTime)
    if (Math.abs(currentTime - musicState.currentTime) >= 1) {
      updateMusicState({ currentTime })
    }
  }

  // Improve the handleAudioError function to provide better error information
  const handleAudioError = (e: Event) => {
    console.error("Audio error:", e)

    // More descriptive error message
    setError(
      "Audio file not available or cannot be played. This is expected in the demo since we're using placeholder URLs.",
    )

    // Don't try to play this file again
    if (musicState) {
      // Move to next song if possible
      const nextIndex = (musicState.currentSongIndex + 1) % musicState.songs.length
      if (nextIndex !== musicState.currentSongIndex) {
        updateMusicState({
          currentSongIndex: nextIndex,
          currentTime: 0,
          isPlaying: false, // Don't auto-play to avoid cascading errors
        })
      } else {
        // Just stop playing if there's only one song
        updateMusicState({ isPlaying: false })
      }
    }
  }

  const handleYoutubeReady = () => {
    setYoutubeReady(true)
  }

  const handleYoutubeError = () => {
    setError("Error loading YouTube video. Please check the URL and try again.")
    updateMusicState({ isPlaying: false })
  }

  const updateMusicState = (updates: Partial<MusicState>) => {
    if (!musicState) return

    const newState = { ...musicState, ...updates }
    setMusicState(newState)
    saveMusicState(newState)
  }

  // Improve the togglePlayPause function to better handle errors
  const togglePlayPause = () => {
    if (!musicState) return

    if (!musicState.isPlaying) {
      // About to play - check if we have a valid source
      const currentSong = musicState.songs[musicState.currentSongIndex]

      if (!currentSong) {
        setError("No song selected")
        return
      }

      if (currentSong.source === "youtube") {
        // YouTube player will handle this
        updateMusicState({ isPlaying: true })
      } else if (currentSong.url === "/placeholder-audio.mp3") {
        // Handle placeholder URLs better
        setError("This is a demo with placeholder URLs. In a real app, this would play actual audio files.")
        // Still allow toggling for demo purposes
        updateMusicState({ isPlaying: true })
      } else if (audioRef.current && audioRef.current.src) {
        updateMusicState({ isPlaying: true })
      } else {
        setError("Cannot play audio. Invalid audio source.")
      }
    } else {
      // Just pause
      updateMusicState({ isPlaying: false })
    }
  }

  const playPreviousSong = () => {
    if (!musicState) return

    let prevIndex = musicState.currentSongIndex - 1
    if (prevIndex < 0) prevIndex = musicState.songs.length - 1

    updateMusicState({
      currentSongIndex: prevIndex,
      currentTime: 0,
    })
  }

  const playNextSong = () => {
    if (!musicState) return

    const nextIndex = (musicState.currentSongIndex + 1) % musicState.songs.length
    updateMusicState({
      currentSongIndex: nextIndex,
      currentTime: 0,
    })
  }

  const handleVolumeChange = (value: number[]) => {
    if (!musicState) return
    updateMusicState({ volume: value[0] })
  }

  const handleSeek = (value: number[]) => {
    if (!musicState || !audioRef.current) return

    const currentSong = musicState.songs[musicState.currentSongIndex]
    if (currentSong.source === "youtube") {
      // YouTube doesn't support seeking in the iframe API without premium
      return
    }

    const newTime = value[0]
    audioRef.current.currentTime = newTime
    updateMusicState({ currentTime: newTime })
  }

  const handleAddSong = () => {
    if (!newSongUrl || !newSongTitle) {
      setError("Please provide both a URL and title for the song")
      return
    }

    try {
      // Check if it's a YouTube URL
      if (isYoutubeUrl(newSongUrl)) {
        // Validate YouTube URL format
        if (!newSongUrl.includes("youtube.com/watch?v=") && !newSongUrl.includes("youtu.be/")) {
          setError("Please enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)")
          return
        }
      }

      const newSong = addCustomSong({
        title: newSongTitle,
        artist: newSongArtist || "Unknown",
        url: newSongUrl,
      })

      // Update state with new song
      if (musicState) {
        updateMusicState({
          songs: [...musicState.songs, newSong],
        })
      }

      // Reset form
      setNewSongUrl("")
      setNewSongTitle("")
      setNewSongArtist("")
      setShowAddForm(false)
      setError(null)
    } catch (error) {
      setError("Failed to add song")
      console.error(error)
    }
  }

  const handleRemoveSong = (songId: string) => {
    try {
      removeSong(songId)

      // Update state
      if (musicState) {
        const updatedSongs = musicState.songs.filter((song) => song.id !== songId)

        // Adjust current index if needed
        let currentSongIndex = musicState.currentSongIndex
        const removedIndex = musicState.songs.findIndex((song) => song.id === songId)

        if (removedIndex === currentSongIndex) {
          currentSongIndex = 0
          updateMusicState({
            songs: updatedSongs,
            currentSongIndex,
            isPlaying: false,
            currentTime: 0,
          })
        } else if (removedIndex < currentSongIndex) {
          currentSongIndex--
          updateMusicState({
            songs: updatedSongs,
            currentSongIndex,
          })
        } else {
          updateMusicState({
            songs: updatedSongs,
          })
        }
      }
    } catch (error) {
      setError("Failed to remove song")
      console.error(error)
    }
  }

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const getCurrentSong = (): Song | null => {
    if (!musicState) return null
    return musicState.songs[musicState.currentSongIndex]
  }

  const currentSong = getCurrentSong()
  const songDuration = audioRef.current?.duration || 0
  const isYoutubeSong = currentSong?.source === "youtube"

  return (
    <>
      {/* Music toggle button */}
      <button
        onClick={toggleDrawer}
        className={cn(
          "fixed right-0 top-1/2 z-50 flex items-center justify-center bg-blue-600 text-white p-2 rounded-l-md shadow-lg transition-transform music-toggle",
          isDrawerOpen && "open",
        )}
      >
        <ChevronRight className={cn("h-6 w-6 transition-transform", isDrawerOpen && "rotate-180")} />
        <span className="sr-only">Toggle Music Player</span>
      </button>

      {/* Music drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 z-40 h-full w-64 bg-white dark:bg-gray-900 shadow-lg p-4 music-drawer",
          !isDrawerOpen && "closed",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center">
              <Music className="h-5 w-5 mr-2 text-blue-500" />
              Music Player
            </h2>
          </div>

          <div className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-2 rounded-md mb-4 text-xs">
            <strong>Demo Mode:</strong> Audio playback is simulated. In a real app, you would connect to actual audio
            files.
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-2 rounded-md mb-4 text-sm">
              {error}
              <Button variant="ghost" size="sm" className="h-auto p-0 ml-2" onClick={() => setError(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Now playing */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-3 mb-4">
            <div className="text-xs text-blue-500 dark:text-blue-400 font-medium mb-1">NOW PLAYING</div>
            <div className="font-medium truncate flex items-center">
              {isYoutubeSong && <Youtube className="h-3 w-3 mr-1 text-red-500" />}
              {currentSong?.title || "No song selected"}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{currentSong?.artist || ""}</div>
          </div>

          {/* YouTube player (hidden but functional) */}
          {isYoutubeSong && currentSong?.youtubeId && (
            <div className={cn("mb-4", isDrawerOpen ? "h-32" : "h-0 overflow-hidden")}>
              <YouTubePlayer
                videoId={currentSong.youtubeId}
                isPlaying={musicState?.isPlaying || false}
                volume={musicState?.volume || 0.7}
                onEnded={handleSongEnd}
                onError={handleYoutubeError}
                onReady={handleYoutubeReady}
              />
            </div>
          )}

          {/* Controls */}
          <div className="space-y-4 mb-4">
            {/* Seek bar */}
            <div className="space-y-1">
              <Slider
                value={[musicState?.currentTime || 0]}
                max={songDuration || 100}
                step={1}
                onValueChange={handleSeek}
                disabled={!currentSong || isYoutubeSong}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{formatTime(musicState?.currentTime || 0)}</span>
                <span>{isYoutubeSong ? "--:--" : formatTime(songDuration)}</span>
              </div>
            </div>

            {/* Playback controls */}
            <div className="flex justify-center space-x-2">
              <Button variant="ghost" size="icon" onClick={playPreviousSong} disabled={!currentSong}>
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full h-10 w-10 p-0 flex items-center justify-center"
                onClick={togglePlayPause}
                disabled={!currentSong}
              >
                {musicState?.isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </Button>

              <Button variant="ghost" size="icon" onClick={playNextSong} disabled={!currentSong}>
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            {/* Volume control */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => {
                  if (!musicState) return
                  updateMusicState({ volume: musicState.volume > 0 ? 0 : 0.7 })
                }}
              >
                {!musicState?.volume ? (
                  <VolumeX className="h-4 w-4" />
                ) : musicState.volume < 0.5 ? (
                  <Volume1 className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>

              <Slider
                value={[musicState?.volume || 0]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-full"
              />
            </div>

            {/* Motivational mode toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm">Motivational Audio</span>
              <Button
                variant={motivationalMode ? "default" : "outline"}
                size="sm"
                className={motivationalMode ? "bg-blue-600 hover:bg-blue-700" : ""}
                onClick={() => setMotivationalMode(!motivationalMode)}
              >
                {motivationalMode ? "ON" : "OFF"}
              </Button>
            </div>
          </div>

          {/* Playlist */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Playlist</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAddForm(!showAddForm)} className="h-8 w-8 p-0">
                {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>

            {showAddForm && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md mb-3 space-y-2">
                <Input
                  placeholder="Song URL (MP3 or YouTube)"
                  value={newSongUrl}
                  onChange={(e) => setNewSongUrl(e.target.value)}
                  className="text-sm"
                />
                <Input
                  placeholder="Song Title"
                  value={newSongTitle}
                  onChange={(e) => setNewSongTitle(e.target.value)}
                  className="text-sm"
                />
                <Input
                  placeholder="Artist (optional)"
                  value={newSongArtist}
                  onChange={(e) => setNewSongArtist(e.target.value)}
                  className="text-sm"
                />
                <Button onClick={handleAddSong} className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
                  Add Song
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Supports YouTube URLs (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ) or direct MP3 links
                </p>
              </div>
            )}

            <ul className="space-y-1">
              {musicState?.songs.map((song, index) => (
                <li
                  key={song.id}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-md text-sm",
                    index === musicState.currentSongIndex
                      ? "bg-blue-100 dark:bg-blue-900/30"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800/50",
                  )}
                >
                  <button
                    className="flex-1 text-left truncate flex items-center"
                    onClick={() => {
                      updateMusicState({
                        currentSongIndex: index,
                        currentTime: 0,
                        isPlaying: true,
                      })
                    }}
                  >
                    <span className="w-5 text-center mr-2">
                      {index === musicState.currentSongIndex && musicState.isPlaying ? (
                        <span className="text-blue-500">▶</span>
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span className="truncate flex-1 flex items-center">
                      {song.source === "youtube" && <Youtube className="h-3 w-3 mr-1 text-red-500" />}
                      {song.title}
                    </span>
                  </button>

                  {song.source !== "default" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => handleRemoveSong(song.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
