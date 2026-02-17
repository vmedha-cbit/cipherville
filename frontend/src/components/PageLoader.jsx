import { useState, useEffect } from "react";

const INVESTIGATION_WORDS = [
  "Analyzing Evidence",
  "Decrypting Records",
  "Tracking Suspect",
  "Scanning Logs",
  "Processing Data",
  "Cross-referencing Files"
];

export default function PageLoader({ isLoading = true }) {
  const [currentWord, setCurrentWord] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % INVESTIGATION_WORDS.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-block w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-amber-400 text-xl font-mono animate-pulse">
          {INVESTIGATION_WORDS[currentWord]}
        </p>
        <div className="mt-4 flex gap-1 justify-center">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    </div>
  );
}
