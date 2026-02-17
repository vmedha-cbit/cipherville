"use client"

import {
  FolderOpen,
  Fingerprint,
  FileText,
  Database,
  Clock,
  Search,
  AlertTriangle,
  Settings,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const navItems = [
  { icon: FolderOpen, label: "Case File", active: true, badge: "3" },
  { icon: Fingerprint, label: "Evidence", active: false, badge: "12" },
  { icon: FileText, label: "Reports", active: false },
  { icon: Database, label: "Database", active: false },
  { icon: Clock, label: "Timeline", active: false },
  { icon: Search, label: "Search", active: false },
  { icon: AlertTriangle, label: "Alerts", active: false, badge: "!" },
]

export function DashboardSidebar() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <aside className="flex w-56 flex-col border-r border-border bg-sidebar">
      {/* Classification Banner */}
      <div className="border-b border-border bg-primary/10 px-4 py-2 text-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          Classified // Top Secret
        </span>
      </div>

      {/* Agent Info */}
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-muted">
            <span className="text-xs font-bold text-secondary">AG</span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-foreground">Agent Gray</p>
            <p className="text-[10px] uppercase text-muted-foreground">ID: CVL-7749</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          <span className="text-[10px] uppercase text-muted-foreground">Active Session</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3">
        <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Navigation
        </p>
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item, i) => (
            <li key={item.label}>
              <button
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-sm px-3 py-2 text-xs uppercase tracking-wider transition-all",
                  activeIndex === i
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 shrink-0",
                  activeIndex === i ? "text-primary" : "text-muted-foreground group-hover:text-secondary"
                )} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "flex h-4 min-w-4 items-center justify-center rounded-sm px-1 text-[9px] font-bold",
                      item.badge === "!"
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="border-t border-border px-2 py-3">
        <button className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground transition-all hover:bg-muted hover:text-foreground">
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  )
}
