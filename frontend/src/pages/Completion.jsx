import { useAuth } from "../providers/authContext.jsx";

export default function Completion() {
  const { session } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-xl bg-steel/70 p-8 rounded-xl border border-white/10 text-center">
        <h2 className="text-3xl font-semibold">Case Closed</h2>
        <p className="text-haze mt-3">Great work, Investigator {session?.rollNumber}.</p>
        <p className="text-haze mt-2">Waiting for admin action...</p>
      </div>
    </div>
  );
}
