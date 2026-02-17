import { useState } from "react";

// Guide content as a static import (will be replaced with fetch in useEffect)
const GUIDE_PATH = "/guide/guidecontent.txt";

export default function GuideWidget() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");

  // Load guide content on first open
  const handleOpen = async () => {
    setOpen(true);
    if (!content) {
      try {
        const res = await fetch(GUIDE_PATH);
        const text = await res.text();
        setContent(text);
      } catch {
        setContent("Failed to load guide.");
      }
    }
  };

  if (open) {
    return (
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
        <div className="bg-black/90 border-2 border-amber-400 rounded-xl shadow-2xl p-6 max-w-md w-[90vw] text-white relative animate-fadeIn">
          <button
            aria-label="Close guide"
            className="absolute top-2 right-3 text-2xl text-amber-400 hover:text-red-400 font-bold"
            onClick={() => setOpen(false)}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            ×
          </button>
          <pre className="whitespace-pre-wrap text-sm font-mono text-amber-100" style={{ maxHeight: 400, overflowY: "auto" }}>{content}</pre>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleOpen}
      style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}
      className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-6 rounded-full shadow-xl border-2 border-amber-700 animate-fadeIn"
    >
      Guide
    </button>
  );
}
