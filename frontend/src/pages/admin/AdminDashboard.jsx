import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../providers/api.js";
import AdminNav from "../../components/AdminNav.jsx";
import DetectiveLoading from "../../components/DetectiveLoading.jsx";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({ users: [], stories: [], officers: [] });
  const [seedInfo, setSeedInfo] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [timerDuration, setTimerDuration] = useState(30); // in minutes
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [timerStatus, setTimerStatus] = useState({}); // { userId: { remaining, status } }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        setError(null);
        
        // Load admin token from localStorage and set it on api
        const token = localStorage.getItem("cipherville-admin-token");
        if (!token) {
          navigate("/admin/login");
          return;
        }
        api.defaults.headers.Authorization = `Bearer ${token}`;
        
        const { data } = await api.get("/admin/dashboard");
        // Only update if data changed (simple check) or just update always since react handles diffs well
        // Ideally deep compare or similar but for now direct set is fine, React won't re-render excessively if props same
        setData(data);
        setParticipants(data.users || []);
        
        // Load timer duration on initial load only
        if (!silent) {
          try {
            const { data: timerData } = await api.get("/admin/timer-duration");
            setTimerDuration(Math.floor(timerData.timerDuration / 60)); // Convert to minutes
          } catch (err) {
            console.error("Failed to load timer duration:", err);
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        // Redirect to login on 401 Unauthorized
        if (err.response?.status === 401) {
          localStorage.removeItem("cipherville-admin-token");
          navigate("/admin/login");
        }
        if (!silent) setError(err.message || "Failed to load dashboard data");
      } finally {
        if (!silent) setLoading(false);
      }
    };
    load(false);
    
    // Refresh dashboard data every 2 seconds to update timer status (SILENTLY)
    const interval = setInterval(() => {
      load(true);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Calculate timer status from participants data
  useEffect(() => {
    const status = {};
    participants.forEach((user) => {
      if (user.timeRemaining !== null && user.timeRemaining !== undefined) {
        status[user._id] = {
          remaining: user.timeRemaining,
          isExpired: user.isExpired || false,
          isPanic: user.isPanic || false
        };
      } else {
        status[user._id] = {
          remaining: null,
          isExpired: false,
          isPanic: false
        };
      }
    });
    setTimerStatus(status);
  }, [participants]);

  const seedDemo = async () => {
    try {
      const { data } = await api.post("/admin/seed");
      setSeedInfo(data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("cipherville-admin-token");
        navigate("/admin/login");
      }
      alert("Failed to seed demo data: " + (err.response?.data?.error || err.message));
    }
  };

  const getStatusBadge = (user) => {
    if (user.gameStatus === 'timeout' || user.completionType === 'timeout') {
      return <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded-full text-xs font-bold">TIMEOUT</span>;
    }
    if (user.gameStatus === 'completed' || user.completionType === 'completed') {
      return <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded-full text-xs font-bold">✓ COMPLETED</span>;
    }
    if (user.completionType === 'in-progress') {
      return <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded-full text-xs font-bold">PLAYING</span>;
    }
    return <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded-full text-xs font-bold">PARTIAL</span>;
  };

  const formatCompletionTime = (milliseconds) => {
    if (!milliseconds || milliseconds <= 0) return 'N/A';
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const saveTimerDuration = async () => {
    try {
      await api.post("/admin/timer-duration", { timerDuration: timerDuration * 60 }); // Convert to seconds
      setShowTimerModal(false);
      alert(`Timer duration set to ${timerDuration} minutes. This will apply to all new users.`);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("cipherville-admin-token");
        navigate("/admin/login");
      }
      console.error("Failed to save timer duration:", err);
      alert("Failed to save timer duration: " + (err.response?.data?.error || err.message));
    }
  };

  const viewParticipantDetails = (user) => {
    setSelectedParticipant(user);
  };

  const deleteAllUsers = async () => {
    try {
      const result = await api.delete("/admin/users/all");
      alert(result.data.message);
      setShowDeleteModal(false);
      // Reload dashboard
      const token = localStorage.getItem("cipherville-admin-token");
      if (token) {
        api.defaults.headers.Authorization = `Bearer ${token}`;
      }
      const { data } = await api.get("/admin/dashboard");
      setData(data);
      setParticipants(data.users || []);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("cipherville-admin-token");
        navigate("/admin/login");
      }
      alert("Failed to delete users: " + (err.response?.data?.error || err.message));
    }
  };

  const logoutAllUsers = async () => {
    try {
      if (!window.confirm("Are you sure you want to log out ALL users? They will be redirected to the login page immediately.")) {
        return;
      }
      const { data } = await api.post("/admin/logout-all");
      alert(data.message);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("cipherville-admin-token");
        navigate("/admin/login");
      }
      alert("Failed to logout users: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background p-6">
      <div className="absolute inset-0 z-0 opacity-10 fingerprint-bg"></div>
      <div className="absolute inset-0 z-0 grid-overlay opacity-20"></div>

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <header className="flex items-center justify-between border-b border-border pb-6">
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            Admin <span className="text-primary">Command Center</span>
          </h2>
          <div className="text-xs font-mono text-muted-foreground bg-muted/50 px-3 py-1 rounded">
             SYS.ADMIN.V2
          </div>
        </header>

        <AdminNav />
        
        {/* Seed Data Panel */}
        <div className="bg-card border border-border p-6 rounded-xl flex flex-col md:flex-row md:items-center gap-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="flex-1">
             <h3 className="font-bold text-foreground">Demo Data Injection</h3>
             <p className="text-muted-foreground text-sm">Need quick data for testing?</p>
          </div>
          <button 
             className="px-6 py-2 bg-secondary/10 border border-secondary/50 text-secondary hover:bg-secondary/20 rounded font-mono text-sm font-bold uppercase transition-all" 
             onClick={seedDemo}
          >
            Insert Demo Data
          </button>
          {seedInfo?.storyId && (
            <p className="text-xs text-green-500 font-mono flex items-center gap-1">
              <span>✓</span> Seeded: {seedInfo.storyId}
            </p>
          )}
        </div>

        {/* Completion Stats */}
        {data.users.length > 0 && (
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full"></span>
              Analytics Overview
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-muted/30 p-5 rounded-lg border border-border/50">
                <p className="text-muted-foreground text-xs font-mono uppercase tracking-wider">Completion Rate</p>
                <div className="flex items-end gap-2 mt-2">
                  <p className="text-4xl font-bold text-green-500">
                    {Math.round((data.users.filter(u => u.gameStatus === 'completed' || u.phase === 'complete').length / data.users.length) * 100)}%
                  </p>
                </div>
                <div className="w-full bg-background h-1 mt-3 rounded-full overflow-hidden">
                   <div className="h-full bg-green-500" style={{ width: `${(data.users.filter(u => u.gameStatus === 'completed' || u.phase === 'complete').length / data.users.length) * 100}%` }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {data.users.filter(u => u.gameStatus === 'completed' || u.phase === 'complete').length} / {data.users.length} agents
                </p>
              </div>

              <div className="bg-muted/30 p-5 rounded-lg border border-border/50">
                <p className="text-muted-foreground text-xs font-mono uppercase tracking-wider">Timeout Rate</p>
                 <div className="flex items-end gap-2 mt-2">
                  <p className="text-4xl font-bold text-destructive">
                    {Math.round((data.users.filter(u => u.gameStatus === 'timeout').length / data.users.length) * 100)}%
                  </p>
                </div>
                 <div className="w-full bg-background h-1 mt-3 rounded-full overflow-hidden">
                   <div className="h-full bg-destructive" style={{ width: `${(data.users.filter(u => u.gameStatus === 'timeout').length / data.users.length) * 100}%` }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {data.users.filter(u => u.gameStatus === 'timeout').length} / {data.users.length} agents
                </p>
              </div>

              <div className="bg-muted/30 p-5 rounded-lg border border-border/50">
                <p className="text-muted-foreground text-xs font-mono uppercase tracking-wider">Active Investigators</p>
                 <div className="flex items-end gap-2 mt-2">
                  <p className="text-4xl font-bold text-secondary">
                    {data.users.filter(u => u.gameStatus === 'playing').length}
                  </p>
                </div>
                 <div className="w-full bg-background h-1 mt-3 rounded-full overflow-hidden">
                   <div className="h-full bg-secondary animate-pulse" style={{ width: '100%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                   Currently in field
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Controls Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border border-border p-6 rounded-xl flex flex-col justify-between gap-4">
            <div>
               <p className="text-muted-foreground text-sm font-mono uppercase">Global Timer Configuration</p>
               <div className="flex items-baseline gap-2 mt-1">
                 <span className="text-foreground font-bold text-3xl">{timerDuration}</span>
                 <span className="text-muted-foreground text-sm">minutes</span>
               </div>
            </div>
            <button 
              className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition shadow-lg shadow-primary/20"
              onClick={() => setShowTimerModal(true)}
            >
              Adjust Duration
            </button>
          </div>
          
          <div className="bg-card border border-border p-6 rounded-xl flex flex-col gap-4">
             <div>
               <p className="text-muted-foreground text-sm font-mono uppercase">Session Access Code (OTP)</p>
               <div className="flex items-center gap-3 mt-2">
                  <div className="bg-muted px-4 py-2 rounded text-secondary font-mono font-bold text-2xl tracking-[0.2em] border border-secondary/20 shadow-[0_0_10px_rgba(0,245,255,0.1)]">
                      {data.currentOtp || "------"}
                  </div>
                  <button 
                    onClick={async () => {
                        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
                        if (window.confirm(`Generate new OTP: ${newOtp}? This will update the access code for all new logins.`)) {
                            try {
                                await api.post("/admin/otp", { otp: newOtp });
                                setData(prev => ({ ...prev, currentOtp: newOtp }));
                            } catch (err) {
                                alert("Failed to update OTP");
                            }
                        }
                    }}
                    className="p-3 bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-lg border border-secondary/30 transition-all"
                    title="Regenerate OTP"
                  >
                    ↻
                  </button>
               </div>
             </div>
             <p className="text-xs text-muted-foreground">Required for investigator authentication.</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/50 p-6 rounded-xl flex items-start gap-4">
            <span className="text-2xl">⚠️</span>
            <div>
               <p className="text-destructive font-bold">System Error</p>
               <p className="text-destructive-foreground text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Overall Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-6 rounded-xl relative overflow-hidden">
             <div className="absolute right-2 top-2 text-primary/10 text-6xl font-bold -z-0">#</div>
            <p className="text-muted-foreground text-xs font-mono uppercase">Total Records</p>
            <p className="text-4xl font-bold text-foreground mt-1 relative z-10">{data.users.length}</p>
          </div>
          <div className="bg-card border border-border p-6 rounded-xl">
            <p className="text-muted-foreground text-xs font-mono uppercase">Success Cases</p>
            <p className="text-4xl font-bold text-green-500 mt-1">{data.users.filter(u => u.gameStatus === 'completed' || u.phase === 'complete').length}</p>
          </div>
          <div className="bg-card border border-border p-6 rounded-xl">
            <p className="text-muted-foreground text-xs font-mono uppercase">Cold Cases (Timeout)</p>
            <p className="text-4xl font-bold text-destructive mt-1">{data.users.filter(u => u.gameStatus === 'timeout').length}</p>
          </div>
          <div className="bg-card border border-border p-6 rounded-xl">
            <p className="text-muted-foreground text-xs font-mono uppercase">Database Size (Stories)</p>
            <p className="text-4xl font-bold text-foreground mt-1">{data.stories.length}</p>
          </div>
        </div>

        {/* Management Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border border-border p-6 rounded-xl flex items-center justify-between hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => navigate('/admin/officers')}>
            <div>
               <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">Officer Management</h3>
               <p className="text-muted-foreground text-xs mt-1">Personnel files & assignments</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">→</div>
          </div>
          
          <div className="bg-card border border-border p-6 rounded-xl flex items-center justify-between hover:border-secondary/50 transition-colors cursor-pointer group" onClick={() => navigate('/admin/stories')}>
            <div>
              <h3 className="text-lg font-bold text-foreground group-hover:text-secondary transition-colors">Case Files (Stories)</h3>
              <p className="text-muted-foreground text-xs mt-1">Manage investigation narratives</p>
            </div>
             <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground transition-all">→</div>
          </div>
        </div>

        {/* Danger Zones */}
        <div className="grid md:grid-cols-2 gap-6">
           {/* Delete All */}
           <div className="bg-destructive/5 border border-destructive/30 p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
                <p className="text-destructive font-bold flex items-center gap-2">
                   <span>☢</span> DATABASE RESET
                </p>
                <p className="text-destructive-foreground/70 text-sm mt-1">Purge all participant records</p>
             </div>
             <button
               className="px-6 py-2 bg-destructive text-destructive-foreground font-bold rounded hover:bg-destructive/90 transition shadow-lg shadow-destructive/20 text-sm"
               onClick={() => setShowDeleteModal(true)}
             >
               EXECUTE PURGE
             </button>
           </div>
           
           {/* Logout All */}
           <div className="bg-orange-500/5 border border-orange-500/30 p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
                 <p className="text-orange-500 font-bold flex items-center gap-2">
                    <span>⚡</span> SESSION OVERRIDE
                 </p>
                 <p className="text-orange-500/70 text-sm mt-1">Terminate all active connections</p>
             </div>
             <button
                 className="px-6 py-2 bg-orange-600 text-white font-bold rounded hover:bg-orange-700 transition shadow-lg shadow-orange-500/20 text-sm"
                 onClick={logoutAllUsers}
             >
                 FORCE LOGOUT
             </button>
           </div>
        </div>

        {/* Participants Table */}
        <div className="bg-card border border-border rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-foreground">Live Surveillance</h3>
            {loading ? (
               <div className="text-secondary text-sm font-mono animate-pulse">Scanning network...</div>
            ) : (
                <div className="text-muted-foreground text-xs font-mono">{participants.length} Active Signals</div>
            )}
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20 flex-col items-center">
               <div className="text-4xl mb-4 magnify-animate text-secondary">🔍</div>
               <p className="text-muted-foreground font-mono text-sm">Retrieving data streams...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground uppercase font-mono text-xs">
                <tr>
                  <th className="p-4 text-left font-semibold">Roll Number</th>
                  <th className="p-4 text-left font-semibold">Codename</th>
                  <th className="p-4 text-left font-semibold">Phase</th>
                  <th className="p-4 text-left font-semibold">Timer</th>
                  <th className="p-4 text-left font-semibold">Status</th>
                  <th className="p-4 text-left font-semibold">Duration</th>
                  <th className="p-4 text-left font-semibold">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                  {participants.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center p-12 text-muted-foreground">
                       No active signatures detected.
                    </td>
                  </tr>
                ) : (
                  participants.map((user) => {
                    const timer = timerStatus[user._id] || { remaining: null, isExpired: false, isPanic: false };
                    const timerColor = timer.isExpired ? 'text-destructive' : timer.isPanic ? 'text-orange-400' : 'text-green-400';
                    return (
                      <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-mono font-bold text-primary">{user.rollNo || user.rollNumber}</td>
                        <td className="p-4 text-foreground">{user.displayName || '-'}</td>
                        <td className="p-4 text-muted-foreground font-mono text-xs uppercase">{user.phase || 'officer'}</td>
                        <td className={`p-4 font-mono font-bold ${timerColor}`}>
                          {timer.remaining !== null ? formatTime(timer.remaining) : '--:--'}
                        </td>
                        <td className="p-4">{getStatusBadge(user)}</td>
                        <td className="p-4 text-muted-foreground font-mono">{formatCompletionTime(user.completionTime)}</td>
                        <td className="p-4">
                          <button
                            onClick={() => viewParticipantDetails(user)}
                            className="px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded hover:bg-secondary/20 font-bold text-xs uppercase tracking-wide transition-all"
                          >
                            Investigate
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            </div>
          )}
        </div>

        {/* Participant Details Modal */}
        {selectedParticipant && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto">
            <div className="bg-card border border-border p-0 rounded-xl max-w-2xl w-full shadow-2xl my-6 flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-card z-10 rounded-t-xl">
                <div>
                   <h3 className="text-2xl font-bold text-foreground">
                     Subject Profile
                   </h3>
                   <p className="text-primary font-mono text-lg font-bold mt-1">
                     {selectedParticipant.rollNo || selectedParticipant.rollNumber}
                   </p>
                </div>
                <button
                  onClick={() => setSelectedParticipant(null)}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-destructive hover:text-white transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="bg-muted/20 p-4 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-3">Identity Verification</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="text-foreground font-semibold">{selectedParticipant.displayName || 'Unknown'}</p>
                    </div>
                     <div>
                        <p className="text-xs text-muted-foreground">ID</p>
                        <p className="text-foreground font-semibold font-mono">{selectedParticipant.rollNo || selectedParticipant.rollNumber}</p>
                    </div>
                     <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <div className="mt-1">{getStatusBadge(selectedParticipant)}</div>
                    </div>
                     <div>
                        <p className="text-xs text-muted-foreground">Total Time</p>
                        <p className="text-foreground font-mono">{formatCompletionTime(selectedParticipant.completionTime)}</p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                   <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
                   <div className="space-y-6 ml-4">
                      
                      {/* Timeline Items */}
                      {!selectedParticipant.progressTracking || selectedParticipant.progressTracking.length === 0 ? (
                        <p className="text-muted-foreground text-sm italic pl-6">No activity recorded.</p>
                      ) : (
                         selectedParticipant.progressTracking.map((progress, idx) => (
                           <div key={idx} className="relative pl-6">
                              <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background z-10"></div>
                              <div className="bg-card border border-border p-3 rounded shadow-sm">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-foreground text-sm">Phase {progress.subphase}</h4>
                                    <span className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded">
                                       {new Date(progress.completedAt).toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className="flex gap-4 mt-2 text-xs font-mono">
                                    <span className="text-green-500">Remaining: {formatTime(progress.timeRemaining)}</span>
                                    <span className="text-blue-500">Elapsed: {formatTime(progress.timeElapsed)}</span>
                                </div>
                              </div>
                           </div>
                         ))
                      )}
                      
                   </div>
                </div>

                <div className="bg-muted/20 p-4 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-3">System Interactions (Attempts)</p>
                  <div className="grid grid-cols-3 gap-2 text-sm text-center">
                    <div className="bg-background p-3 rounded border border-border">
                      <p className="text-xs text-muted-foreground mb-1">DB Access</p>
                      <p className="text-xl font-bold text-primary">{selectedParticipant.attempts?.dbLogin || 0}</p>
                    </div>
                    <div className="bg-background p-3 rounded border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Submissions</p>
                      <p className="text-xl font-bold text-primary">{selectedParticipant.attempts?.caseSubmit || 0}</p>
                    </div>
                    <div className="bg-background p-3 rounded border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Queries</p>
                      <p className="text-xl font-bold text-primary">{selectedParticipant.attempts?.sqlQueries || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timer Duration Modal */}
        {showTimerModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fadeIn">
            <div className="bg-card border border-border p-8 rounded-xl max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-bold text-foreground mb-6">Global Timer Policy</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-primary font-bold uppercase tracking-wider">Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={timerDuration}
                    onChange={(e) => setTimerDuration(parseInt(e.target.value) || 30)}
                    className="w-full mt-2 p-3 bg-muted/50 border border-input rounded-lg text-foreground font-mono text-xl focus:border-primary outline-none focus:ring-1 focus:ring-primary"
                  />
                  <p className="text-muted-foreground text-xs mt-2">
                     <span className="text-primary">*</span> Applies to all NEW investigation sessions initiated after save.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowTimerModal(false)}
                  className="flex-1 px-4 py-3 bg-muted text-foreground font-bold rounded-lg hover:bg-muted/80 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveTimerDuration}
                  className="flex-1 px-4 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 transition"
                >
                  Confirm Policy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete All Users Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fadeIn">
            <div className="bg-destructive/10 border-2 border-destructive p-8 rounded-xl max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.2)]">
              <div className="text-center mb-6">
                 <div className="text-5xl mb-4">☢</div>
                 <h3 className="text-2xl font-bold text-destructive uppercase tracking-widest">Critical Warning</h3>
              </div>
              <p className="text-destructive-foreground text-center mb-8 font-medium">
                You are about to execute a <span className="font-bold underline">complete database purge</span>. All {data.users.length} user records will be permanently erased.
                <br/><br/>
                This action is irreversible.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 bg-background border border-border text-foreground font-bold rounded-lg hover:bg-muted transition"
                >
                  ABORT
                </button>
                <button
                  onClick={deleteAllUsers}
                  className="flex-1 px-4 py-3 bg-destructive text-destructive-foreground font-bold rounded-lg hover:bg-destructive/90 shadow-lg shadow-destructive/20 transition animate-pulse"
                >
                  CONFIRM PURGE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
