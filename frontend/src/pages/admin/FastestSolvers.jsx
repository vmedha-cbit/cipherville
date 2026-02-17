import { useEffect, useState } from "react";
import api from "../../providers/api.js";
import AdminNav from "../../components/AdminNav.jsx";

const applyAdminToken = () => {
  // Token is managed by api.js, not localStorage
  if (token) {
    api.defaults.headers.Authorization = `Bearer ${token}`;
  }
};

export default function FastestSolvers() {
  const [solvers, setSolvers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      applyAdminToken();
      try {
        const { data } = await api.get("/admin/fastest-solvers");
        setSolvers(data.solvers || []);
      } catch (err) {
        console.error("Failed to load fastest solvers:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatCompletionTime = (milliseconds) => {
    if (!milliseconds) return "N/A";
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="min-h-screen px-6 py-10 film-grain">
      <AdminNav />
      <div className="max-w-7xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
          Fastest Solvers
        </h2>

        {loading ? (
          <div className="evidence-card p-8 text-center">
            <p className="text-haze">Loading fastest solvers...</p>
          </div>
        ) : solvers.length === 0 ? (
          <div className="evidence-card p-8 text-center">
            <p className="text-haze">No completed games yet.</p>
          </div>
        ) : (
          <div className="evidence-card p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 text-amber-400 font-semibold">Rank</th>
                    <th className="text-left py-3 px-4 text-amber-400 font-semibold">Roll Number</th>
                    <th className="text-left py-3 px-4 text-amber-400 font-semibold">Display Name</th>
                    <th className="text-left py-3 px-4 text-amber-400 font-semibold">Story</th>
                    <th className="text-left py-3 px-4 text-amber-400 font-semibold">Completion Time</th>
                    <th className="text-left py-3 px-4 text-amber-400 font-semibold">Completed At</th>
                  </tr>
                </thead>
                <tbody>
                  {solvers.map((solver, index) => (
                    <tr key={solver._id} className="border-b border-white/10 hover:bg-white/5 transition">
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                          index === 0 ? "bg-yellow-500/20 text-yellow-400" :
                          index === 1 ? "bg-gray-400/20 text-gray-300" :
                          index === 2 ? "bg-amber-600/20 text-amber-400" :
                          "bg-steel/50 text-haze"
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white font-mono">{solver.rollNumber}</td>
                      <td className="py-3 px-4 text-haze">{solver.displayName || "N/A"}</td>
                      <td className="py-3 px-4 text-haze">{solver.storyTitle || "N/A"}</td>
                      <td className="py-3 px-4">
                        <span className="text-emerald-400 font-bold font-mono">
                          {formatCompletionTime(solver.completionTime)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-haze text-sm">
                        {solver.completedAt ? new Date(solver.completedAt).toLocaleString() : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
