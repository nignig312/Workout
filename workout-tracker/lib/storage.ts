import type { WorkoutData, WorkoutProgress } from "./types"
import { defaultWorkoutData } from "./workout-data"

// Storage keys
const WORKOUT_DATA_KEY = "workout-data"
const WORKOUT_PROGRESS_KEY = "workout-progress"

// Get workout data from localStorage or use default
export const getWorkoutData = (): WorkoutData => {
  if (typeof window === "undefined") return defaultWorkoutData

  try {
    const storedData = localStorage.getItem(WORKOUT_DATA_KEY)
    if (!storedData) {
      localStorage.setItem(WORKOUT_DATA_KEY, JSON.stringify(defaultWorkoutData))
      return defaultWorkoutData
    }
    return JSON.parse(storedData)
  } catch (error) {
    console.error("Error loading workout data:", error)
    return defaultWorkoutData
  }
}

// Save workout data to localStorage
export const saveWorkoutData = (data: WorkoutData): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(WORKOUT_DATA_KEY, JSON.stringify(data))
  } catch (error) {
    console.error("Error saving workout data:", error)
  }
}

// Get workout progress from localStorage
export const getWorkoutProgress = (): WorkoutProgress | null => {
  if (typeof window === "undefined") return null

  try {
    const storedProgress = localStorage.getItem(WORKOUT_PROGRESS_KEY)
    if (!storedProgress) return null

    const progress = JSON.parse(storedProgress) as WorkoutProgress

    // Check if progress is from a previous day
    const lastUpdated = new Date(progress.lastUpdated)
    const today = new Date()

    if (lastUpdated.toDateString() !== today.toDateString() || progress.completed) {
      // Clear progress if it's from a previous day or was completed
      localStorage.removeItem(WORKOUT_PROGRESS_KEY)
      return null
    }

    return progress
  } catch (error) {
    console.error("Error loading workout progress:", error)
    return null
  }
}

// Save workout progress to localStorage
export const saveWorkoutProgress = (progress: WorkoutProgress): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(WORKOUT_PROGRESS_KEY, JSON.stringify(progress))
  } catch (error) {
    console.error("Error saving workout progress:", error)
  }
}

// Clear workout progress
export const clearWorkoutProgress = (): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(WORKOUT_PROGRESS_KEY)
  } catch (error) {
    console.error("Error clearing workout progress:", error)
  }
}
