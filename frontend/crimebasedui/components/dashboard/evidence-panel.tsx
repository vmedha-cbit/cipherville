"use client"

import { Fingerprint, Camera, FileText, Laptop, Phone, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

interface EvidenceItem {
  id: string
  type: string
  icon: typeof Fingerprint
  label: string
  location: string
  date: string
  tags: string[]
  priority: "critical" | "standard" | "low"
}

const evidenceItems: EvidenceItem[] = [
  {
    id: "EV-001",
    type: "Biometric",
    icon: Fingerprint,
    label: "Partial fingerprint - Left index",
    location: "Crime Scene A - Warehouse",
    date: "2026-02-14",
    tags: ["DNA", "Biometric", "Pending"],
    priority: "critical",
  },
  {
    id: "EV-002",
    type: "Digital",
    icon: Laptop,
    label: "Encrypted laptop - Dell XPS",
    location: "Suspect residence",
    date: "2026-02-13",
    tags: ["Digital", "Encrypted", "In Progress"],
    priority: "critical",
  },
  {
    id: "EV-003",
    type: "Surveillance",
    icon: Camera,
    label: "CCTV Footage - 4 clips",
    location: "District 7 traffic cameras",
    date: "2026-02-12",
    tags: ["Video", "Surveillance"],
    priority: "standard",
  },
  {
    id: "EV-004",
    type: "Document",
    icon: FileText,
    label: "Forged identity documents",
    location: "Port Authority checkpoint",
    date: "2026-02-11",
    tags: ["Document", "Forgery"],
    priority: "standard",
  },
  {
    id: "EV-005",
    type: "Digital",
    icon: Phone,
    label: "Burner phone - 3 contacts",
    location: "Dumpster near safe house",
    date: "2026-02-10",
    tags: ["Digital", "Communications"],
    priority: "low",
  },
  {
    id: "EV-006",
    type: "Location",
    icon: MapPin,
    label: "GPS tracker data dump",
    location: "Vehicle - Black sedan",
    date: "2026-02-09",
    tags: ["Location", "Tracking"],
    priority: "low",
  },
]

const priorityColors = {
  critical: "border-l-primary",
  standard: "border-l-secondary",
  low: "border-l-muted-foreground",
}

const tagColors: Record<string, string> = {
  DNA: "bg-primary/10 text-primary",
  Biometric: "bg-primary/10 text-primary",
  Pending: "bg-yellow-500/10 text-yellow-500",
  Digital: "bg-secondary/10 text-secondary",
  Encrypted: "bg-primary/10 text-primary",
  "In Progress": "bg-secondary/10 text-secondary",
  Video: "bg-muted text-muted-foreground",
  Surveillance: "bg-muted text-muted-foreground",
  Document: "bg-muted text-muted-foreground",
  Forgery: "bg-primary/10 text-primary",
  Communications: "bg-secondary/10 text-secondary",
  Location: "bg-muted text-muted-foreground",
  Tracking: "bg-secondary/10 text-secondary",
}

export function EvidencePanel() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-3 w-0.5 bg-secondary" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
            Evidence Locker
          </h2>
        </div>
        <span className="text-[10px] uppercase text-muted-foreground">
          {evidenceItems.length} Items Cataloged
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {evidenceItems.map((item) => (
          <div
            key={item.id}
            className={cn(
              "group flex cursor-pointer items-start gap-4 rounded-sm border border-border border-l-2 bg-card px-4 py-3 transition-all hover:border-border hover:bg-card/80",
              priorityColors[item.priority]
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-muted">
              <item.icon className="h-4 w-4 text-secondary" />
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="font-mono text-[10px] text-muted-foreground">{item.id}</span>
                <span className="text-[10px] text-muted-foreground">{"//"}</span>
                <span className="text-[10px] uppercase text-muted-foreground">{item.type}</span>
              </div>
              <p className="mb-1 text-xs font-bold text-foreground">{item.label}</p>
              <div className="mb-2 flex items-center gap-4">
                <span className="text-[10px] text-muted-foreground">{item.location}</span>
                <span className="text-[10px] text-muted-foreground">{item.date}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      "rounded-sm px-1.5 py-0.5 text-[9px] font-bold uppercase",
                      tagColors[tag] ?? "bg-muted text-muted-foreground"
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
