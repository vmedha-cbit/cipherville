"use client"

import { AlertTriangle, Info, XCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Alert {
  type: "error" | "warning" | "info" | "success"
  title: string
  message: string
  time: string
}

const alerts: Alert[] = [
  {
    type: "error",
    title: "Intrusion Detected",
    message: "Unauthorized access attempt on Evidence Server at 03:14:22. IP blocked.",
    time: "2 hours ago",
  },
  {
    type: "warning",
    title: "Evidence Server Storage",
    message: "Storage capacity at 87%. Consider archiving closed case files.",
    time: "5 hours ago",
  },
  {
    type: "info",
    title: "New Evidence Submitted",
    message: "Forensic lab submitted 3 new evidence items for Case #CVL-2026-041.",
    time: "8 hours ago",
  },
  {
    type: "success",
    title: "Decryption Complete",
    message: "File batch #EV-003-A decrypted successfully. 4 video files recovered.",
    time: "12 hours ago",
  },
]

const alertStyles = {
  error: {
    icon: XCircle,
    border: "border-l-primary",
    iconColor: "text-primary",
    bg: "bg-primary/5",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-l-yellow-500",
    iconColor: "text-yellow-500",
    bg: "bg-yellow-500/5",
  },
  info: {
    icon: Info,
    border: "border-l-secondary",
    iconColor: "text-secondary",
    bg: "bg-secondary/5",
  },
  success: {
    icon: CheckCircle,
    border: "border-l-green-500",
    iconColor: "text-green-500",
    bg: "bg-green-500/5",
  },
}

export function AlertPanels() {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <div className="h-3 w-0.5 bg-primary" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
          System Alerts
        </h2>
      </div>

      <div className="flex flex-col gap-2">
        {alerts.map((alert, i) => {
          const style = alertStyles[alert.type]
          const AlertIcon = style.icon
          return (
            <div
              key={i}
              className={cn(
                "rounded-sm border border-border border-l-2 p-3 transition-all hover:bg-card/80",
                style.border,
                style.bg
              )}
            >
              <div className="flex items-start gap-3">
                <AlertIcon className={cn("mt-0.5 h-4 w-4 shrink-0", style.iconColor)} />
                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase text-foreground">{alert.title}</p>
                    <span className="text-[9px] text-muted-foreground">{alert.time}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    {alert.message}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
