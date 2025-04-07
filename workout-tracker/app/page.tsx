"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dumbbell, Settings, Award } from "lucide-react"
import { useEffect, useState } from "react"
import { getWorkoutProgress } from "@/lib/storage"
import { getUserProgress, getTotalCompletedWorkouts } from "@/lib/user-progress"
import type { WorkoutProgress } from "@/lib/types"
import { LevelBadge } from "@/components/level-badge"
import { AnimatedBackground } from "@/components/animated-background"
import { LevelUpModal } from "@/components/level-up-modal"

export default function Home() {
  const [progress, setProgress] = useState<WorkoutProgress | null>(null)
  const [userProgress, setUserProgress] = useState(getUserProgress())
  const [totalWorkouts, setTotalWorkouts] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load saved progress
    const savedProgress = getWorkoutProgress()
    const userProgressData = getUserProgress()
    const completedWorkouts = getTotalCompletedWorkouts()

    setProgress(savedProgress)
    setUserProgress(userProgressData)
    setTotalWorkouts(completedWorkouts)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center animated-bg text-white p-4">
        <div className="animate-pulse">
          <Dumbbell className="h-12 w-12 mx-auto text-white/50" />
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center animated-bg text-white p-4 relative">
      <AnimatedBackground particleCount={15} />
      <LevelUpModal />

      <div className="w-full max-w-md mx-auto text-center space-y-8 relative z-10">
        <div className="space-y-2">
          <div className="flex items-center justify-center mb-2">
            <LevelBadge showXP size="lg" animated className="mx-auto" />
          </div>

          <Dumbbell className="h-12 w-12 mx-auto text-white" />
          <h1 className="text-3xl font-bold tracking-tighter">Hello! What are we working today?</h1>
          <p className="text-blue-100">Select your workout to begin</p>

          {totalWorkouts > 0 && (
            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 inline-block">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-300" />
                <span className="text-sm font-medium">{totalWorkouts} workouts completed</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-4">
          {progress && !progress.completed ? (
            <Link href={`/workout/${progress.workoutType}`} className="w-full">
              <Button
                variant="default"
                className="w-full h-16 text-lg font-medium bg-blue-600 hover:bg-blue-700 transition-all"
              >
                Continue{" "}
                {progress.workoutType
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </Button>
            </Link>
          ) : null}

          <Link href="/workout/chest-biceps" className="w-full">
            <Button
              variant="outline"
              className="w-full h-16 text-lg font-medium border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white transition-all"
            >
              Chest + Biceps
            </Button>
          </Link>

          <Link href="/workout/back-shoulders" className="w-full">
            <Button
              variant="outline"
              className="w-full h-16 text-lg font-medium border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white transition-all"
            >
              Back + Shoulders
            </Button>
          </Link>

          <Link href="/workout/triceps-abs" className="w-full">
            <Button
              variant="outline"
              className="w-full h-16 text-lg font-medium border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white transition-all"
            >
              Triceps + Abs
            </Button>
          </Link>
        </div>

        <div className="pt-6 flex justify-center">
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
