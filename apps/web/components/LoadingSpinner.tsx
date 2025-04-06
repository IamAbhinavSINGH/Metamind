"use client"

import { cn } from "@/lib/utils"
import type { CSSProperties } from "react"
import { useState , useEffect } from "react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  color?: string
  className?: string
  thickness?: number
  speed?: number
}


export function LoadingSpinner({
  size = "md",
  color = "currentColor",
  className,
  thickness = 2,
  speed = 0.75,
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: "16px",
    md: "32px",
    lg: "48px",
  }

  const actualSize = sizeMap[size] || "32px"

  return (
    <div className={cn("inline-block", className)} aria-label="Loading" role="status">
      <div
        style={{
          width: actualSize,
          height: actualSize,
          border: `${thickness}px solid transparent`,
          borderTopColor: color,
          borderRightColor: color,
          borderRadius: "50%",
          animation: `spin ${speed}s linear infinite`,
        }}
      />
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}

interface AILoadingIndicatorProps {
  isLoading: boolean
  loadingText?: string
  className?: string
}

export function LoadingIndicator({ isLoading, loadingText = "Thinking", className }: AILoadingIndicatorProps) {
  const [dots, setDots] = useState("")

  useEffect(() => {
    if (!isLoading) return

    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return ""
        return prev + "."
      })
    }, 500)

    return () => clearInterval(interval)
  }, [isLoading])

  if (!isLoading) return null

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LoadingSpinner size="sm" />
      <span className="min-w-[100px] text-sm font-medium">
        {loadingText}
        <span className="inline-block w-6">{dots}</span>
      </span>
    </div>
  )
}

