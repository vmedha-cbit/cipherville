"use client"

import { Activity, Shield, Database, Server, Cpu, HardDrive } from "lucide-react"
import { cn } from "@/lib/utils"

interface SystemStatus {
  label: string
  icon: typeof Activity
  status: "online" | "warning" | "offline"
  value: string
  detail: string
}

const systems: SystemStatus[] = [
  {
    label: "NCIC Database",
    icon: Database,
    status: "online",
    value: "99.9%",
    detail: "Uptime",
  },
  {
    label: "Forensic Lab",
    icon: Cpu,
    status: "online",
    value: "7 Active",
    detail: "Analyses",
  },
  {
    label: "Firewall",
    icon: Shield,
    status: "online",
    value: "Tier 5",
    detail: "Security Level",
  },
  {
    label: "Evidence Server",
    icon: Server,
    status: "warning",
    value: "87%",
    detail: "Storage Used",
  },
  {
    label: "Backup System",
    icon: HardDrive,
    status: "online",
    value: "Synced",
    detail: "Last: 5min ago",
  },
  {
    label: "Network Monitor",
    icon: Activity,
    status: "online",
    value: "42ms",
    detail: "Avg Latency",
  },
]

const statusStyles = {
  online: { dot: "bg-green-500", text: "text-green-500", label: "Online" },
  warning: { dot: "bg-yellow-500", text: "text-yellow-500", label: "Warning" },
  offline: { dot: "bg-primary", text: "text-primary", label: "Offline" },
}

export function StatusPanel() {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <div className="h-3 w-0.5 bg-primary" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
          System Status
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
        {systems.map((sys) => {
          const style = statusStyles[sys.status]
          return (
            <div
              key={sys.label}
              className="rounded-sm border border-border bg-card p-3 transition-all hover:border-border/80"
            >
              <div className="mb-2 flex items-center justify-between">
                <sys.icon className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-1.5">
                  <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
                  <span className={cn("text-[9px] font-bold uppercase", style.text)}>
                    {style.label}
                  </span>
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {sys.label}
              </p>
              <p className="mt-1 text-lg font-bold text-foreground">{sys.value}</p>
              <p className="text-[10px] text-muted-foreground">{sys.detail}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
