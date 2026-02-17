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

  return (
    <div className="min-h-screen px-6 py-10 film-grain">
      <div className="max-w-7xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h2>
        <AdminNav />
        
        <div className="evidence-card p-5 rounded-xl flex flex-col md:flex-row md:items-center gap-3">
          <p className="text-haze">Need quick demo data?</p>
          <button className="px-6 py-3 btn-investigate text-black font-bold rounded-lg" onClick={seedDemo}>
            Insert Demo Data
          </button>
          {seedInfo?.storyId && (
            <p className="text-xs text-green-400 font-semibold">✓ Seeded Story ID: {seedInfo.storyId}</p>
          )}
        </div>

        {/* Completion Stats */}
        {data.users.length > 0 && (
          <div className="evidence-card p-6 rounded-xl">
            <h3 className="text-2xl font-bold text-amber-500 mb-4">Completion Analytics</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-black/40 p-4 rounded-lg">
                <p className="text-haze text-sm font-semibold">Completion Rate</p>
                <p className="text-3xl font-bold text-green-400 mt-2">
                  {Math.round((data.users.filter(u => u.gameStatus === 'completed' || u.phase === 'complete').length / data.users.length) * 100)}%
                </p>
                <p className="text-xs text-haze mt-2">
                  {data.users.filter(u => u.gameStatus === 'completed' || u.phase === 'complete').length} of {data.users.length} completed
                </p>
              </div>
              <div className="bg-black/40 p-4 rounded-lg">
                <p className="text-haze text-sm font-semibold">Timeout Rate</p>
                <p className="text-3xl font-bold text-red-400 mt-2">
                  {Math.round((data.users.filter(u => u.gameStatus === 'timeout').length / data.users.length) * 100)}%
                </p>
                <p className="text-xs text-haze mt-2">
                  {data.users.filter(u => u.gameStatus === 'timeout').length} of {data.users.length} timed out
                </p>
              </div>
              <div className="bg-black/40 p-4 rounded-lg">
                <p className="text-haze text-sm font-semibold">In Progress</p>
                <p className="text-3xl font-bold text-blue-400 mt-2">
                  {data.users.filter(u => u.gameStatus === 'playing').length}
                </p>
                <p className="text-xs text-haze mt-2">
                  {data.users.filter(u => u.gameStatus === 'playing').length} currently playing
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="evidence-card p-5 rounded-xl flex flex-col md:flex-row md:items-center gap-3">
          <p className="text-haze">Default Timer Duration:</p>
          <span className="text-white font-bold">{timerDuration} minutes</span>
          <button 
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500"
            onClick={() => setShowTimerModal(true)}
          >
            Change Duration
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="evidence-card p-5 rounded-xl bg-red-900/20 border-2 border-red-500">
            <p className="text-red-400 font-semibold">Error Loading Dashboard</p>
            <p className="text-red-300 text-sm mt-2">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="evidence-card p-6 rounded-xl">
            <p className="text-amber-400 font-semibold">Total Players</p>
            <p className="text-5xl font-bold text-white mt-2">{data.users.length}</p>
          </div>
          <div className="evidence-card p-6 rounded-xl">
            <p className="text-amber-400 font-semibold">Completed</p>
            <p className="text-5xl font-bold text-green-400 mt-2">{data.users.filter(u => u.gameStatus === 'completed' || u.phase === 'complete').length}</p>
          </div>
          <div className="evidence-card p-6 rounded-xl">
            <p className="text-amber-400 font-semibold">Timeout</p>
            <p className="text-5xl font-bold text-red-400 mt-2">{data.users.filter(u => u.gameStatus === 'timeout').length}</p>
          </div>
          <div className="evidence-card p-6 rounded-xl">
            <p className="text-amber-400 font-semibold">Stories</p>
            <p className="text-5xl font-bold text-white mt-2">{data.stories.length}</p>
          </div>
        </div>

        {/* Officers and Stories Summary Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="evidence-card p-6 rounded-xl flex items-center justify-between">
            <div>
               <h3 className="text-xl font-bold text-amber-500 mb-1">Officers Managed</h3>
               <p className="text-haze text-sm">Review and edit officer profiles</p>
            </div>
            <button 
              onClick={() => navigate('/admin/officers')}
              className="px-4 py-2 bg-ink border border-amber-500/30 text-amber-400 rounded hover:bg-amber-900/20 transition"
            >
              Manage Officers →
            </button>
          </div>
          
          <div className="evidence-card p-6 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-amber-500 mb-1">Stories Managed</h3>
              <p className="text-haze text-sm">Create and edit investigation stories</p>
            </div>
             <button 
              onClick={() => navigate('/admin/stories')}
              className="px-4 py-2 bg-ink border border-amber-500/30 text-amber-400 rounded hover:bg-amber-900/20 transition"
            >
              Manage Stories →
            </button>
          </div>
        </div>

        {/* Delete All Users Button */}
        <div className="evidence-card p-5 rounded-xl bg-red-900/20 border-2 border-red-600/50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-red-400 font-semibold">Danger Zone</p>
            <p className="text-red-300 text-sm">Delete all user records and start fresh</p>
          </div>
          <button
            className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 whitespace-nowrap"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete All Users
          </button>
        </div>

        {/* Participants List */}
        <div className="evidence-card p-6 rounded-xl">
          <h3 className="text-2xl font-bold text-amber-500 mb-4">Live Participant Tracking</h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <DetectiveLoading text="Tracking suspects..." />
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-3 text-amber-400 font-semibold">Roll Number</th>
                  <th className="text-left p-3 text-amber-400 font-semibold">Name</th>
                  <th className="text-left p-3 text-amber-400 font-semibold">Phase</th>
                  <th className="text-left p-3 text-amber-400 font-semibold">Timer</th>
                  <th className="text-left p-3 text-amber-400 font-semibold">Type</th>
                  <th className="text-left p-3 text-amber-400 font-semibold">Completion Time</th>
                  <th className="text-left p-3 text-amber-400 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                  {participants.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center p-6 text-haze">
                      No participants yet
                    </td>
                  </tr>
                ) : (
                  participants.map((user) => {
                    const timer = timerStatus[user._id] || { remaining: null, isExpired: false, isPanic: false };
                    const timerColor = timer.isExpired ? 'text-red-400' : timer.isPanic ? 'text-yellow-400' : 'text-green-400';
                    return (
                      <tr key={user._id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-3 text-white font-mono">{user.rollNumber}</td>
                        <td className="p-3 text-white">{user.displayName || '-'}</td>
                        <td className="p-3 text-haze">{user.phase || 'officer'}</td>
                        <td className={`p-3 font-mono font-bold ${timerColor}`}>
                          {timer.remaining !== null ? formatTime(timer.remaining) : 'N/A'}
                        </td>
                        <td className="p-3">{getStatusBadge(user)}</td>
                        <td className="p-3 text-sm text-haze">{formatCompletionTime(user.completionTime)}</td>
                        <td className="p-3">
                          <button
                            onClick={() => viewParticipantDetails(user)}
                            className="px-3 py-1 bg-amber-600 text-black font-semibold rounded hover:bg-amber-500 text-sm"
                          >
                            View Details
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
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto">
            <div className="evidence-card p-8 rounded-xl max-w-2xl w-full shadow-2xl my-6">
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-inherit z-10">
                <h3 className="text-2xl font-bold text-amber-500">
                  Participant Details: {selectedParticipant.rollNumber}
                </h3>
                <button
                  onClick={() => setSelectedParticipant(null)}
                  className="text-haze hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-black/40 p-4 rounded-lg">
                  <p className="text-amber-400 text-sm font-semibold">Basic Info</p>
                  <div className="mt-2 space-y-2">
                    <p className="text-white"><span className="text-haze">Name:</span> {selectedParticipant.displayName || 'N/A'}</p>
                    <p className="text-white"><span className="text-haze">Roll Number:</span> {selectedParticipant.rollNumber}</p>
                    <p className="text-white"><span className="text-haze">Current Phase:</span> {selectedParticipant.phase}</p>
                    <p className="text-white"><span className="text-haze">Type:</span> {getStatusBadge(selectedParticipant)}</p>
                    <p className="text-white"><span className="text-haze">Overall Completion Time:</span> {formatCompletionTime(selectedParticipant.completionTime)}</p>
                    {selectedParticipant.startedAt && (
                      <p className="text-haze text-xs">Started: {new Date(selectedParticipant.startedAt).toLocaleString()}</p>
                    )}
                    {selectedParticipant.completedAt && (
                      <p className="text-green-400 text-xs">Completed: {new Date(selectedParticipant.completedAt).toLocaleString()}</p>
                    )}
                  </div>
                </div>

                <div className="bg-black/40 p-4 rounded-lg">
                  <p className="text-amber-400 text-sm font-semibold mb-3">Progress Timeline</p>
                  {!selectedParticipant.progressTracking || selectedParticipant.progressTracking.length === 0 ? (
                    <p className="text-haze text-sm">No progress data yet</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedParticipant.progressTracking.map((progress, idx) => (
                        <div key={idx} className="bg-steel/50 p-3 rounded border-l-4 border-amber-500">
                          <p className="text-white font-semibold">{progress.subphase}</p>
                          <div className="flex gap-4 mt-1 text-sm">
                            <span className="text-green-400">⏱ Time Remaining: {formatTime(progress.timeRemaining)}</span>
                            <span className="text-blue-400">📊 Elapsed: {formatTime(progress.timeElapsed)}</span>
                          </div>
                          <p className="text-haze text-xs mt-1">
                            Completed: {new Date(progress.completedAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-black/40 p-4 rounded-lg">
                  <p className="text-amber-400 text-sm font-semibold">Attempts</p>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-haze">DB Login</p>
                      <p className="text-white font-bold">{selectedParticipant.attempts?.dbLogin || 0}</p>
                    </div>
                    <div>
                      <p className="text-haze">Case Submit</p>
                      <p className="text-white font-bold">{selectedParticipant.attempts?.caseSubmit || 0}</p>
                    </div>
                    <div>
                      <p className="text-haze">SQL Queries</p>
                      <p className="text-white font-bold">{selectedParticipant.attempts?.sqlQueries || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timer Duration Modal */}
        {showTimerModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="evidence-card p-8 rounded-xl max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-bold text-amber-500 mb-6">Set Timer Duration</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-amber-400 font-semibold">Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={timerDuration}
                    onChange={(e) => setTimerDuration(parseInt(e.target.value) || 30)}
                    className="w-full mt-2 p-3 bg-black/60 border-2 border-white/20 rounded-lg text-white font-mono text-xl focus:border-amber-500 outline-none"
                  />
                  <p className="text-haze text-xs mt-1">New users will get {timerDuration} minutes ({timerDuration * 60} seconds) to complete the game</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowTimerModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={saveTimerDuration}
                  className="flex-1 px-4 py-3 btn-investigate text-black font-bold rounded-lg"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete All Users Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="evidence-card p-8 rounded-xl max-w-md w-full shadow-2xl bg-red-900/20 border-2 border-red-600">
              <h3 className="text-2xl font-bold text-red-400 mb-4">Confirm Delete All Users</h3>
              <p className="text-haze mb-6">
                This action will permanently delete all {data.users.length} user records from the database. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteAllUsers}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700"
                >
                  Delete All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
