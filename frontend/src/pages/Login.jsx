import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/authContext.jsx";


export default function Login() {
  const navigate = useNavigate();
  const { login, session } = useAuth();
  const [rollNo, setRollNo] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.userId) {
      navigate("/officer");
    }
  }, [session, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      // Login is backend-driven, no localStorage needed
      const result = await login(rollNo.trim(), displayName.trim());
      if (result.status === "new-session") {
        navigate("/officer");
      } else if (result.status === "resume-session") {
        navigate(result.lastVisitedRoute || "/officer");
      } else if (result.status === "completed") {
        setError("Game already completed. Re-entry not allowed.");
      } else {
        setError("Unknown login state");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 opacity-20 fingerprint-bg"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-card text-card-foreground border border-border shadow-xl rounded-xl overflow-hidden p-8 animate-fadeIn">
          <div className="text-center mb-8">
            <div className="inline-block p-3 rounded-full bg-primary/10 mb-4 shadow-[0_0_15px_rgba(255,59,59,0.2)]">
               <div className="text-4xl">🕵️‍♂️</div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2 tracking-tighter">
              CIPHERVILLE
            </h1>
            <div className="h-1 w-20 bg-primary mx-auto mb-4 rounded-full"></div>
            <p className="text-muted-foreground text-sm font-mono tracking-widest uppercase">
              Forensic Investigation Unit
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-bold text-primary tracking-widest uppercase">Detective ID</label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all font-mono"
                placeholder="Enter your roll number"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-primary tracking-widest uppercase">Codename (Optional)</label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                placeholder="Your alias"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono rounded flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}
            
            <button 
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 tracking-wider uppercase shadow-lg shadow-primary/20"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="text-xl magnify-animate">🔍</span> Accessing...
                </span>
              ) : (
                "Initialize Case"
              )}
            </button>
          </form> 
          
          <div className="mt-6 pt-6 border-t border-border text-center">
             <p className="text-[10px] text-muted-foreground font-mono">
               SECURE CONNECTION ESTABLISHED • V2.0.5
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
