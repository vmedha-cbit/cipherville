import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/authContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [rollNumber, setRollNumber] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(rollNumber.trim(), displayName.trim());
      navigate("/lobby");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-steel/70 p-8 rounded-xl border border-white/10 glow">
        <h1 className="text-3xl font-semibold">Cipherville</h1>
        <p className="text-haze mt-2">Crime Investigation Challenge</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-haze">Roll Number</label>
            <input
              className="w-full mt-2 p-3 bg-ink border border-white/10 rounded"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-haze">Name (optional)</label>
            <input
              className="w-full mt-2 p-3 bg-ink border border-white/10 rounded"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          {error && <p className="text-ember text-sm">{error}</p>}
          <button className="w-full py-3 bg-ember text-black font-semibold rounded">Enter Lobby</button>
        </form>
      </div>
    </div>
  );
}
