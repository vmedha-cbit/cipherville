import { useEffect, useState } from "react";
import api from "../providers/api.js";
import { useAuth } from "../providers/authContext.jsx";

export default function InvestigationHeader() {
  const { session, logout } = useAuth();
  const [officerName, setOfficerName] = useState(null);

  useEffect(() => {
    if (session?.userId) {
      api.post("/participants/assign-officer")
        .then(({ data }) => setOfficerName(data.officer?.name))
        .catch(err => console.error("Header fetch failed", err));
    }
  }, [session]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out? Current progress on this device will be cleared.")) {
      logout();
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-black via-steel to-black border-b border-amber-500/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent tracking-tight">
              CIPHERVILLE
            </h1>
            <p className="text-base text-haze mt-1 font-medium">
              {officerName ? (
                <span className="text-amber-300">Case Officer: <span className="font-bold text-amber-200">{officerName}</span></span>
              ) : (
                "Central Investigation Database"
              )}
            </p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
           {session?.displayName && (
             <div className="flex flex-col items-end">
               <span className="text-xs text-haze font-mono uppercase tracking-wider">Agent ID</span>
               <span className="text-lg text-white font-bold tracking-wide">{session.rollNo}</span>
             </div>
           )}
          
          <div className="flex items-center gap-3 px-4 py-2 bg-green-900/20 border border-green-500/30 rounded-full">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400 font-mono font-bold tracking-wider">ONLINE</span>
          </div>

          <button 
            onClick={handleLogout}
            className="text-sm font-bold text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400 px-5 py-2 rounded transition-all upppercase tracking-wider hover:bg-red-900/20"
          >
            LOGOUT
          </button>
        </div>
      </div>
    </div>
  );
}
