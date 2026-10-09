import React from 'react';
import { Trophy, Star, Clock, RotateCcw, Home, Download, CheckCircle, AlertTriangle } from 'lucide-react';
import { SessionResult, UserStore } from '../types/math';
import { formatRewardTime, exportAsText, exportAsJson } from '../core/storage';

interface SessionEndProps {
  session: SessionResult;
  store: UserStore;
  onAgain: () => void;
  onHome: () => void;
  levelChangeMessage?: string | null;
}

export const SessionEnd: React.FC<SessionEndProps> = ({
  session,
  store,
  onAgain,
  onHome,
  levelChangeMessage,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Celebration Banner */}
        <div className="bg-gradient-to-b from-blue-600 to-indigo-700 text-white p-6 sm:p-8 text-center relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-2xl mx-auto flex items-center justify-center backdrop-blur-md mb-3 border border-white/20">
            <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-amber-300" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-sans">Session Completed!</h2>
          <p className="text-blue-100 text-sm mt-1">Fantastic focus and mathematical determination, Ela!</p>

          {/* Level promotion badge if any */}
          {levelChangeMessage && (
            <div className="mt-4 inline-flex items-center gap-2 bg-amber-400 text-slate-900 px-4 py-1.5 rounded-full font-bold text-sm shadow-md animate-bounce">
              <Star className="w-4 h-4 fill-slate-900" />
              <span>{levelChangeMessage}</span>
            </div>
          )}
        </div>

        {/* Results Cards */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Stars & Score Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {/* Gold Stars */}
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl flex flex-col items-center">
              <Star className="w-7 h-7 text-amber-500 fill-amber-400 mb-1" />
              <span className="text-2xl font-bold text-slate-800">{session.correctFirstTry}</span>
              <span className="text-xs font-medium text-amber-900">Gold Stars (1st Try)</span>
            </div>

            {/* Silver Stars */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center">
              <Star className="w-7 h-7 text-slate-400 fill-slate-300 mb-1" />
              <span className="text-2xl font-bold text-slate-800">{session.correctAfterRetry}</span>
              <span className="text-xs font-medium text-slate-600">Silver Stars (Fixed)</span>
            </div>

            {/* Helped */}
            <div className="p-3.5 bg-sky-50/80 border border-sky-200 rounded-2xl flex flex-col items-center">
              <CheckCircle className="w-7 h-7 text-sky-600 mb-1" />
              <span className="text-2xl font-bold text-slate-800">{session.helpedCount}</span>
              <span className="text-xs font-medium text-sky-800">Helped</span>
            </div>
          </div>

          {/* Reward Time Earned Banner */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-xs">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Reward Time Earned</p>
                <p className="text-2xl font-bold text-emerald-950 font-mono">
                  +{formatRewardTime(session.totalRewardSeconds)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-emerald-700">Total Bank</p>
              <p className="text-sm font-bold text-emerald-900 font-mono">{formatRewardTime(store.rewardSeconds)}</p>
            </div>
          </div>

          {/* Question Breakdown Details */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Questions Summary</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {session.attempts.map((att, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-500 text-xs w-6">Q{idx + 1}</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {att.problem.num1}{' '}
                      {att.problem.operation === 'addition'
                        ? '+'
                        : att.problem.operation === 'subtraction'
                        ? '−'
                        : att.problem.operation === 'multiplication'
                        ? '×'
                        : '÷'}{' '}
                      {att.problem.num2}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {att.firstAttemptCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        1st Try
                      </span>
                    ) : att.isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3 fill-slate-400 text-slate-400" />
                        Fixed
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
                        Helped
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons: Again, Home, Download */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              onClick={onAgain}
              className="flex items-center justify-center gap-2 px-4 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-base shadow-sm active:scale-98 transition-all cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Again</span>
            </button>

            <button
              type="button"
              onClick={onHome}
              className="flex items-center justify-center gap-2 px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-base border border-slate-200 active:scale-98 transition-all cursor-pointer"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </button>

            <button
              type="button"
              onClick={() => {
                exportAsText(store);
                exportAsJson(store);
              }}
              className="flex items-center justify-center gap-2 px-4 py-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl font-bold text-sm border border-emerald-200 active:scale-98 transition-all cursor-pointer"
              title="Download results as TXT and JSON"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
