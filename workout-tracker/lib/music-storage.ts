import type { MusicState, Song, SongSource } from "./types"
import { defaultSongs } from "./music-data"

// Storage keys
const MUSIC_STATE_KEY = "music-state"
const CUSTOM_SONGS_KEY = "custom-songs"

// Default music state
const defaultMusicState: MusicState = {
  songs: defaultSongs,
  currentSongIndex: 0,
  isPlaying: false,
  currentTime: 0,
  volume: 0.7,
}

// Get music state from localStorage
export const getMusicState = (): MusicState => {
  if (typeof window === "undefined") return defaultMusicState

  try {
    const storedState = localStorage.getItem(MUSIC_STATE_KEY)
    if (!storedState) {
      localStorage.setItem(MUSIC_STATE_KEY, JSON.stringify(defaultMusicState))
      return defaultMusicState
    }

    const parsedState = JSON.parse(storedState) as MusicState

    // Ensure we have the latest default songs
    const customSongs = parsedState.songs.filter((song) => song.source !== "default")
    parsedState.songs = [...defaultSongs, ...customSongs]

    return parsedState
  } catch (error) {
    console.error("Error loading music state:", error)
    return defaultMusicState
  }
}

// Save music state to localStorage
export const saveMusicState = (state: MusicState): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(MUSIC_STATE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error("Error saving music state:", error)
  }
}

// Extract YouTube video ID from URL
export const extractYoutubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)

  return match && match[2].length === 11 ? match[2] : null
}

// Check if URL is a YouTube URL
export const isYoutubeUrl = (url: string): boolean => {
  return url.includes("youtube.com") || url.includes("youtu.be")
}

// Add a custom song
export const addCustomSong = (song: Omit<Song, "id" | "source" | "youtubeId">): Song => {
  if (typeof window === "undefined") throw new Error("Cannot add song in server environment")

  try {
    let source: SongSource = "custom"
    let youtubeId: string | undefined = undefined

    // Check if it's a YouTube URL
    if (isYoutubeUrl(song.url)) {
      source = "youtube"
      youtubeId = extractYoutubeId(song.url) || undefined

      if (!youtubeId) {
        throw new Error("Invalid YouTube URL")
      }
    }

    const newSong: Song = {
      ...song,
      id: crypto.randomUUID(),
      source,
      ...(youtubeId && { youtubeId }),
    }

    const musicState = getMusicState()
    musicState.songs = [...musicState.songs, newSong]
    saveMusicState(musicState)

    return newSong
  } catch (error) {
    console.error("Error adding custom song:", error)
    throw error
  }
}

// Remove a song (only custom songs can be removed)
export const removeSong = (songId: string): void => {
  if (typeof window === "undefined") return

  try {
    const musicState = getMusicState()
    const songIndex = musicState.songs.findIndex((song) => song.id === songId)

    if (songIndex === -1) return

    const song = musicState.songs[songIndex]
    if (song.source === "default") return // Only remove custom songs

    musicState.songs = musicState.songs.filter((song) => song.id !== songId)

    // Adjust currentSongIndex if needed
    if (songIndex === musicState.currentSongIndex) {
      musicState.currentSongIndex = 0
      musicState.isPlaying = false
      musicState.currentTime = 0
    } else if (songIndex < musicState.currentSongIndex) {
      musicState.currentSongIndex--
    }

    saveMusicState(musicState)
  } catch (error) {
    console.error("Error removing song:", error)
  }
}
