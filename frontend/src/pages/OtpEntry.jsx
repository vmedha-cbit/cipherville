import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../providers/api.js";
import { useAuth } from "../providers/authContext.jsx";
import { useTimer } from "../providers/timerContext.jsx";

export default function OtpEntry() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session, refreshSession } = useAuth(); 
  const { refreshTimer } = useTimer(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/verify-otp", { otp });
      if (data.ok) {
          // Refresh session to update otpVerified status in context
          if (refreshSession) await refreshSession();
          else if (session) session.otpVerified = true; // Fallback manual update
          
          if (refreshTimer) await refreshTimer(); // Force timer sync immediately

          // Navigate to officer assignment or last visited
          navigate(data.lastVisitedRoute || "/officer");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
       {/* Background */}
       <div className="absolute inset-0 z-0 opacity-20 fingerprint-bg"></div>
       <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/5 via-transparent to-transparent opacity-40"></div>
       
       <div className="relative z-10 w-full max-w-md bg-card border border-secondary/30 p-8 rounded-xl shadow-[0_0_30px_rgba(0,245,255,0.1)] backdrop-blur-sm animate-fadeIn">
         {/* Scanline decoration */}
         <div className="absolute inset-x-0 top-0 h-[2px] bg-secondary/50 shadow-[0_0_10px_rgba(0,245,255,0.5)]"></div>
         
         <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2 font-mono tracking-tighter">CIPHERVILLE</h1>
            <div className="h-1 w-24 bg-secondary mx-auto rounded shadow-[0_0_10px_rgba(0,245,255,0.5)]"></div>
         </div>
         
         <div className="bg-secondary/5 border border-secondary/20 p-4 rounded mb-6">
           <h2 className="text-xl font-mono text-secondary mb-2 text-center tracking-wide flex items-center justify-center gap-2">
             <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
             AUTHENTICATION REQUIRED
             <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
           </h2>
           <p className="text-muted-foreground text-center font-mono text-xs leading-relaxed">
             Security Protocol Enforced.<br/>Enter the session access code provided by your supervising officer.
           </p>
         </div>
         
         <form onSubmit={handleSubmit} className="space-y-6">
           <div className="relative group">
             <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary to-primary rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
             <input 
               type="text" 
               value={otp}
               onChange={(e) => setOtp(e.target.value)}
               placeholder="------"
               className="relative w-full bg-black/40 border border-secondary/50 text-secondary p-4 rounded text-center font-mono text-3xl tracking-[1em] focus:outline-none focus:border-secondary focus:shadow-[0_0_20px_rgba(0,245,255,0.2)] transition-all placeholder-secondary/20 uppercase"
               maxLength={6}
               disabled={loading}
             />
           </div>
           
           {error && (
               <div className="bg-destructive/10 border border-destructive/50 text-destructive text-center p-3 rounded font-mono text-xs animate-pulse">
                   ⚠ {error}
               </div>
           )}
           
           <button 
             type="submit" 
             disabled={loading}
             className="w-full bg-secondary/10 border border-secondary/50 text-secondary py-4 rounded hover:bg-secondary/20 transition-all font-mono font-bold tracking-wider hover:shadow-[0_0_15px_rgba(0,245,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed uppercase relative overflow-hidden group"
           >
             {loading ? (
               <span className="flex items-center justify-center gap-2">
                 <span className="inline-block w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin"></span>
                 VERIFYING CREDENTIALS...
               </span>
             ) : (
               <>
                 <span className="relative z-10">ACCESS SYSTEM</span>
                 <div className="absolute inset-0 h-full w-full scale-0 rounded transition-all duration-300 group-hover:scale-100 group-hover:bg-secondary/5"></div>
               </>
             )}
           </button>
         </form>
         
         <div className="mt-8 text-center border-t border-secondary/10 pt-4">
             <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                 System Version 2.0.4 • Access Level: RESTRICTED
             </p>
         </div>
       </div>
    </div>
  );
}
