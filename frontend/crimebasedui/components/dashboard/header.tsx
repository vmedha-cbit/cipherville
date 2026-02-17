"use client"

import { Shield, Wifi, Signal, Clock } from "lucide-react"
import { useEffect, useState } from "react"

export function DashboardHeader() {
  const [time, setTime] = useState("")

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      )
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center rounded bg-primary/20 p-2">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-bold uppercase tracking-widest text-foreground">
            Cipherville Investigation System
          </h1>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Forensic Analysis Division // Clearance Level: Alpha
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Signal className="h-3 w-3 text-secondary" />
          <span className="uppercase">Network: Secure</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Wifi className="h-3 w-3 text-secondary" />
          <span className="uppercase">Encrypted</span>
        </div>
        <div className="flex items-center gap-2 rounded border border-border bg-muted px-3 py-1">
          <Clock className="h-3 w-3 text-primary" />
          <span className="font-mono text-xs tabular-nums text-secondary">
            {time}
          </span>
        </div>
      </div>
    </header>
  )
}
