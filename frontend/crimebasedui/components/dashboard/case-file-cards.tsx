"use client"

import { cn } from "@/lib/utils"
import { User, Lock, CheckCircle2, AlertCircle } from "lucide-react"

type CaseStatus = "active" | "locked" | "completed"

interface Suspect {
  name: string
  alias: string
  id: string
  status: CaseStatus
  threat: "high" | "medium" | "low"
  lastSeen: string
}

const suspects: Suspect[] = [
  {
    name: "Marcus Holloway",
    alias: "The Cipher",
    id: "SUS-0041",
    status: "active",
    threat: "high",
    lastSeen: "District 7, Cipherville",
  },
  {
    name: "Elena Voss",
    alias: "Ghost Wire",
    id: "SUS-0087",
    status: "active",
    threat: "medium",
    lastSeen: "Port Authority Terminal",
  },
  {
    name: "James Rook",
    alias: "Deadbolt",
    id: "SUS-0023",
    status: "locked",
    threat: "high",
    lastSeen: "Federal Holding, Cell 14",
  },
  {
    name: "Yuki Tanaka",
    alias: "Prism",
    id: "SUS-0112",
    status: "completed",
    threat: "low",
    lastSeen: "Cleared - Released",
  },
]

const statusConfig: Record<CaseStatus, { icon: typeof Lock; label: string; color: string; bg: string }> = {
  active: { icon: AlertCircle, label: "Active", color: "text-primary", bg: "bg-primary/10" },
  locked: { icon: Lock, label: "Locked", color: "text-yellow-500", bg: "bg-yellow-500/10" },
  completed: { icon: CheckCircle2, label: "Completed", color: "text-green-500", bg: "bg-green-500/10" },
}

const threatColors = {
  high: "bg-primary/80 text-primary-foreground",
  medium: "bg-yellow-600/80 text-yellow-100",
  low: "bg-green-600/80 text-green-100",
}

export function CaseFileCards() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-3 w-0.5 bg-primary" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
            Suspect Files
          </h2>
        </div>
        <span className="text-[10px] uppercase text-muted-foreground">
          {suspects.length} Records Found
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {suspects.map((suspect) => {
          const config = statusConfig[suspect.status]
          const StatusIcon = config.icon
          const isLocked = suspect.status === "locked"

          return (
            <div
              key={suspect.id}
              className={cn(
                "group relative overflow-hidden rounded-sm border border-border bg-card p-4 transition-all",
                isLocked
                  ? "opacity-60 cursor-not-allowed"
                  : "cursor-pointer hover:border-primary/40 hover:bg-card/80"
              )}
            >
              {/* Top row */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-border bg-muted">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{suspect.name}</p>
                    <p className="text-[10px] uppercase tracking-wider text-secondary">
                      {'"'}{suspect.alias}{'"'}
                    </p>
                  </div>
                </div>
                <div className={cn("flex items-center gap-1.5 rounded-sm px-2 py-1", config.bg)}>
                  <StatusIcon className={cn("h-3 w-3", config.color)} />
                  <span className={cn("text-[10px] font-bold uppercase", config.color)}>
                    {config.label}
                  </span>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-3 gap-3 border-t border-border pt-3">
                <div>
                  <p className="text-[9px] uppercase text-muted-foreground">ID</p>
                  <p className="font-mono text-xs text-foreground">{suspect.id}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase text-muted-foreground">Threat</p>
                  <span className={cn("inline-block rounded-sm px-1.5 py-0.5 text-[9px] font-bold uppercase", threatColors[suspect.threat])}>
                    {suspect.threat}
                  </span>
                </div>
                <div>
                  <p className="text-[9px] uppercase text-muted-foreground">Last Seen</p>
                  <p className="text-[10px] text-foreground">{suspect.lastSeen}</p>
                </div>
              </div>

              {/* Scan line on hover */}
              {!isLocked && (
                <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="absolute inset-0 bg-primary/[0.02]" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
