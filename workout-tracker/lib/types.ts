export type Exercise = {
  id: string
  name: string
  sets: number
  reps: string
  weight?: string // Optional weight field for tracking progressive overload
}

export type Workout = {
  title: string
  exercises: Exercise[]
}

export type WorkoutData = {
  [key: string]: Workout
}

export type WorkoutProgress = {
  workoutType: string
  currentExerciseIndex: number
  currentSet: number
  isResting: boolean
  timer: number
  lastUpdated: string // ISO date string
  completed: boolean
}

export type SongSource = "default" | "custom" | "youtube"

export type Song = {
  id: string
  title: string
  artist: string
  url: string
  source: SongSource
  youtubeId?: string // YouTube video ID for YouTube sources
}

export type MusicState = {
  songs: Song[]
  currentSongIndex: number
  isPlaying: boolean
  currentTime: number
  volume: number
}

export type MotivationalClip = {
  id: string
  text: string
  url: string
}

export type UserProgress = {
  level: number
  xp: number
  xpToNextLevel: number
  completedWorkouts: {
    [workoutType: string]: number // Number of times each workout was completed
  }
  lastLevelUp: string | null // ISO date string
}
