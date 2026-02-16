import { useEffect, useState } from "react";
import api from "../../providers/api.js";
import AdminNav from "../../components/AdminNav.jsx";

const applyAdminToken = () => {
  const token = localStorage.getItem("cipherville-admin-token");
  if (token) {
    api.defaults.headers.Authorization = `Bearer ${token}`;
  }
};

export default function Analytics() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const load = async () => {
      applyAdminToken();
      const { data } = await api.get("/admin/dashboard");
      setUsers(data.users || []);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold">Player Analytics</h2>
        <div className="mt-4">
          <AdminNav />
        </div>
        <div className="mt-6 space-y-2">
          {users.map((user) => (
            <div key={user._id} className="bg-steel/70 p-3 rounded border border-white/10">
              <p className="font-semibold">{user.rollNumber}</p>
              <p className="text-haze text-sm">Phase: {user.phase} | DB Attempts: {user.attempts?.dbLogin}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
