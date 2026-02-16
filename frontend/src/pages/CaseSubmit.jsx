import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../providers/api.js";

export default function CaseSubmit() {
  const navigate = useNavigate();
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/participants/submit-case", { answer });
      setResult(data.ok);
      if (data.ok) {
        navigate("/complete");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Submission failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-lg bg-steel/70 p-8 rounded-xl border border-white/10">
        <h2 className="text-2xl font-semibold">Case Submission</h2>
        <p className="text-haze mt-2">Enter the criminal name exactly.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full p-3 bg-ink border border-white/10 rounded"
            placeholder="Criminal Name"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
          />
          {error && <p className="text-ember text-sm">{error}</p>}
          {result === false && <p className="text-ember text-sm">Incorrect. Try again.</p>}
          <button className="w-full py-3 bg-ember text-black font-semibold rounded">Submit</button>
        </form>
      </div>
    </div>
  );
}
