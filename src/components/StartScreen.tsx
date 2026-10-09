import React from 'react';
import { Plus, Minus, X, Divide, Play, Clock, Star, ShieldCheck, Check } from 'lucide-react';
import { OperationType, AppMode, UserStore } from '../types/math';
import { formatRewardTime } from '../core/storage';

interface StartScreenProps {
  selectedOps: OperationType[];
  onToggleOp: (op: OperationType) => void;
  selectedMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  onStartSession: () => void;
  store: UserStore;
  onTitleClick: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  selectedOps,
  onToggleOp,
  selectedMode,
  onSelectMode,
  onStartSession,
  store,
  onTitleClick,
}) => {
  const operations: { id: OperationType; label: string; icon: React.ReactNode; symbol: string }[] = [
    {
      id: 'addition',
      label: 'Column Addition',
      icon: <Plus className="w-6 h-6" />,
      symbol: '+',
    },
    {
      id: 'subtraction',
      label: 'Decomposition Subtraction',
      icon: <Minus className="w-6 h-6" />,
      symbol: '−',
    },
    {
      id: 'multiplication',
      label: 'Long Multiplication',
      icon: <X className="w-6 h-6" />,
      symbol: '×',
    },
    {
      id: 'division',
      label: 'Bus Stop Division',
      icon: <Divide className="w-6 h-6" />,
      symbol: '÷',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header (Secret 5-click on title opens Parent Menu) */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-xs font-semibold uppercase tracking-wider">
            <span>Year 5 · Eversley Primary School</span>
          </div>

          <h1
            onClick={onTitleClick}
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 cursor-pointer select-none hover:text-blue-700 transition-colors"
            title="5 taps for Parent & Teacher Settings"
          >
            Ela's Maths Notebook
          </h1>
          <p className="text-slate-500 text-sm">
            Master the four written calculation methods on squared exercise paper.
          </p>
        </div>

        {/* Reward Bank Banner */}
        <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-amber-900 uppercase">Earned Reward Time</p>
              <p className="text-lg font-mono font-bold text-amber-950">
                {formatRewardTime(store.rewardSeconds)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
              Today: {formatRewardTime(store.todayRewardSeconds)}
            </span>
          </div>
        </div>

        {/* Operation Selection (Multi-select) */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            Choose Operations (select one or more)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {operations.map((op) => {
              const isSelected = selectedOps.includes(op.id);
              const curLevel = store.levels[op.id];

              return (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => onToggleOp(op.id)}
                  className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all select-none cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xl ${
                        isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {op.symbol}
                    </div>
                    <div>
                      <p className="font-bold text-sm leading-tight">{op.label}</p>
                      <span
                        className={`text-[10px] uppercase font-semibold tracking-wider ${
                          isSelected ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        Level: {curLevel}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                      isSelected
                        ? 'bg-white text-blue-600 border-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mode Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            Practice Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'learn', label: 'Learn', desc: 'Guidance & hints' },
              { id: 'fix_it', label: 'Fix It', desc: 'Inverse checks' },
              { id: 'test', label: 'Test', desc: 'Exam conditions' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectMode(m.id as AppMode)}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  selectedMode === m.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <p className="font-bold text-sm">{m.label}</p>
                <p
                  className={`text-[10px] mt-0.5 ${
                    selectedMode === m.id ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  {m.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onStartSession}
            disabled={selectedOps.length === 0}
            className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
              selectedOps.length === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98 shadow-emerald-600/20'
            }`}
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Start Practice (10 Questions)</span>
          </button>
        </div>

        {/* Footer note */}
        <div className="text-center">
          <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Tap the title 5 times to open Parent & Teacher Settings
          </span>
        </div>
      </div>
    </div>
  );
};
