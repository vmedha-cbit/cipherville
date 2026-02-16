import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../providers/api.js";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/admin-login", { username, password });
      localStorage.setItem("cipherville-admin-token", data.token);
      api.defaults.headers.Authorization = `Bearer ${data.token}`;
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-steel/70 p-8 rounded-xl border border-white/10">
        <h2 className="text-2xl font-semibold">Admin Login</h2>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full p-3 bg-ink border border-white/10 rounded"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="w-full p-3 bg-ink border border-white/10 rounded"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-ember text-sm">{error}</p>}
          <button className="w-full py-3 bg-ember text-black font-semibold rounded">Enter Control Room</button>
        </form>
      </div>
    </div>
  );
}
