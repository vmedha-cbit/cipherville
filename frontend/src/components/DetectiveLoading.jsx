import React from 'react';

export default function DetectiveLoading({ text = "Investigating..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 animate-fadeIn">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-amber-500/30 rounded-full animate-ping"></div>
        <div className="absolute inset-0 border-4 border-t-amber-500 border-r-transparent border-b-amber-500 border-l-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl">🕵️‍♂️</span>
        </div>
      </div>
      <p className="text-amber-400 font-mono text-lg animate-pulse tracking-widest uppercase">{text}</p>
    </div>
  );
}
