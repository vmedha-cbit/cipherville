"use client"

import { cn } from "@/lib/utils"

interface TimelineEvent {
  time: string
  date: string
  title: string
  description: string
  type: "critical" | "standard" | "info"
}

const events: TimelineEvent[] = [
  {
    time: "03:14",
    date: "FEB 17",
    title: "Intrusion Alert Triggered",
    description: "Unauthorized access attempt detected on evidence server.",
    type: "critical",
  },
  {
    time: "22:30",
    date: "FEB 16",
    title: "Witness Statement Recorded",
    description: "Witness #3 provided testimony regarding District 7 incident.",
    type: "standard",
  },
  {
    time: "18:45",
    date: "FEB 16",
    title: "Evidence Item EV-002 Logged",
    description: "Encrypted laptop recovered from suspect residence.",
    type: "standard",
  },
  {
    time: "14:22",
    date: "FEB 15",
    title: "Suspect Surveillance Update",
    description: "Subject Marcus Holloway spotted near Port Authority.",
    type: "critical",
  },
  {
    time: "09:00",
    date: "FEB 15",
    title: "Case #CVL-2026-041 Opened",
    description: "New investigation opened. Lead Agent: Gray.",
    type: "info",
  },
]

const dotColors = {
  critical: "bg-primary",
  standard: "bg-secondary",
  info: "bg-muted-foreground",
}

export function CaseTimeline() {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <div className="h-3 w-0.5 bg-secondary" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
          Case Timeline
        </h2>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[55px] top-0 h-full w-px bg-border" />

        <div className="flex flex-col gap-4">
          {events.map((event, i) => (
            <div key={i} className="group flex items-start gap-4">
              {/* Time */}
              <div className="w-12 shrink-0 text-right">
                <p className="font-mono text-[10px] text-secondary">{event.time}</p>
                <p className="text-[9px] text-muted-foreground">{event.date}</p>
              </div>

              {/* Dot */}
              <div className="relative z-10 mt-1">
                <div className={cn("h-2.5 w-2.5 rounded-full border border-border", dotColors[event.type])} />
              </div>

              {/* Content */}
              <div className="flex-1 rounded-sm border border-border bg-card p-3 transition-all group-hover:border-border/80">
                <p className="mb-1 text-xs font-bold uppercase text-foreground">{event.title}</p>
                <p className="text-[10px] leading-relaxed text-muted-foreground">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
