import type { UserProgress } from "./types"

// Storage key
const USER_PROGRESS_KEY = "user-progress"

// Default user progress
const defaultUserProgress: UserProgress = {
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  completedWorkouts: {},
  lastLevelUp: null,
}

// Get user progress from localStorage
export const getUserProgress = (): UserProgress => {
  if (typeof window === "undefined") return defaultUserProgress

  try {
    const storedProgress = localStorage.getItem(USER_PROGRESS_KEY)
    if (!storedProgress) {
      localStorage.setItem(USER_PROGRESS_KEY, JSON.stringify(defaultUserProgress))
      return defaultUserProgress
    }

    return JSON.parse(storedProgress) as UserProgress
  } catch (error) {
    console.error("Error loading user progress:", error)
    return defaultUserProgress
  }
}

// Save user progress to localStorage
export const saveUserProgress = (progress: UserProgress): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(USER_PROGRESS_KEY, JSON.stringify(progress))
  } catch (error) {
    console.error("Error saving user progress:", error)
  }
}

// Add XP and check for level up
export const addXP = (
  xpAmount: number,
): {
  newProgress: UserProgress
  didLevelUp: boolean
  previousLevel: number
} => {
  const progress = getUserProgress()
  const previousLevel = progress.level

  // Add XP
  progress.xp += xpAmount

  // Check for level up
  let didLevelUp = false
  while (progress.xp >= progress.xpToNextLevel) {
    progress.xp -= progress.xpToNextLevel
    progress.level += 1
    // Increase XP required for next level (gets harder as you level up)
    progress.xpToNextLevel = Math.floor(progress.xpToNextLevel * 1.2)
    didLevelUp = true
  }

  if (didLevelUp) {
    progress.lastLevelUp = new Date().toISOString()
  }

  // Save updated progress
  saveUserProgress(progress)

  return {
    newProgress: progress,
    didLevelUp,
    previousLevel,
  }
}

// Record a completed workout
export const recordWorkoutCompletion = (
  workoutType: string,
): {
  newProgress: UserProgress
  didLevelUp: boolean
  previousLevel: number
} => {
  const progress = getUserProgress()

  // Update completed workouts count
  if (!progress.completedWorkouts[workoutType]) {
    progress.completedWorkouts[workoutType] = 0
  }
  progress.completedWorkouts[workoutType]++

  // Add XP for completing a workout (50 XP per workout)
  return addXP(50)
}

// Get total completed workouts
export const getTotalCompletedWorkouts = (): number => {
  const progress = getUserProgress()
  return Object.values(progress.completedWorkouts).reduce((total, count) => total + count, 0)
}
