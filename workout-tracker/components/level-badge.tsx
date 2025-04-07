"use client"

import { useState, useEffect } from "react"
import { getUserProgress } from "@/lib/user-progress"
import { cn } from "@/lib/utils"

interface LevelBadgeProps {
  className?: string
  showXP?: boolean
  size?: "sm" | "md" | "lg"
  animated?: boolean
}

export function LevelBadge({ className, showXP = false, size = "md", animated = false }: LevelBadgeProps) {
  const [progress, setProgress] = useState(getUserProgress())
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Check for updates to progress
    const checkProgress = () => {
      const latestProgress = getUserProgress()
      setProgress(latestProgress)

      // Check if we should animate (if there was a level up in the last 5 seconds)
      if (animated && latestProgress.lastLevelUp) {
        const levelUpTime = new Date(latestProgress.lastLevelUp).getTime()
        const now = new Date().getTime()
        const timeSinceLevelUp = now - levelUpTime

        if (timeSinceLevelUp < 5000) {
          // 5 seconds
          setIsAnimating(true)
          setTimeout(() => setIsAnimating(false), 3000)
        }
      }
    }

    checkProgress()

    // Set up interval to check for updates
    const interval = setInterval(checkProgress, 2000)
    return () => clearInterval(interval)
  }, [animated])

  // Calculate XP percentage
  const xpPercentage = Math.floor((progress.xp / progress.xpToNextLevel) * 100)

  // Size classes
  const sizeClasses = {
    sm: "h-6 text-xs",
    md: "h-8 text-sm",
    lg: "h-10 text-base",
  }

  return (
    <div className={cn("relative flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-blue-600 text-white font-bold",
          sizeClasses[size],
          {
            "sm:w-6 md:w-8 lg:w-10": !showXP,
            "px-3": showXP,
            "animate-pulse": isAnimating,
          },
        )}
      >
        {progress.level}
      </div>

      {showXP && (
        <div className="flex flex-col w-full max-w-[100px]">
          <div className="text-xs font-medium mb-1 flex justify-between">
            <span>XP</span>
            <span>
              {progress.xp}/{progress.xpToNextLevel}
            </span>
          </div>
          <div className="h-1.5 w-full bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${xpPercentage}%` }} />
          </div>
        </div>
      )}

      {/* Level up animation */}
      {isAnimating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute animate-ping rounded-full bg-blue-400 opacity-75 h-full w-full" />
          <div className="absolute animate-pulse rounded-full bg-blue-600 opacity-50 h-full w-full" />
        </div>
      )}
    </div>
  )
}
