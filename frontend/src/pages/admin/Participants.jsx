import { useEffect, useState } from "react";
import api from "../../providers/api.js";
import AdminNav from "../../components/AdminNav.jsx";
import DetectiveLoading from "../../components/DetectiveLoading.jsx";

export default function Participants() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [timerStatus, setTimerStatus] = useState({});

  useEffect(() => {
    const load = async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const token = localStorage.getItem("cipherville-admin-token");
        if (token) api.defaults.headers.Authorization = `Bearer ${token}`;
        
        const { data } = await api.get("/admin/dashboard");
        setParticipants(data.users || []);
      } catch (err) {
        console.error("Failed to load participants:", err);
      } finally {
        if (!silent) setLoading(false);
      }
    };
    load();

    const interval = setInterval(() => {
        load(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Sort participants: Completed (fastest first) -> Playing -> Others
  const sortedParticipants = [...participants].sort((a, b) => {
      // If both completed, sort by completionTime
      if (a.completionTime && b.completionTime) return a.completionTime - b.completionTime;
      // If a completed, comes first
      if (a.completionTime) return -1;
      if (b.completionTime) return 1;
      // If both playing, sort by startedAt (earliest first)
      return new Date(a.startedAt || 0) - new Date(b.startedAt || 0);
  });

  const handleDelete = async (e, userId) => {
      e.stopPropagation();
      if (!window.confirm("Delete this user permanently? This cannot be undone.")) return;
      try {
          await api.delete(`/admin/users/${userId}`);
          setParticipants(prev => prev.filter(p => p._id !== userId));
      } catch (err) {
          console.error("Delete failed:", err);
          alert("Failed to delete user");
      }
  };

  const formatTime = (seconds) => {
    if (seconds == null) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCompletionTime = (milliseconds) => {
    if (!milliseconds || milliseconds <= 0) return 'N/A';
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getStatusBadge = (user) => {
    if (user.gameStatus === 'timeout') return <span className="bg-red-900/30 text-red-400 px-2 py-1 rounded text-xs font-bold">TIMEOUT</span>;
    if (user.gameStatus === 'completed') return <span className="bg-green-900/30 text-green-400 px-2 py-1 rounded text-xs font-bold">COMPLETED</span>;
    return <span className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded text-xs font-bold">PLAYING</span>;
  };

  // ... (rest of logic) ...

  return (
    <div className="min-h-screen px-6 py-10 film-grain">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ... Header ... */}
        {/* ... Loading ... */}
        
        {!loading && (
          <div className="evidence-card p-6 rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-3 text-amber-400 font-semibold">Roll No</th>
                    <th className="text-left p-3 text-amber-400 font-semibold">Name</th>
                    <th className="text-left p-3 text-amber-400 font-semibold">Status</th>
                    <th className="text-left p-3 text-amber-400 font-semibold">Phase</th>
                    <th className="text-left p-3 text-amber-400 font-semibold">Time</th>
                    <th className="text-right p-3 text-amber-400 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedParticipants.map((user) => (
                    <tr 
                        key={user._id} 
                        className="border-b border-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                        onClick={() => setSelectedParticipant(user)}
                    >
                      <td className="p-3 text-white font-mono font-bold">{user.rollNo || user.rollNumber}</td>
                      <td className="p-3 text-white">{user.displayName || '-'}</td>
                      <td className="p-3">{getStatusBadge(user)}</td>
                      <td className="p-3 text-haze">{user.phase}</td>
                      <td className="p-3 text-emerald-400 font-mono">
                          {formatCompletionTime(user.completionTime)}
                      </td>
                      <td className="p-3 text-right">
                          <button 
                             onClick={(e) => handleDelete(e, user._id)}
                             className="text-red-400 hover:text-red-300 hover:bg-red-900/30 px-3 py-1 rounded text-xs font-bold border border-red-500/30"
                          >
                            DELETE
                          </button>
                      </td>
                    </tr>
                  ))}
                  {participants.length === 0 && (
                      <tr><td colSpan="6" className="p-6 text-center text-haze">No participants data found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* DETAILS MODAL */}
        {selectedParticipant && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto">
            <div className="evidence-card p-8 rounded-xl max-w-2xl w-full shadow-2xl my-6 animate-fadeIn">
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-inherit z-10 border-b border-white/10 pb-4">
                <div>
                    <h3 className="text-2xl font-bold text-amber-500">
                    Suspect File: {selectedParticipant.rollNo || selectedParticipant.rollNumber}
                    </h3>
                    <p className="text-haze text-sm mt-1">{selectedParticipant.displayName}</p>
                </div>
                <button
                  onClick={() => setSelectedParticipant(null)}
                  className="text-haze hover:text-white text-3xl font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 p-4 rounded-lg">
                        <p className="text-haze text-xs uppercase tracking-wider mb-1">Status</p>
                        <p className="text-lg">{getStatusBadge(selectedParticipant)}</p>
                    </div>
                    <div className="bg-black/40 p-4 rounded-lg">
                        <p className="text-haze text-xs uppercase tracking-wider mb-1">Time To Solve</p>
                        <p className="text-lg font-mono text-emerald-400">{formatCompletionTime(selectedParticipant.completionTime)}</p>
                    </div>
                    <div className="bg-black/40 p-4 rounded-lg">
                        <p className="text-haze text-xs uppercase tracking-wider mb-1">Started</p>
                        <p className="text-sm text-white">{selectedParticipant.startedAt ? new Date(selectedParticipant.startedAt).toLocaleTimeString() : 'N/A'}</p>
                    </div>
                     <div className="bg-black/40 p-4 rounded-lg">
                        <p className="text-haze text-xs uppercase tracking-wider mb-1">Completed</p>
                        <p className="text-sm text-white">{selectedParticipant.completedAt ? new Date(selectedParticipant.completedAt).toLocaleTimeString() : 'N/A'}</p>
                    </div>
                </div>

                <div className="bg-black/40 p-5 rounded-lg border border-white/5">
                  <p className="text-amber-400 text-sm font-semibold mb-3 uppercase tracking-wider border-b border-white/10 pb-2">Investigation Timeline</p>
                  {!selectedParticipant.progressTracking || selectedParticipant.progressTracking.length === 0 ? (
                    <p className="text-haze text-sm italic">No timeline data recorded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedParticipant.progressTracking.map((progress, idx) => (
                        <div key={idx} className="flex gap-4 items-start">
                            <div className="flex flex-col items-center">
                                <div className="w-3 h-3 rounded-full bg-amber-500 mt-1.5"></div>
                                {idx < selectedParticipant.progressTracking.length - 1 && <div className="w-0.5 h-full bg-white/10 my-1"></div>}
                            </div>
                            <div className="bg-steel/30 p-3 rounded flex-1 hover:bg-steel/50 transition">
                                <p className="text-white font-semibold text-sm">{progress.subphase}</p>
                                <div className="flex justify-between mt-1 text-xs text-haze">
                                    <span>Time: {new Date(progress.completedAt).toLocaleTimeString()}</span>
                                    <span className="font-mono text-blue-300">Elapsed: {formatTime(progress.timeElapsed)}</span>
                                </div>
                            </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-black/40 p-4 rounded-lg">
                  <p className="text-amber-400 text-sm font-semibold mb-2 uppercase tracking-wider">Metrics</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-white/5 rounded">
                      <p className="text-2xl font-bold text-white">{selectedParticipant.attempts?.dbLogin || 0}</p>
                      <p className="text-xs text-haze">DB Logins</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded">
                      <p className="text-2xl font-bold text-white">{selectedParticipant.attempts?.caseSubmit || 0}</p>
                      <p className="text-xs text-haze">Case Submits</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded">
                      <p className="text-2xl font-bold text-white">{selectedParticipant.attempts?.sqlQueries || 0}</p>
                      <p className="text-xs text-haze">Queries</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
