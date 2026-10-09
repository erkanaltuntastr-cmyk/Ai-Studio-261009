import React from 'react';
import { HelpCircle, Sparkles, Eye, X } from 'lucide-react';
import { Problem, DiagnosticResult } from '../types/math';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: Problem;
  diagnostic?: DiagnosticResult | null;
  helpTier: number; // 1, 2, or 3
  onAdvanceTier: () => void;
  onRevealSolution: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  problem,
  diagnostic,
  helpTier,
  onAdvanceTier,
  onRevealSolution,
}) => {
  if (!isOpen) return null;

  const getTier1Text = () => {
    if (diagnostic?.hintLevel1) return diagnostic.hintLevel1;
    switch (problem.operation) {
      case 'addition':
        return 'Start with the ones on the far right. If a column adds up to 10 or more, what do you need to do with the ten?';
      case 'subtraction':
        return 'Look at the top and bottom digits on the right. Is the top digit big enough to take away the bottom digit without exchanging?';
      case 'multiplication':
        return problem.num2 >= 10
          ? 'Multiply by the ones digit first, then remember what needs to go in the ones column before multiplying by the tens!'
          : 'Multiply the ones first, write down the ones digit and carry any tens above.';
      case 'division':
        return `Work from left to right. How many times does ${problem.num2} fit into the first number? If none, what do you carry?`;
    }
  };

  const getTier2Text = () => {
    if (diagnostic?.hintLevel2) return diagnostic.hintLevel2;
    switch (problem.operation) {
      case 'addition':
        return `Double check your column totals: remember to add any carried 1s from the previous column.`;
      case 'subtraction':
        return `Tap the top digit to cross it out. 1 ten becomes 10 ones in the column to the right.`;
      case 'multiplication':
        return `In long multiplication, multiplying by tens always adds a placeholder 0 at the end of the line.`;
      case 'division':
        return `Multiples of ${problem.num2}: ${Array.from({ length: 6 }, (_, i) => (i + 1) * problem.num2).join(', ')}... Find the closest one that does not go over!`;
    }
  };

  const getTier3Text = () => {
    if (diagnostic?.hintLevel3) return diagnostic.hintLevel3;
    return `Full answer: ${problem.correctAnswer}${problem.remainder ? ` with remainder ${problem.remainder}` : ''}.`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-amber-700" />
            <h3 className="font-semibold text-lg text-amber-950">Help Ladder (Step {helpTier} of 3)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-amber-800 hover:bg-amber-200/50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Step 1: Thinking question */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Step 1 · Thinking Question</span>
            </div>
            <p className="text-slate-800 text-sm leading-relaxed">{getTier1Text()}</p>
          </div>

          {/* Step 2: Mathematical Hint */}
          {helpTier >= 2 && (
            <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl space-y-1 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-700">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Step 2 · Clue & Fact</span>
              </div>
              <p className="text-slate-800 text-sm leading-relaxed">{getTier2Text()}</p>
            </div>
          )}

          {/* Step 3: Show solution */}
          {helpTier >= 3 && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <Eye className="w-3.5 h-3.5 text-emerald-700" />
                <span>Step 3 · Solution</span>
              </div>
              <p className="text-emerald-950 font-semibold text-sm">{getTier3Text()}</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          {helpTier < 3 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl"
              >
                I'll try now!
              </button>
              <button
                type="button"
                onClick={onAdvanceTier}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-xs"
              >
                Need another clue (Step {helpTier + 1})
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onRevealSolution();
                  onClose();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-xs"
              >
                Fill in answer & continue
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
