import { useEffect, useState } from "react";
import api from "../../providers/api.js";
import AdminNav from "../../components/AdminNav.jsx";

const applyAdminToken = () => {
  const token = localStorage.getItem("cipherville-admin-token");
  if (token) {
    api.defaults.headers.Authorization = `Bearer ${token}`;
  }
};

export default function AdminDashboard() {
  const [data, setData] = useState({ rooms: [], users: [], stories: [] });
  const [seedInfo, setSeedInfo] = useState(null);

  useEffect(() => {
    const load = async () => {
      applyAdminToken();
      const { data } = await api.get("/admin/dashboard");
      setData(data);
    };
    load();
  }, []);

  const seedDemo = async () => {
    applyAdminToken();
    const { data } = await api.post("/admin/seed");
    setSeedInfo(data);
  };

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
        <AdminNav />
        <div className="bg-steel/70 p-4 rounded border border-white/10 flex flex-col md:flex-row md:items-center gap-3">
          <p className="text-haze">Need quick demo data?</p>
          <button className="px-4 py-2 bg-ember text-black font-semibold rounded" onClick={seedDemo}>Insert Demo Data</button>
          {seedInfo?.storyId && (
            <p className="text-xs text-haze">Seeded Story ID: {seedInfo.storyId}</p>
          )}
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-steel/70 p-4 rounded border border-white/10">
            <p className="text-haze">Active Rooms</p>
            <p className="text-3xl font-semibold mt-2">{data.rooms.length}</p>
          </div>
          <div className="bg-steel/70 p-4 rounded border border-white/10">
            <p className="text-haze">Players</p>
            <p className="text-3xl font-semibold mt-2">{data.users.length}</p>
          </div>
          <div className="bg-steel/70 p-4 rounded border border-white/10">
            <p className="text-haze">Stories</p>
            <p className="text-3xl font-semibold mt-2">{data.stories.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
