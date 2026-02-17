"use client"

import { Search } from "lucide-react"
import { useEffect, useState } from "react"

export function LoadingOverlay() {
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setVisible(false), 300)
          return 100
        }
        return prev + Math.random() * 15 + 5
      })
    }, 200)
    return () => clearInterval(interval)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm transition-opacity">
      <div className="flex flex-col items-center gap-6">
        {/* Magnifying glass icon */}
        <div className="relative">
          <div className="magnify-animate">
            <Search className="h-16 w-16 text-secondary" strokeWidth={1.5} />
          </div>
          {/* Scanning ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-20 animate-spin rounded-full border-2 border-transparent border-t-primary" style={{ animationDuration: "2s" }} />
          </div>
        </div>

        {/* Text */}
        <div className="text-center">
          <p className="mb-1 text-sm font-bold uppercase tracking-widest text-foreground">
            Analyzing Evidence
          </p>
          <p className="text-xs text-muted-foreground">
            Initializing forensic analysis modules
            <span className="cursor-blink text-secondary">{"..."}</span>
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-64">
          <div className="mb-2 h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-secondary transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] uppercase text-muted-foreground">
            <span>Loading Systems</span>
            <span className="font-mono text-secondary">{Math.min(Math.round(progress), 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
