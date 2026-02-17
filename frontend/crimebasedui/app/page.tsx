"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { CaseFileCards } from "@/components/dashboard/case-file-cards"
import { EvidencePanel } from "@/components/dashboard/evidence-panel"
import { DatabaseTerminal } from "@/components/dashboard/database-terminal"
import { StatusPanel } from "@/components/dashboard/status-panel"
import { AlertPanels } from "@/components/dashboard/alert-panels"
import { CaseTimeline } from "@/components/dashboard/case-timeline"
import { LoadingOverlay } from "@/components/dashboard/loading-overlay"

export default function CiphervilleDashboard() {
  return (
    <>
      <LoadingOverlay />

      <div className="flex h-screen flex-col overflow-hidden">
        <DashboardHeader />

        <div className="flex flex-1 overflow-hidden">
          <DashboardSidebar />

          {/* Main Content Area */}
          <main className="fingerprint-bg relative flex-1 overflow-y-auto">
            {/* Grid overlay */}
            <div className="grid-overlay pointer-events-none absolute inset-0 opacity-30" />

            <div className="relative z-10 p-6">
              {/* Top Bar */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-muted-foreground">CASE //</span>
                    <span className="font-mono text-sm font-bold text-secondary">CVL-2026-041</span>
                    <span className="rounded-sm bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase text-primary">
                      Active Investigation
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {"Operation: Shadow Circuit // Priority: Alpha // Classification: Top Secret"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="rounded-sm border border-border bg-card px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-all hover:border-secondary/40 hover:text-secondary">
                    Export Report
                  </button>
                  <button className="rounded-sm border border-primary/40 bg-primary/10 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-primary transition-all hover:bg-primary/20">
                    New Evidence
                  </button>
                </div>
              </div>

              {/* Dashboard Grid */}
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {/* Left Column - 2/3 width */}
                <div className="flex flex-col gap-6 xl:col-span-2">
                  <CaseFileCards />
                  <DatabaseTerminal />
                  <EvidencePanel />
                </div>

                {/* Right Column - 1/3 width */}
                <div className="flex flex-col gap-6">
                  <StatusPanel />
                  <AlertPanels />
                  <CaseTimeline />
                </div>
              </div>

              {/* Footer */}
              <footer className="mt-8 border-t border-border pt-4">
                <div className="flex items-center justify-between text-[9px] uppercase text-muted-foreground">
                  <span>Cipherville Investigation System v4.2.1 // Forensic Analysis Division</span>
                  <span>
                    Encrypted Connection // AES-256-GCM // Session ID: 7749-ALPHA-{Date.now().toString(36).toUpperCase().slice(0, 4)}
                  </span>
                </div>
              </footer>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
