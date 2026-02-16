import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../providers/api.js";

export default function Officer() {
  const navigate = useNavigate();
  const [officer, setOfficer] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.post("/participants/assign-officer");
        setOfficer(data.officer);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load officer");
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="max-w-3xl mx-auto text-center">
        {error && <p className="text-ember mb-4">{error}</p>}
        {officer && (
          <div className="space-y-8">
            {/* Hero Section with Story */}
            <div className="bg-steel/70 p-10 rounded-xl border border-white/10 shadow-2xl">
              <h1 className="text-4xl font-bold text-ember mb-6">Welcome to Cipherville!</h1>
              <p className="text-lg text-haze mb-4 italic">The case is awaiting your presence...</p>
              
              {/* Officer Story Passage */}
              <div className="bg-ink/50 p-8 rounded-lg border border-white/20 my-8">
                <h2 className="text-2xl font-semibold text-white mb-4">This is what happened:</h2>
                <p className="text-haze leading-relaxed text-justify whitespace-pre-wrap">
                  {officer.background}
                </p>
                {officer.lastCase && (
                  <p className="text-haze/80 mt-4 italic">
                    Last Known Case: {officer.lastCase}
                  </p>
                )}
              </div>

              {/* Access Database Button */}
              <button
                className="px-8 py-4 bg-ember text-black font-bold text-lg rounded-lg hover:bg-ember/90 transition-all transform hover:scale-105 shadow-lg"
                onClick={() => navigate("/db-login")}
              >
                Access Crime Database
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
