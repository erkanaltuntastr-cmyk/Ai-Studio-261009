import React, { useState } from 'react';
import { PenTool, Trash2, X } from 'lucide-react';

interface ScratchpadProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Scratchpad: React.FC<ScratchpadProps> = ({ isOpen, onClose }) => {
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-80 sm:w-96 bg-amber-50/95 border-l border-amber-200 shadow-2xl flex flex-col p-4 backdrop-blur-sm animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-amber-200">
        <div className="flex items-center gap-2">
          <PenTool className="w-5 h-5 text-amber-800" />
          <h3 className="font-semibold text-amber-950 font-sans">Rough Work / Scratchpad</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-amber-800 hover:bg-amber-200"
          aria-label="Close scratchpad"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <p className="text-xs text-amber-800/80 my-2">
        Ela's side calculations (e.g. times tables, jottings). This does not affect your question score.
      </p>

      {/* Jotting area */}
      <div className="flex-1 flex flex-col">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="E.g.&#10;7 x 8 = 56&#10;56 + 4 = 60&#10;..."
          className="w-full flex-1 p-3 bg-white/80 border border-amber-200 rounded-xl font-mono text-base text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {/* Clear Notes button */}
      <div className="pt-3 flex justify-end">
        <button
          type="button"
          onClick={() => setNotes('')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Notes</span>
        </button>
      </div>
    </div>
  );
};
