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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
       <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://media.giphy.com/media/dummy/giphy.gif')] bg-cover"></div> 
       {/* Placeholder for noise/video bg if available, otherwise just black */}
       
       <div className="relative z-10 bg-black/80 border border-green-500/30 p-8 rounded-lg max-w-md w-full backdrop-blur-md shadow-2xl shadow-green-900/20">
         <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-2 font-mono tracking-tighter">CIPHERVILLE</h1>
            <div className="h-1 w-24 bg-green-500 mx-auto rounded"></div>
         </div>
         
         <h2 className="text-xl font-mono text-green-500 mb-6 text-center tracking-wide">AUTHENTICATION REQUIRED</h2>
         <p className="text-gray-400 mb-8 text-center font-mono text-sm leading-relaxed">
           Security Protocol Enforced.<br/>Enter the session access code provided by your supervising officer.
         </p>
         
         <form onSubmit={handleSubmit} className="space-y-6">
           <div>
             <input 
               type="text" 
               value={otp}
               onChange={(e) => setOtp(e.target.value)}
               placeholder="------"
               className="w-full bg-black/50 border border-green-500/50 text-green-400 p-4 rounded text-center font-mono text-3xl tracking-[1em] focus:outline-none focus:border-green-400 focus:shadow-[0_0_20px_rgba(74,222,128,0.2)] transition-all placeholder-green-900/50"
               maxLength={6}
             />
           </div>
           
           {error && (
               <div className="bg-red-900/20 border border-red-500/50 text-red-400 text-center p-3 rounded font-mono text-xs">
                   ⚠ {error}
               </div>
           )}
           
           <button 
             type="submit" 
             disabled={loading}
             className="w-full bg-gradient-to-r from-green-900 to-emerald-900 text-green-300 border border-green-500/30 py-4 rounded hover:from-green-800 hover:to-emerald-800 transition-all font-mono font-bold tracking-wider hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {loading ? "VERIFYING..." : "ACCESS SYSTEM"}
           </button>
         </form>
         
         <div className="mt-8 text-center border-t border-green-900/30 pt-4">
             <p className="text-[10px] text-green-800 font-mono uppercase tracking-widest">
                 System Version 2.0.4 • Access Level: RESTRICTED
             </p>
         </div>
       </div>
    </div>
  );
}
