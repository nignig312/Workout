"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Play, Pause, SkipForward, Plus, Edit } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getWorkoutData, getWorkoutProgress, saveWorkoutProgress, clearWorkoutProgress } from "@/lib/storage"
import { recordWorkoutCompletion } from "@/lib/user-progress"
import type { WorkoutProgress } from "@/lib/types"
import EditExerciseDialog from "@/components/edit-exercise-dialog"
import { LevelBadge } from "@/components/level-badge"
import { AnimatedBackground } from "@/components/animated-background"
import { LevelUpModal } from "@/components/level-up-modal"

export default function WorkoutPage({ params }: { params: { type: string } }) {
  const router = useRouter()
  const workoutType = params.type

  // State declarations - all hooks must be called unconditionally
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [isResting, setIsResting] = useState(false)
  const [timer, setTimer] = useState(60)
  const [isActive, setIsActive] = useState(false)
  const [workoutComplete, setWorkoutComplete] = useState(false)
  const [workoutData, setWorkoutData] = useState(getWorkoutData())
  const [isLoading, setIsLoading] = useState(true)
  const [editingExercise, setEditingExercise] = useState<string | null>(null)
  const [didLevelUp, setDidLevelUp] = useState(false)

  // Use useMemo to safely access workout data
  const workout = useMemo(() => {
    return workoutData[workoutType] || null
  }, [workoutData, workoutType])

  // Use useMemo to safely access current exercise
  const currentExercise = useMemo(() => {
    if (!workout || currentExerciseIndex >= workout.exercises.length) {
      return null
    }
    return workout.exercises[currentExerciseIndex]
  }, [workout, currentExerciseIndex])

  // Constants
  const restTime = 60 // 60 seconds rest
  const workTime = 60 // 60 seconds work

  // Load saved progress or initialize new workout
  useEffect(() => {
    const savedProgress = getWorkoutProgress()

    if (savedProgress && savedProgress.workoutType === workoutType && !savedProgress.completed) {
      // Restore saved progress
      setCurrentExerciseIndex(savedProgress.currentExerciseIndex)
      setCurrentSet(savedProgress.currentSet)
      setIsResting(savedProgress.isResting)
      setTimer(savedProgress.timer)
    } else {
      // Initialize new workout
      setCurrentExerciseIndex(0)
      setCurrentSet(1)
      setIsResting(false)
      setTimer(60) // Default work time
    }

    setIsLoading(false)
  }, [workoutType])

  // Save progress when state changes
  useEffect(() => {
    if (isLoading || !workout) return

    const progress: WorkoutProgress = {
      workoutType,
      currentExerciseIndex,
      currentSet,
      isResting,
      timer,
      lastUpdated: new Date().toISOString(),
      completed: workoutComplete,
    }

    saveWorkoutProgress(progress)
  }, [workoutType, currentExerciseIndex, currentSet, isResting, timer, workoutComplete, isLoading, workout])

  // Timer effect
  useEffect(() => {
    if (!isActive || !currentExercise) return

    const interval = setInterval(() => {
      setTimer((timer) => {
        const newTime = timer - 1

        if (newTime <= 0) {
          clearInterval(interval)

          if (isResting) {
            // Rest is over, move to next set or exercise
            setIsResting(false)
            setTimer(workTime)

            if (currentSet >= currentExercise.sets) {
              // Move to next exercise
              if (workout && currentExerciseIndex >= workout.exercises.length - 1) {
                // Workout complete
                setWorkoutComplete(true)
                setIsActive(false)

                // Record workout completion and check for level up
                const result = recordWorkoutCompletion(workoutType)
                setDidLevelUp(result.didLevelUp)

                return 0
              } else {
                setCurrentExerciseIndex(currentExerciseIndex + 1)
                setCurrentSet(1)
              }
            } else {
              // Move to next set
              setCurrentSet(currentSet + 1)
            }
          } else {
            // Work is over, start rest
            setIsResting(true)
            setTimer(restTime)
          }

          return 0
        }

        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, isResting, currentSet, currentExercise, currentExerciseIndex, workout, workoutType, restTime, workTime])

  const startTimer = () => {
    if (!isActive) {
      setIsActive(true)
      if (timer === 0) {
        setTimer(isResting ? restTime : workTime)
      }
    }
  }

  const pauseTimer = () => {
    setIsActive(false)
  }

  const skipToNext = () => {
    if (!currentExercise || !workout) return

    if (isResting) {
      // Skip rest
      setIsResting(false)
      setTimer(workTime)

      if (currentSet >= currentExercise.sets) {
        // Move to next exercise
        if (currentExerciseIndex >= workout.exercises.length - 1) {
          // Workout complete
          setWorkoutComplete(true)
          setIsActive(false)

          // Record workout completion and check for level up
          const result = recordWorkoutCompletion(workoutType)
          setDidLevelUp(result.didLevelUp)
        }
      } else {
        // Move to next exercise
        setCurrentExerciseIndex(currentExerciseIndex + 1)
        setCurrentSet(1)
      }
    } else {
      // Skip work
      setIsResting(true)
      setTimer(restTime)
    }
  }

  const addThirtySeconds = () => {
    setTimer(timer + 30)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const progress = isResting ? ((restTime - timer) / restTime) * 100 : ((workTime - timer) / workTime) * 100

  const handleExerciseUpdate = () => {
    // Refresh workout data after editing
    setWorkoutData(getWorkoutData())
    setEditingExercise(null)
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center animated-bg text-white p-4">
        <div className="animate-pulse">
          <div className="h-12 w-12 rounded-full bg-white/20"></div>
        </div>
      </div>
    )
  }

  // Render error state if workout not found
  if (!workout) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center animated-bg text-white p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Workout not found</h1>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700">Go back home</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Render completion state
  if (workoutComplete) {
    // Clear progress when workout is complete
    clearWorkoutProgress()

    return (
      <div className="flex min-h-screen flex-col items-center justify-center animated-bg text-white p-4 relative">
        <AnimatedBackground particleCount={30} />
        <LevelUpModal />

        <div className="w-full max-w-md mx-auto text-center space-y-8 relative z-10">
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl">
            <h1 className="text-3xl font-bold mb-4">Workout Complete! 🎉</h1>
            <p className="text-blue-100 mb-6">Great job crushing your {workout.title} workout!</p>

            <div className="mb-6">
              <div className="inline-block">
                <LevelBadge showXP size="lg" animated />
              </div>
              <p className="text-sm mt-2 text-blue-100">+50 XP earned</p>
            </div>

            <Link href="/">
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Ensure we have a current exercise
  if (!currentExercise) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center animated-bg text-white p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Exercise not found</h1>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700">Go back home</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Main workout UI
  return (
    <div className="flex min-h-screen flex-col animated-bg text-white p-4 relative">
      <AnimatedBackground particleCount={10} />

      <header className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold ml-2">{workout.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <LevelBadge size="sm" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditingExercise(currentExercise.id)}
            className="text-white hover:bg-white/10"
          >
            <Edit className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        <div className="w-full max-w-md mx-auto">
          <div className="relative flex flex-col items-center justify-center">
            {/* Circular progress */}
            <div className="relative w-64 h-64 mb-6">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-white/20"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="transparent"
                  r="45"
                  cx="50"
                  cy="50"
                />
                <circle
                  className={isResting ? "text-blue-400" : "text-blue-600"}
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="transparent"
                  r="45"
                  cx="50"
                  cy="50"
                  strokeDasharray={2 * Math.PI * 45}
                  strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.5s" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-bold">{formatTime(timer)}</span>
                <span className={cn("text-sm font-medium mt-2", isResting ? "text-blue-300" : "text-blue-100")}>
                  {isResting ? "REST" : "WORK"}
                </span>
              </div>
            </div>

            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-bold">{currentExercise.name}</h2>
              <p className="text-blue-100">
                Set {currentSet} of {currentExercise.sets} • {currentExercise.reps}
                {currentExercise.weight ? ` • ${currentExercise.weight}` : ""}
              </p>
            </div>

            <div className="flex space-x-4">
              {isActive ? (
                <Button
                  onClick={pauseTimer}
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Pause className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  onClick={startTimer}
                  className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700"
                  size="icon"
                >
                  <Play className="h-5 w-5 ml-0.5" />
                </Button>
              )}

              <Button
                onClick={skipToNext}
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <SkipForward className="h-5 w-5" />
              </Button>

              <Button
                onClick={addThirtySeconds}
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Plus className="h-5 w-5" />
                <span className="sr-only">Add 30 seconds</span>
              </Button>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="text-sm font-medium text-blue-100 mb-2">WORKOUT PROGRESS</h3>
            <Progress value={(currentExerciseIndex / workout.exercises.length) * 100} className="h-2 bg-white/10" />
            <p className="text-sm text-blue-100 mt-2">
              {currentExerciseIndex + 1} of {workout.exercises.length} exercises
            </p>
          </div>
        </div>
      </div>

      {editingExercise && (
        <EditExerciseDialog
          exerciseId={editingExercise}
          workoutType={workoutType}
          onClose={() => setEditingExercise(null)}
          onSave={handleExerciseUpdate}
        />
      )}
    </div>
  )
}
