
import { useEffect, useState, useRef } from "react";
import {
  Fingerprint,
  ShieldAlert,
  Database,
  Lock,
  Radio,
  Eye,
  Crosshair,
} from "lucide-react";
import { cn } from "../lib/utils";

// --- Typing text hook ---
function useTypingText(text, speed = 40, delay = 0) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { displayed, done };
}

// --- Log lines for the boot terminal ---
const bootLines = [
  { text: "> Initializing Cipherville Forensic Engine v4.2.1", delay: 0 },
  { text: "> Loading encrypted case archives...", delay: 400 },
  { text: "> Decrypting evidence database [AES-256-GCM]...", delay: 800 },
  { text: "> Scanning biometric authorization...", delay: 1300 },
  { text: "> Verifying agent credentials... GRANTED", delay: 1800 },
  { text: "> Connecting to INTERPOL secure relay...", delay: 2200 },
  { text: "> Establishing satellite uplink... OK", delay: 2600 },
  { text: "> All systems operational. Welcome, Agent.", delay: 3000 },
];

/**
 * Small boot-log component
 * @param {Object} props
 * @param {() => void} props.onComplete
 */
function BootLog({ onComplete }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const completeRef = useRef(false);

  useEffect(() => {
    const timers = bootLines.map((line, i) =>
      setTimeout(() => {
        setVisibleLines(i + 1);
        if (i === bootLines.length - 1 && !completeRef.current) {
          completeRef.current = true;
          setTimeout(onComplete, 600);
        }
      }, line.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="font-mono text-[10px] leading-relaxed text-secondary/80">
      {bootLines.slice(0, visibleLines).map((line, i) => (
        <div
          key={i}
          className="opacity-0"
          style={{ animation: "fade-in-up 0.3s forwards", animationDelay: `${i * 50}ms` }}
        >
          <span className={i === visibleLines - 1 ? "text-secondary" : "text-muted-foreground"}>
            {line.text}
          </span>
        </div>
      ))}
      {visibleLines < bootLines.length && (
        <span className="cursor-blink text-secondary">_</span>
      )}
    </div>
  );
}

// --- Radar widget ---
function Radar() {
  return (
    <div className="relative mx-auto h-28 w-28">
      {/* Rings */}
      {[1, 0.7, 0.4].map((scale, i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-full border border-secondary/20"
          style={{ transform: `scale(${scale})`, top: `${(1 - scale) * 50}%`, left: `${(1 - scale) * 50}%`, width: `${scale * 100}%`, height: `${scale * 100}%` }}
        />
      ))}
      {/* Cross lines */}
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-secondary/10" />
      <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-secondary/10" />
      {/* Sweep */}
      <div
        className="absolute left-1/2 top-1/2 h-14 w-14 origin-bottom-left"
        style={{ animation: "radar-sweep 2s linear infinite", transform: "translate(-50%, -50%)" }}
      >
        <div
          className="h-full w-full rounded-tl-full"
          style={{
            background: "conic-gradient(from 0deg, rgba(0,245,255,0.3), transparent 60deg)",
            transformOrigin: "bottom left",
          }}
        />
      </div>
      {/* Center dot */}
      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary pulse-glow" />
      {/* Blips */}
      <div className="absolute left-[65%] top-[30%] h-1.5 w-1.5 rounded-full bg-primary pulse-glow" />
      <div className="absolute left-[25%] top-[60%] h-1 w-1 rounded-full bg-secondary/60 pulse-glow" />
    </div>
  );
}

// --- Fingerprint scanner ---
function FingerprintScanner({ active }) {
  return (
    <div className="relative flex items-center justify-center">
      <Fingerprint
        className={cn(
          "h-20 w-20 transition-colors duration-1000",
          active ? "text-secondary" : "text-muted-foreground/30"
        )}
        strokeWidth={1}
      />
      {/* Scan line */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute left-0 h-0.5 w-full bg-secondary/60"
          style={{
            animation: "scan 2s ease-in-out infinite",
            boxShadow: "0 0 12px 4px rgba(0,245,255,0.3)",
          }}
        />
      </div>
      {active && (
        <div className="absolute -bottom-3 text-center text-[9px] font-bold uppercase tracking-widest text-secondary">
          Biometric Verified
        </div>
      )}
    </div>
  );
}

// --- Main Loading Overlay ---
// Exported as default to replace existing DetectiveLoading
export default function DetectiveLoading({ isLoading = true }) {
  const [visible, setVisible] = useState(isLoading);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("boot"); // "boot" | "scan" | "ready"
  const [showStamp, setShowStamp] = useState(false);

  // Sync internal visibility with prop, but allow fade out
  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setFadeOut(false);
      setProgress(0);
      setPhase("boot");
      setShowStamp(false);
    } else {
      // If isLoading becomes false, we could trigger fade out, 
      // but typically this component manages its own lifecycle or is unmounted. 
      // We'll respect the parent's control if it unmounts it, 
      // but if the parent keeps it mounted and toggles isLoading, let's fade out.
      setFadeOut(true);
      setTimeout(() => setVisible(false), 500); 
    }
  }, [isLoading]);
  
  // Progress ticker
  useEffect(() => {
    if (!visible) return;
    
    // Simulating progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 3 + 1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [visible]);

  // Phase transitions
  useEffect(() => {
    if (!visible) return;
    
    const t1 = setTimeout(() => setPhase("scan"), 2000);
    const t2 = setTimeout(() => setPhase("ready"), 3500);
    const t3 = setTimeout(() => setShowStamp(true), 4000);
    // Removed auto-fadeout logic to let parent control when loading is done via props
    // but we can keep the internal sequence if isLoading is always true initially
    
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [visible]);

  if (!visible) return null;

  const capped = Math.min(Math.round(progress), 100);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-500",
        fadeOut ? "opacity-0" : "opacity-100"
      )}
    >
      {/* Background data streams */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 font-mono text-[8px] leading-none text-secondary/[0.04]"
            style={{
              left: `${10 + i * 12}%`,
              animation: `data-stream ${3 + i * 0.5}s linear infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            {Array.from({ length: 40 }).map((_, j) => (
              <div key={j}>{Math.random().toString(16).slice(2, 10).toUpperCase()}</div>
            ))}
          </div>
        ))}
      </div>

      {/* Grid overlay */}
      <div className="grid-overlay pointer-events-none absolute inset-0 opacity-20" />

      {/* Center content */}
      <div className="relative z-10 w-full max-w-3xl px-6">
        {/* Top header */}
        <div className="mb-8 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
              Classified Access
            </span>
            <ShieldAlert className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-[0.2em] text-foreground">
            Cipherville Investigation System
          </h1>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Forensic Analysis Division // Secure Terminal Boot Sequence
          </p>
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Card 1: Boot Terminal */}
          <div
            className="overflow-hidden rounded-sm border border-border bg-card p-4"
            style={{ animation: "fade-in-up 0.5s forwards", animationDelay: "0.1s", opacity: 0 }}
          >
            <div className="mb-3 flex items-center gap-2">
              <Database className="h-3.5 w-3.5 text-secondary" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-secondary">
                System Boot
              </span>
            </div>
            <div className="h-36 overflow-hidden rounded-sm bg-background/60 p-3">
              <BootLog onComplete={() => {}} />
            </div>
          </div>

          {/* Card 2: DAY 2 Revamp + Radar */}
          <div
            className="relative overflow-hidden rounded-sm border border-primary/30 bg-card p-4"
            style={{ animation: "fade-in-up 0.5s forwards", animationDelay: "0.3s", opacity: 0 }}
          >
            {/* Horizontal scan line */}
            <div
              className="pointer-events-none absolute top-0 h-full w-[30%] opacity-20"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,59,59,0.4), transparent)",
                animation: "h-scan 2.5s linear infinite",
              }}
            />
            <div className="mb-3 flex items-center gap-2">
              <Crosshair className="h-3.5 w-3.5 text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary">
                Active Operation
              </span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Radar />
              <div className="mt-1 text-center">
                <p className="text-lg font-bold uppercase tracking-wider text-primary">
                  DAY 2
                </p>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-foreground">
                  Revamp Loading
                </p>
              </div>
            </div>

            {/* CLASSIFIED stamp */}
            {showStamp && (
              <div
                className="absolute right-3 top-3"
                style={{ animation: "stamp 0.4s ease-out forwards" }}
              >
                <div className="rounded-sm border-2 border-primary/60 px-2 py-0.5">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-primary/80">
                    Classified
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Biometric + Status */}
          <div
            className="overflow-hidden rounded-sm border border-border bg-card p-4"
            style={{ animation: "fade-in-up 0.5s forwards", animationDelay: "0.5s", opacity: 0 }}
          >
            <div className="mb-3 flex items-center gap-2">
              <Eye className="h-3.5 w-3.5 text-secondary" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-secondary">
                Agent Auth
              </span>
            </div>
            <div className="flex flex-col items-center gap-4">
              <FingerprintScanner active={phase !== "boot"} />
              <div className="mt-4 w-full space-y-2">
                {[
                  { label: "Encryption", done: phase !== "boot" },
                  { label: "Database", done: phase === "ready" },
                  { label: "Comms Relay", done: phase === "ready" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-[9px] uppercase text-muted-foreground">{item.label}</span>
                    {item.done ? (
                      <span className="text-[9px] font-bold uppercase text-secondary">Online</span>
                    ) : (
                      <span className="cursor-blink text-[9px] uppercase text-muted-foreground">
                        Loading...
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section: progress bar + status */}
        <div className="mt-6">
          {/* Progress bar */}
          <div className="relative h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${capped}%`,
                background: "linear-gradient(90deg, #ff3b3b, #00f5ff)",
                boxShadow: "0 0 12px rgba(0,245,255,0.4)",
              }}
            />
            {/* Moving highlight */}
            <div
              className="absolute top-0 h-full w-8 opacity-40"
              style={{
                background: "linear-gradient(90deg, transparent, #fff, transparent)",
                animation: "h-scan 1.5s linear infinite",
              }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-3 w-3 text-muted-foreground" />
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                {phase === "boot" && "Initializing secure protocols..."}
                {phase === "scan" && "Biometric scan in progress..."}
                {phase === "ready" && "All systems online. Access granted."}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Radio
                className={cn(
                  "h-3 w-3",
                  phase === "ready" ? "text-secondary" : "text-muted-foreground"
                )}
              />
              <span className="font-mono text-sm font-bold tabular-nums text-secondary">
                {capped}%
              </span>
            </div>
          </div>
        </div>

        {/* Classification footer */}
        <div className="mt-6 text-center">
          <p className="text-[8px] uppercase tracking-[0.3em] text-muted-foreground/50">
            {"// Top Secret // SCI // NOFORN // Authorized Personnel Only //"}
          </p>
        </div>
      </div>
    </div>
  );
}
