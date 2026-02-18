import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../providers/api.js";
import DetectiveLoading from "../components/DetectiveLoading.jsx";

export default function Officer() {
  const navigate = useNavigate();
  const [officer, setOfficer] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  // Format time as HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Load officer data on mount
  useEffect(() => {
    const loadOfficer = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.post("/participants/assign-officer");
        setOfficer(data.officer);
        setError("");

        // Update progress after loading officer
        await api.post("/participants/progress/update", {
          currentPhase: 1,
          currentSubphase: 1,
          lastVisitedRoute: "/officer"
        });
      } catch (err) {
        console.error("Failed to load officer:", err);
        setError(err.response?.data?.error || "Failed to load officer");
        setOfficer(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadOfficer();
  }, []);

  // Handle navigation to Database Login
  const handleBeginInvestigation = async () => {
    if (isNavigating) return; // Prevent double-click
    
    try {
      setIsNavigating(true);
      console.log("Updating progress for db-login...");
      
      // Update backend progress FIRST
      await api.post("/participants/progress/update", {
        currentPhase: 1,
        currentSubphase: 0,
        lastVisitedRoute: "/db-login"
      });
      
      console.log("Progress updated - navigating to db-login");
      // Then navigate
      navigate("/db-login", { replace: true });
    } catch (err) {
      console.error("Navigation error:", err);
      setError("Failed to proceed. Please try again.");
      setIsNavigating(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background flex items-center justify-center p-6">
      <div className="absolute inset-0 z-0 opacity-10 fingerprint-bg"></div>
      <div className="absolute inset-0 z-0 grid-overlay opacity-20"></div>
      
      {/* Global Loader for this page */}
      <DetectiveLoading isLoading={isLoading} />
      
      {/* Header handled by App layout usually but just in case */}
      
      <div className="max-w-4xl w-full relative z-10">
          {/* Loading State - Removed manual block as DetectiveLoading handles it */}
          
          {/* Error State */}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-destructive/10 border border-destructive/50 p-8 rounded-xl text-center backdrop-blur-sm">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-destructive mb-2">ACCESS DENIED</h3>
              <p className="text-destructive-foreground mb-6 font-mono">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md font-bold tracking-wide transition-all shadow-lg shadow-destructive/20"
              >
                RETRY CONNECTION
              </button>
            </div>
          )}

          {/* Officer Welcome Card */}
          {officer && !isLoading && (
            <div className="bg-card border border-border rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fadeIn relative overflow-hidden group">
               {/* Decorative elements */}
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
               <div className="absolute -left-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-1000"></div>
               
               <div className="p-8 md:p-12 relative z-10">
                   <div className="flex items-center justify-between mb-8 border-b border-border pb-6">
                       <div>
                           <div className="flex items-center gap-2 mb-1">
                               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                               <span className="text-xs font-mono text-muted-foreground tracking-widest uppercase">Encryption: AES-256 • Verified</span>
                           </div>
                           <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                             WELCOME TO <span className="text-primary tracking-tight">CIPHERVILLE</span>
                           </h1>
                       </div>
                       <div className="hidden md:block opacity-20">
                           <div className="text-6xl">🕵️‍♀️</div>
                       </div>
                   </div>

                   <p className="text-xl text-muted-foreground mb-8 italic font-light">
                     "The truth is rarely pure and never simple."
                   </p>
                   
                   {/* Officer Story */}
                   <div className="bg-muted/30 border-l-4 border-secondary p-6 md:p-8 rounded-r-lg mb-10 relative overflow-hidden">
                     <div className="absolute right-0 top-0 text-9xl opacity-5 pointer-events-none select-none">?</div>
                     
                     <div className="flex items-start gap-4">
                         <div className="mt-1 min-w-[24px]">📁</div>
                         <div>
                             <h2 className="text-lg font-bold text-foreground mb-3 font-mono uppercase tracking-wide border-b border-border/50 inline-block pb-1">Case Briefing</h2>
                             <p className="text-muted-foreground leading-relaxed text-lg">
                               A top-tier investigator, <strong className="text-secondary font-bold font-mono px-1 bg-secondary/10 rounded">{officer.name}</strong>, assigned to the <span className="text-foreground font-semibold">Shadow Circuit</span> case, has been listed as <span className="text-destructive font-bold">MISSING IN ACTION</span> for the last 10 days.
                             </p>
                             <div className="mt-4 p-4 bg-background/50 rounded border border-border text-foreground/90">
                                <p className="leading-relaxed">
                                   Department protocols have initiated a prioritized search. You have been selected to pick up the trail, uncover hidden evidence, and bring the truth to light.
                                </p>
                             </div>
                             <p className="text-primary font-bold mt-6 text-xl tracking-wide flex items-center gap-2">
                               <span>⚡</span> The investigation depends on you. Good luck.
                             </p>
                         </div>
                     </div>
                   </div>

                   {/* Begin Investigation Button */}
                   <div className="flex justify-center">
                       <div className="relative group/btn w-full md:w-auto">
                           <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-25 group-hover/btn:opacity-75 transition duration-1000 group-hover/btn:duration-200"></div>
                           <button
                             type="button"
                             onClick={handleBeginInvestigation}
                             disabled={isNavigating}
                             className={`relative w-full md:w-auto min-w-[300px] px-8 py-5 bg-card hover:bg-muted/80 text-foreground border border-primary/30 rounded-lg transition-all font-bold text-lg tracking-widest uppercase flex items-center justify-center gap-3 overflow-hidden ${
                               isNavigating ? 'opacity-70 cursor-wait' : ''
                             }`}
                           >
                             {isNavigating ? (
                               <>
                                 <span className="animate-spin text-2xl">⏳</span> INITIALIZING...
                               </>
                             ) : (
                               <>
                                 <span className="text-primary text-2xl">🚨</span> BEGIN INVESTIGATION
                               </>
                             )}
                             {!isNavigating && <div className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-300 w-0 group-hover/btn:w-full"></div>}
                           </button>
                       </div>
                   </div>
               </div>
               
               {/* Footer in card */}
               <div className="bg-muted/20 p-4 text-center border-t border-border">
                   <p className="text-[10px] text-muted-foreground font-mono uppercase">
                       Confidentiality Agreement Active • Unauthorized access is a federal offense
                   </p>
               </div>
            </div>
          )}
      </div>
    </div>
  );
}
