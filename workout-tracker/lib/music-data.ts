import type { Song, MotivationalClip } from "./types"
import { v4 as uuidv4 } from "uuid"

// Update the default songs to use a more descriptive placeholder
export const defaultSongs: Song[] = [
  {
    id: uuidv4(),
    title: "Dark Thoughts (Demo)",
    artist: "Lil Tecca",
    url: "https://www.youtube.com/watch?v=Csst0G-QfkU", // This URL doesn't exist in the demo
    source: "default",
  },
  {
    id: uuidv4(),
    title: "Ransom (Demo)",
    artist: "Lil Tecca",
    url: "/placeholder-audio.mp3", // This URL doesn't exist in the demo
    source: "default",
  },
  {
    id: uuidv4(),
    title: "Passo Bem Solto (Demo)",
    artist: "Unknown",
    url: "/placeholder-audio.mp3", // This URL doesn't exist in the demo
    source: "default",
  },
  {
    id: uuidv4(),
    title: "Love for You (Demo)",
    artist: "Unknown",
    url: "/placeholder-audio.mp3", // This URL doesn't exist in the demo
    source: "default",
  },
  {
    id: uuidv4(),
    title: "Under Your Spell (Demo)",
    artist: "Unknown",
    url: "/placeholder-audio.mp3", // This URL doesn't exist in the demo
    source: "default",
  },
  {
    id: uuidv4(),
    title: "Ian 3.5 (Demo)",
    artist: "Unknown",
    url: "/placeholder-audio.mp3", // This URL doesn't exist in the demo
    source: "default",
  },
]

// Update the motivational clips to use a more descriptive placeholder
export const motivationalClips: MotivationalClip[] = [
  {
    id: uuidv4(),
    text: "Think about the results",
    url: "/placeholder-audio.mp3", // This URL doesn't exist in the demo
  },
  {
    id: uuidv4(),
    text: "People WILL respect you",
    url: "/placeholder-audio.mp3", // This URL doesn't exist in the demo
  },
  {
    id: uuidv4(),
    text: "YOU WILL GET BIGGER!!",
    url: "/placeholder-audio.mp3", // This URL doesn't exist in the demo
  },
  {
    id: uuidv4(),
    text: "Keep pushing! One more rep!",
    url: "/placeholder-audio.mp3", // This URL doesn't exist in the demo
  },
  {
    id: uuidv4(),
    text: "Pain is temporary, pride is forever!",
    url: "/placeholder-audio.mp3", // This URL doesn't exist in the demo
  },
]
