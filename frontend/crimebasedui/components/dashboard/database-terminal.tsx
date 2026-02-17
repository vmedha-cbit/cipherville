"use client"

import { useState, useRef, useEffect } from "react"
import { Terminal, ChevronRight } from "lucide-react"

const mockResponses: Record<string, string[]> = {
  help: [
    "Available commands:",
    "  search <name>    - Search suspect database",
    "  evidence <id>    - Retrieve evidence record",
    "  status           - System status report",
    "  decrypt <file>   - Attempt file decryption",
    "  trace <ip>       - Trace network origin",
    "  clear            - Clear terminal",
  ],
  status: [
    "[SYS] Cipherville Investigation Database v4.2.1",
    "[SYS] Uptime: 47d 13h 22m",
    "[SYS] Active Cases: 3",
    "[SYS] Pending Analysis: 7",
    "[SYS] Encryption: AES-256-GCM",
    "[SYS] All systems operational.",
  ],
  "search marcus": [
    "[DB] Searching records for: MARCUS",
    "[DB] 1 result found.",
    "",
    "  Name: Marcus Holloway",
    '  Alias: "The Cipher"',
    "  ID: SUS-0041",
    "  Status: ACTIVE",
    "  Threat Level: HIGH",
    "  Last Known: District 7, Cipherville",
  ],
  "trace 192.168.1.1": [
    "[NET] Initiating trace on 192.168.1.1...",
    "[NET] Hop 1: Local gateway (0.3ms)",
    "[NET] Hop 2: ISP Node (12ms)",
    "[NET] Hop 3: Backbone router (34ms)",
    "[NET] Hop 4: Target node (89ms)",
    "[NET] Trace complete. Location: Cipherville Data Center",
    "[NET] WARNING: Proxy detected. Origin may be spoofed.",
  ],
  "decrypt laptop.enc": [
    "[CRYPTO] Attempting decryption on laptop.enc...",
    "[CRYPTO] Cipher: AES-256-CBC",
    "[CRYPTO] Key derivation: PBKDF2",
    "[CRYPTO] ████████░░░░░░░░ 50%",
    "[CRYPTO] ERROR: Insufficient key material.",
    "[CRYPTO] Decryption failed. Additional passphrase required.",
  ],
}

interface TerminalLine {
  type: "input" | "output" | "error"
  content: string
}

export function DatabaseTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "output", content: "[SYS] Cipherville Investigation Terminal v4.2.1" },
    { type: "output", content: '[SYS] Type "help" for available commands.' },
    { type: "output", content: "" },
  ])
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const cmd = input.trim().toLowerCase()
    const newLines: TerminalLine[] = [
      ...lines,
      { type: "input", content: `> ${input}` },
    ]

    if (cmd === "clear") {
      setLines([
        { type: "output", content: "[SYS] Terminal cleared." },
        { type: "output", content: "" },
      ])
      setInput("")
      return
    }

    const response = mockResponses[cmd]
    if (response) {
      response.forEach((line) => {
        newLines.push({ type: "output", content: line })
      })
    } else {
      newLines.push({
        type: "error",
        content: `[ERR] Unknown command: "${input}". Type "help" for available commands.`,
      })
    }
    newLines.push({ type: "output", content: "" })

    setLines(newLines)
    setInput("")
  }

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <div className="h-3 w-0.5 bg-secondary" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
          Database Query Terminal
        </h2>
      </div>

      <div className="overflow-hidden rounded-sm border border-border bg-[#080c12]">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2">
          <Terminal className="h-3.5 w-3.5 text-secondary" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            CIS-Terminal // Secure Channel
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500/60" />
            <span className="text-[9px] uppercase text-muted-foreground">Connected</span>
          </div>
        </div>

        {/* Terminal Body */}
        <div
          ref={scrollRef}
          className="h-64 overflow-y-auto p-4 font-mono text-xs leading-relaxed"
        >
          {lines.map((line, i) => (
            <div key={i} className={
              line.type === "input"
                ? "text-secondary"
                : line.type === "error"
                  ? "text-primary"
                  : "text-muted-foreground"
            }>
              {line.content || "\u00A0"}
            </div>
          ))}

          {/* Input line */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <ChevronRight className="h-3 w-3 shrink-0 text-secondary" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent text-xs text-secondary outline-none placeholder:text-muted-foreground/50"
              placeholder="Enter command..."
              spellCheck={false}
              autoComplete="off"
            />
            <span className="cursor-blink text-secondary">{"_"}</span>
          </form>
        </div>
      </div>
    </section>
  )
}
