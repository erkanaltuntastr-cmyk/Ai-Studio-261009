import React from 'react';
import { Problem, DivisionLayout, GuideMode } from '../types/math';

interface NotebookGridProps {
  problem: Problem;
  userAnswerDigits: Record<number, string>; // colIndex -> digit
  userRemainder: string;
  userCarries: Record<number, string>; // colIndex -> carry digit
  userExchanges: Record<number, { isStruck: boolean; newValue: string; tenAdded: boolean }>;
  userPartialProducts: {
    line1: Record<number, string>;
    line2: Record<number, string>;
  };
  activeCell: { type: string; index: number; line?: number } | null;
  onSelectCell: (cell: { type: string; index: number; line?: number }) => void;
  onToggleExchange: (colIndex: number) => void;
  divisionLayout: DivisionLayout;
  guideMode: GuideMode;
  firstErrorCell?: string | null;
  showDivisorMultiples?: boolean;
  onToggleMultiples?: () => void;
}

export const NotebookGrid: React.FC<NotebookGridProps> = ({
  problem,
  userAnswerDigits,
  userRemainder,
  userCarries,
  userExchanges,
  userPartialProducts,
  activeCell,
  onSelectCell,
  onToggleExchange,
  divisionLayout,
  guideMode,
  firstErrorCell,
  showDivisorMultiples = false,
  onToggleMultiples,
}) => {
  const { operation, num1, num2, level, wordProblem } = problem;

  // Determine if guides should be visible
  const showGuides =
    guideMode === 'on' ||
    (guideMode === 'auto' && (level === 'easy' || level === 'medium'));

  return (
    <div className="w-full flex flex-col items-center justify-center p-2 sm:p-4 select-none">
      {/* Contextual Word Problem Banner (if present) */}
      {wordProblem && (
        <div className="w-full max-w-xl mb-4 bg-sky-50/80 border border-sky-200 rounded-xl p-3 text-slate-800 shadow-xs">
          <p className="text-base sm:text-lg font-medium text-sky-950">{wordProblem.context}</p>
          <div className="mt-1 text-xs sm:text-sm text-sky-700 font-semibold tracking-wide uppercase">
            Goal: Find {wordProblem.label.toLowerCase()}
          </div>
        </div>
      )}

      {/* The Squared Notebook Paper Container */}
      <div className="relative bg-white border border-slate-300 rounded-2xl shadow-sm p-4 sm:p-6 min-w-[320px] max-w-xl w-full overflow-x-auto touch-manipulation notebook-paper">
        {/* Authentic red school margin line */}
        <div className="absolute top-0 bottom-0 left-6 sm:left-10 w-[2px] bg-rose-200 pointer-events-none" />

        {/* Math Calculation Renderers */}
        <div className="pl-6 sm:pl-10">
          {operation === 'addition' && (
            <AdditionGrid
              problem={problem}
              userCarries={userCarries}
              userAnswerDigits={userAnswerDigits}
              activeCell={activeCell}
              onSelectCell={onSelectCell}
              showGuides={showGuides}
              firstErrorCell={firstErrorCell}
            />
          )}

          {operation === 'subtraction' && (
            <SubtractionGrid
              problem={problem}
              userExchanges={userExchanges}
              userAnswerDigits={userAnswerDigits}
              activeCell={activeCell}
              onSelectCell={onSelectCell}
              onToggleExchange={onToggleExchange}
              showGuides={showGuides}
              firstErrorCell={firstErrorCell}
            />
          )}

          {operation === 'multiplication' && (
            <MultiplicationGrid
              problem={problem}
              userCarries={userCarries}
              userAnswerDigits={userAnswerDigits}
              userPartialProducts={userPartialProducts}
              activeCell={activeCell}
              onSelectCell={onSelectCell}
              showGuides={showGuides}
              firstErrorCell={firstErrorCell}
            />
          )}

          {operation === 'division' && (
            <DivisionGrid
              problem={problem}
              userCarries={userCarries}
              userAnswerDigits={userAnswerDigits}
              userRemainder={userRemainder}
              activeCell={activeCell}
              onSelectCell={onSelectCell}
              divisionLayout={divisionLayout}
              showGuides={showGuides}
              firstErrorCell={firstErrorCell}
              showDivisorMultiples={showDivisorMultiples}
              onToggleMultiples={onToggleMultiples}
            />
          )}
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   1. ADDITION GRID
   - Carry row on TOP (M2 decision)
   - Num1 row
   - Num2 row with '+'
   - Answer row (right-to-left auto-advance)
   ========================================================================= */
const AdditionGrid: React.FC<{
  problem: Problem;
  userCarries: Record<number, string>;
  userAnswerDigits: Record<number, string>;
  activeCell: { type: string; index: number } | null;
  onSelectCell: (cell: { type: string; index: number }) => void;
  showGuides: boolean;
  firstErrorCell?: string | null;
}> = ({ problem, userCarries, userAnswerDigits, activeCell, onSelectCell, showGuides, firstErrorCell }) => {
  const s1 = problem.num1.toString();
  const s2 = problem.num2.toString();
  const ansLen = Math.max(s1.length, s2.length) + 1; // max answer length
  const s1Padded = s1.padStart(ansLen, ' ');
  const s2Padded = s2.padStart(ansLen, ' ');

  return (
    <div className="flex flex-col items-center">
      <div className="inline-grid gap-1.5" style={{ gridTemplateColumns: `48px repeat(${ansLen}, minmax(48px, 60px))` }}>
        {/* ROW 0: Carry Row (Top) */}
        <div className="h-10 flex items-center justify-center text-xs text-slate-400 font-sans">
          {showGuides && <span className="text-[11px] font-medium text-slate-400">carry</span>}
        </div>
        {Array.from({ length: ansLen }).map((_, col) => {
          const isCarryActive = activeCell?.type === 'carry' && activeCell.index === col;
          const carryVal = userCarries[col] || '';
          return (
            <div key={`carry-${col}`} className="h-10 flex items-center justify-center">
              {col < ansLen - 1 && (
                <button
                  type="button"
                  onClick={() => onSelectCell({ type: 'carry', index: col })}
                  className={`w-9 h-9 rounded-lg border text-sm font-mono font-bold transition-all flex items-center justify-center cursor-pointer ${
                    isCarryActive
                      ? 'bg-blue-100 border-blue-500 text-blue-900 ring-2 ring-blue-400'
                      : carryVal
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'border-dashed border-slate-200 text-slate-400 hover:border-slate-400'
                  }`}
                  aria-label={`carry row, column ${ansLen - col}`}
                >
                  {carryVal}
                </button>
              )}
            </div>
          );
        })}

        {/* ROW 1: Number 1 */}
        <div className="h-14 flex items-center justify-center" />
        {s1Padded.split('').map((ch, col) => (
          <div
            key={`num1-${col}`}
            className="h-14 flex items-center justify-center font-mono text-3xl font-semibold text-slate-800"
          >
            {ch !== ' ' ? ch : ''}
          </div>
        ))}

        {/* ROW 2: Number 2 with '+' */}
        <div className="h-14 flex items-center justify-center font-mono text-3xl font-bold text-slate-700">
          +
        </div>
        {s2Padded.split('').map((ch, col) => (
          <div
            key={`num2-${col}`}
            className="h-14 flex items-center justify-center font-mono text-3xl font-semibold text-slate-800"
          >
            {ch !== ' ' ? ch : ''}
          </div>
        ))}

        {/* Divider bar */}
        <div className="col-span-full my-1 border-b-2 border-slate-800" />

        {/* ROW 3: Answer Row */}
        <div className="h-14 flex items-center justify-center" />
        {Array.from({ length: ansLen }).map((_, col) => {
          const isAnsActive = activeCell?.type === 'answer' && activeCell.index === col;
          const val = userAnswerDigits[col] || '';
          const isError = firstErrorCell === `answer_${col}`;

          return (
            <div key={`ans-${col}`} className="h-14 flex items-center justify-center">
              <button
                type="button"
                onClick={() => onSelectCell({ type: 'answer', index: col })}
                className={`w-12 h-13 sm:w-13 sm:h-14 rounded-xl border-2 font-mono text-3xl font-bold transition-all flex items-center justify-center cursor-pointer ${
                  isAnsActive
                    ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-sm ring-2 ring-blue-300'
                    : isError
                    ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-300'
                    : val
                    ? 'bg-white border-slate-400 text-slate-900'
                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-400'
                }`}
                aria-label={`answer row, column ${ansLen - col}`}
              >
                {val}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* =========================================================================
   2. SUBTRACTION GRID (Decomposition / Bozma)
   - Interactive strikethrough top digits
   - Reduced donor digit above + recipient receives '1' (e.g. ¹3)
   ========================================================================= */
const SubtractionGrid: React.FC<{
  problem: Problem;
  userExchanges: Record<number, { isStruck: boolean; newValue: string; tenAdded: boolean }>;
  userAnswerDigits: Record<number, string>;
  activeCell: { type: string; index: number } | null;
  onSelectCell: (cell: { type: string; index: number }) => void;
  onToggleExchange: (colIndex: number) => void;
  showGuides: boolean;
  firstErrorCell?: string | null;
}> = ({
  problem,
  userExchanges,
  userAnswerDigits,
  activeCell,
  onSelectCell,
  onToggleExchange,
  showGuides,
  firstErrorCell,
}) => {
  const s1 = problem.num1.toString();
  const s2 = problem.num2.toString();
  const len = Math.max(s1.length, s2.length);
  const s1Padded = s1.padStart(len, ' ');
  const s2Padded = s2.padStart(len, ' ');

  return (
    <div className="flex flex-col items-center">
      {showGuides && (
        <div className="text-xs text-slate-500 mb-2 font-sans text-center">
          Tap top digit to <span className="font-semibold text-rose-700">exchange / borrow</span> across columns
        </div>
      )}

      <div className="inline-grid gap-1.5" style={{ gridTemplateColumns: `48px repeat(${len}, minmax(48px, 62px))` }}>
        {/* ROW 0: Exchange adjustments (Top row) */}
        <div className="h-10 flex items-center justify-center" />
        {s1Padded.split('').map((_, col) => {
          const ex = userExchanges[col];
          const isExchangeActive = activeCell?.type === 'exchange_new' && activeCell.index === col;

          return (
            <div key={`ex-${col}`} className="h-10 flex items-center justify-center">
              {ex?.isStruck && (
                <div className="flex items-center justify-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => onSelectCell({ type: 'exchange_new', index: col })}
                    className={`min-w-8 h-8 px-1 rounded-md border text-sm font-mono font-bold flex items-center justify-center ${
                      isExchangeActive
                        ? 'bg-blue-100 border-blue-500 text-blue-900 ring-2 ring-blue-300'
                        : 'bg-rose-50 border-rose-300 text-rose-800'
                    }`}
                    aria-label={`exchanged value for column ${len - col}`}
                  >
                    {ex.newValue || '?'}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* ROW 1: Number 1 (Minuend) with interactive tap-to-strike */}
        <div className="h-14 flex items-center justify-center" />
        {s1Padded.split('').map((ch, col) => {
          const ex = userExchanges[col];
          const isBlank = ch === ' ';

          return (
            <div key={`minuend-${col}`} className="h-14 flex items-center justify-center relative">
              {!isBlank ? (
                <button
                  type="button"
                  onClick={() => onToggleExchange(col)}
                  className={`w-11 h-12 rounded-lg font-mono text-3xl font-semibold flex items-center justify-center transition-all cursor-pointer relative ${
                    ex?.isStruck
                      ? 'text-slate-400 line-through decoration-rose-600 decoration-3 bg-slate-50'
                      : 'text-slate-800 hover:bg-slate-100/80 active:bg-slate-200'
                  }`}
                  title="Click to exchange / borrow"
                  aria-label={`Digit ${ch}, click to exchange`}
                >
                  {/* Recipient ten badge if ten was borrowed to this digit */}
                  {ex?.tenAdded && (
                    <span className="absolute -top-1 -left-1 text-sm font-mono font-bold text-rose-700 bg-rose-100 px-1 rounded-sm border border-rose-300">
                      ¹
                    </span>
                  )}
                  {ch}
                </button>
              ) : null}
            </div>
          );
        })}

        {/* ROW 2: Number 2 (Subtrahend) with '−' */}
        <div className="h-14 flex items-center justify-center font-mono text-3xl font-bold text-slate-700">
          −
        </div>
        {s2Padded.split('').map((ch, col) => (
          <div
            key={`subtrahend-${col}`}
            className="h-14 flex items-center justify-center font-mono text-3xl font-semibold text-slate-800"
          >
            {ch !== ' ' ? ch : ''}
          </div>
        ))}

        {/* Divider bar */}
        <div className="col-span-full my-1 border-b-2 border-slate-800" />

        {/* ROW 3: Answer Row */}
        <div className="h-14 flex items-center justify-center" />
        {Array.from({ length: len }).map((_, col) => {
          const isAnsActive = activeCell?.type === 'answer' && activeCell.index === col;
          const val = userAnswerDigits[col] || '';
          const isError = firstErrorCell === `answer_${col}`;

          return (
            <div key={`ans-${col}`} className="h-14 flex items-center justify-center">
              <button
                type="button"
                onClick={() => onSelectCell({ type: 'answer', index: col })}
                className={`w-12 h-13 sm:w-13 sm:h-14 rounded-xl border-2 font-mono text-3xl font-bold transition-all flex items-center justify-center cursor-pointer ${
                  isAnsActive
                    ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-300'
                    : isError
                    ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-300'
                    : val
                    ? 'bg-white border-slate-400 text-slate-900'
                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-400'
                }`}
                aria-label={`answer row, column ${len - col}`}
              >
                {val}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* =========================================================================
   3. MULTIPLICATION GRID
   - Short: carry on top, answer row below
   - Long: partial product rows (× units, × tens with 0 placeholder) + addition
   ========================================================================= */
const MultiplicationGrid: React.FC<{
  problem: Problem;
  userCarries: Record<number, string>;
  userAnswerDigits: Record<number, string>;
  userPartialProducts: {
    line1: Record<number, string>;
    line2: Record<number, string>;
  };
  activeCell: { type: string; index: number; line?: number } | null;
  onSelectCell: (cell: { type: string; index: number; line?: number }) => void;
  showGuides: boolean;
  firstErrorCell?: string | null;
}> = ({
  problem,
  userCarries,
  userAnswerDigits,
  userPartialProducts,
  activeCell,
  onSelectCell,
  showGuides,
  firstErrorCell,
}) => {
  const isLongMult = problem.num2 >= 10;
  const s1 = problem.num1.toString();
  const s2 = problem.num2.toString();
  const maxCols = s1.length + s2.length;
  const s1Padded = s1.padStart(maxCols, ' ');
  const s2Padded = s2.padStart(maxCols, ' ');

  if (!isLongMult) {
    // Short multiplication (1-digit multiplier)
    return (
      <div className="flex flex-col items-center">
        <div className="inline-grid gap-1.5" style={{ gridTemplateColumns: `48px repeat(${maxCols}, minmax(48px, 60px))` }}>
          {/* Carry row on top */}
          <div className="h-10 flex items-center justify-center text-xs text-slate-400 font-sans">
            {showGuides && <span className="text-[11px] font-medium text-slate-400">carry</span>}
          </div>
          {Array.from({ length: maxCols }).map((_, col) => {
            const isCarryActive = activeCell?.type === 'carry' && activeCell.index === col;
            const carryVal = userCarries[col] || '';
            return (
              <div key={`carry-${col}`} className="h-10 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => onSelectCell({ type: 'carry', index: col })}
                  className={`w-9 h-9 rounded-lg border text-sm font-mono font-bold transition-all flex items-center justify-center cursor-pointer ${
                    isCarryActive
                      ? 'bg-blue-100 border-blue-500 text-blue-900 ring-2 ring-blue-400'
                      : carryVal
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'border-dashed border-slate-200 text-slate-400 hover:border-slate-400'
                  }`}
                  aria-label={`multiplication carry column ${maxCols - col}`}
                >
                  {carryVal}
                </button>
              </div>
            );
          })}

          {/* Num1 */}
          <div className="h-14 flex items-center justify-center" />
          {s1Padded.split('').map((ch, col) => (
            <div key={`num1-${col}`} className="h-14 flex items-center justify-center font-mono text-3xl font-semibold text-slate-800">
              {ch !== ' ' ? ch : ''}
            </div>
          ))}

          {/* Num2 with × */}
          <div className="h-14 flex items-center justify-center font-mono text-3xl font-bold text-slate-700">
            ×
          </div>
          {s2Padded.split('').map((ch, col) => (
            <div key={`num2-${col}`} className="h-14 flex items-center justify-center font-mono text-3xl font-semibold text-slate-800">
              {ch !== ' ' ? ch : ''}
            </div>
          ))}

          {/* Divider */}
          <div className="col-span-full my-1 border-b-2 border-slate-800" />

          {/* Answer Row */}
          <div className="h-14 flex items-center justify-center" />
          {Array.from({ length: maxCols }).map((_, col) => {
            const isAnsActive = activeCell?.type === 'answer' && activeCell.index === col;
            const val = userAnswerDigits[col] || '';
            const isError = firstErrorCell === `answer_${col}`;

            return (
              <div key={`ans-${col}`} className="h-14 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => onSelectCell({ type: 'answer', index: col })}
                  className={`w-12 h-13 sm:w-13 sm:h-14 rounded-xl border-2 font-mono text-3xl font-bold transition-all flex items-center justify-center cursor-pointer ${
                    isAnsActive
                      ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-300'
                      : isError
                      ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-300'
                      : val
                      ? 'bg-white border-slate-400 text-slate-900'
                      : 'bg-white border-slate-200 text-slate-400 hover:border-slate-400'
                  }`}
                  aria-label={`answer column ${maxCols - col}`}
                >
                  {val}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Long Multiplication (2-digit multiplier)
  const multiplierUnits = problem.num2 % 10;
  const multiplierTens = Math.floor(problem.num2 / 10);

  return (
    <div className="flex flex-col items-center">
      <div
        className="inline-grid gap-1.5"
        style={{ gridTemplateColumns: `48px repeat(${maxCols}, minmax(44px, 56px)) 80px` }}
      >
        {/* Num1 */}
        <div className="h-13 flex items-center justify-center" />
        {s1Padded.split('').map((ch, col) => (
          <div key={`num1-${col}`} className="h-13 flex items-center justify-center font-mono text-3xl font-semibold text-slate-800">
            {ch !== ' ' ? ch : ''}
          </div>
        ))}
        <div className="h-13" />

        {/* Num2 with × */}
        <div className="h-13 flex items-center justify-center font-mono text-3xl font-bold text-slate-700">
          ×
        </div>
        {s2Padded.split('').map((ch, col) => (
          <div key={`num2-${col}`} className="h-13 flex items-center justify-center font-mono text-3xl font-semibold text-slate-800">
            {ch !== ' ' ? ch : ''}
          </div>
        ))}
        <div className="h-13" />

        {/* Divider 1 */}
        <div className="col-span-full my-1 border-b border-slate-700" />

        {/* Partial Product Line 1 (x units) */}
        <div className="h-13 flex items-center justify-center" />
        {Array.from({ length: maxCols }).map((_, col) => {
          const isActive = activeCell?.type === 'partial_1' && activeCell.index === col;
          const val = userPartialProducts.line1[col] || '';
          return (
            <div key={`p1-${col}`} className="h-13 flex items-center justify-center">
              <button
                type="button"
                onClick={() => onSelectCell({ type: 'partial_1', index: col, line: 1 })}
                className={`w-11 h-12 rounded-lg border font-mono text-2xl font-bold flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-300'
                    : val
                    ? 'bg-white border-slate-300 text-slate-800'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
                aria-label={`partial product row 1 column ${maxCols - col}`}
              >
                {val}
              </button>
            </div>
          );
        })}
        <div className="h-13 flex items-center pl-2 text-xs font-mono font-medium text-slate-500">
          {showGuides && `× ${multiplierUnits}`}
        </div>

        {/* Partial Product Line 2 (x tens) */}
        <div className="h-13 flex items-center justify-center" />
        {Array.from({ length: maxCols }).map((_, col) => {
          const isActive = activeCell?.type === 'partial_2' && activeCell.index === col;
          const isUnitsPlace = col === maxCols - 1;
          const val = userPartialProducts.line2[col] || (isUnitsPlace && problem.level === 'easy' ? '0' : '');

          return (
            <div key={`p2-${col}`} className="h-13 flex items-center justify-center">
              <button
                type="button"
                onClick={() => onSelectCell({ type: 'partial_2', index: col, line: 2 })}
                className={`w-11 h-12 rounded-lg border font-mono text-2xl font-bold flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-300'
                    : isUnitsPlace && val === '0'
                    ? 'bg-slate-100/70 border-slate-300 text-slate-500'
                    : val
                    ? 'bg-white border-slate-300 text-slate-800'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
                aria-label={`partial product row 2 column ${maxCols - col}`}
              >
                {val}
              </button>
            </div>
          );
        })}
        <div className="h-13 flex items-center pl-2 text-xs font-mono font-medium text-slate-500">
          {showGuides && `× ${multiplierTens * 10}`}
        </div>

        {/* Divider 2 */}
        <div className="col-span-full my-1 border-b-2 border-slate-800" />

        {/* Final Sum Answer Row */}
        <div className="h-14 flex items-center justify-center font-mono text-2xl font-bold text-slate-700">
          +
        </div>
        {Array.from({ length: maxCols }).map((_, col) => {
          const isAnsActive = activeCell?.type === 'answer' && activeCell.index === col;
          const val = userAnswerDigits[col] || '';
          const isError = firstErrorCell === `answer_${col}`;

          return (
            <div key={`final-${col}`} className="h-14 flex items-center justify-center">
              <button
                type="button"
                onClick={() => onSelectCell({ type: 'answer', index: col })}
                className={`w-12 h-13 rounded-xl border-2 font-mono text-3xl font-bold transition-all flex items-center justify-center cursor-pointer ${
                  isAnsActive
                    ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-300'
                    : isError
                    ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-300'
                    : val
                    ? 'bg-white border-slate-400 text-slate-900'
                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-400'
                }`}
                aria-label={`final sum column ${maxCols - col}`}
              >
                {val}
              </button>
            </div>
          );
        })}
        <div className="h-14" />
      </div>
    </div>
  );
};

/* =========================================================================
   4. DIVISION GRID (Bus Stop & Long Steps)
   - Left-to-right auto-advance
   - Bus stop bracket with divisor on left, dividend inside, quotient on top
   - Remainder box 'r' on the right
   - Multiples strip toggle
   ========================================================================= */
const DivisionGrid: React.FC<{
  problem: Problem;
  userCarries: Record<number, string>;
  userAnswerDigits: Record<number, string>;
  userRemainder: string;
  activeCell: { type: string; index: number } | null;
  onSelectCell: (cell: { type: string; index: number }) => void;
  divisionLayout: DivisionLayout;
  showGuides: boolean;
  firstErrorCell?: string | null;
  showDivisorMultiples?: boolean;
  onToggleMultiples?: () => void;
}> = ({
  problem,
  userCarries,
  userAnswerDigits,
  userRemainder,
  activeCell,
  onSelectCell,
  divisionLayout,
  showGuides,
  firstErrorCell,
  showDivisorMultiples = false,
  onToggleMultiples,
}) => {
  const divisor = problem.num2;
  const dividendStr = problem.num1.toString();
  const len = dividendStr.length;

  return (
    <div className="flex flex-col items-center">
      {/* Divisor Multiples Strip Helper */}
      {(showGuides || showDivisorMultiples) && (
        <div className="mb-4 p-2 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-700">
          <span className="font-semibold text-slate-500 mr-1">Multiples of {divisor}:</span>
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={`mult-${i}`}
              className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono font-medium"
            >
              {(i + 1) * divisor}
            </span>
          ))}
          {onToggleMultiples && (
            <button
              type="button"
              onClick={onToggleMultiples}
              className="ml-2 text-blue-600 hover:underline text-[11px] font-sans"
            >
              {showDivisorMultiples ? 'Hide' : 'Show all'}
            </button>
          )}
        </div>
      )}

      {/* Traditional UK Bus Stop */}
      <div className="inline-block">
        {/* TOP ROW: Quotient (Answer) cells */}
        <div className="flex items-center">
          {/* Spacer for divisor width */}
          <div className="w-14 sm:w-16 h-14" />

          {/* Quotient Digits */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: len }).map((_, col) => {
              const isAnsActive = activeCell?.type === 'answer' && activeCell.index === col;
              const val = userAnswerDigits[col] || '';
              const isError = firstErrorCell === `answer_${col}`;

              return (
                <div key={`quotient-${col}`} className="w-12 h-14 sm:w-13 sm:h-14 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => onSelectCell({ type: 'answer', index: col })}
                    className={`w-11 h-13 sm:w-12 sm:h-14 rounded-xl border-2 font-mono text-3xl font-bold transition-all flex items-center justify-center cursor-pointer ${
                      isAnsActive
                        ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-300'
                        : isError
                        ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-300'
                        : val
                        ? 'bg-white border-slate-400 text-slate-900'
                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-400'
                    }`}
                    aria-label={`quotient digit position ${col + 1}`}
                  >
                    {val}
                  </button>
                </div>
              );
            })}

            {/* Remainder field 'r' */}
            <div className="flex items-center ml-2">
              <span className="font-mono text-2xl font-bold text-slate-600 mr-1.5">r</span>
              <button
                type="button"
                onClick={() => onSelectCell({ type: 'remainder', index: 0 })}
                className={`w-11 h-13 sm:w-12 sm:h-14 rounded-xl border-2 font-mono text-3xl font-bold transition-all flex items-center justify-center cursor-pointer ${
                  activeCell?.type === 'remainder'
                    ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-300'
                    : firstErrorCell === 'remainder'
                    ? 'bg-amber-50 border-amber-500 text-amber-900'
                    : userRemainder
                    ? 'bg-white border-slate-400 text-slate-900'
                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-400'
                }`}
                aria-label="remainder value"
              >
                {userRemainder}
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Bus Stop Bracket with Dividend inside */}
        <div className="flex items-center">
          {/* Divisor */}
          <div className="w-14 sm:w-16 h-14 flex items-center justify-center font-mono text-3xl font-bold text-slate-800">
            {divisor}
          </div>

          {/* Bus Stop Box: Left border + Top border */}
          <div className="flex items-center gap-1.5 border-t-3 border-l-3 border-slate-800 rounded-tl-lg pt-1 pl-1">
            {dividendStr.split('').map((ch, col) => {
              const carryVal = userCarries[col] || '';
              const isCarryActive = activeCell?.type === 'carry' && activeCell.index === col;

              return (
                <div
                  key={`dividend-${col}`}
                  className="w-12 h-14 sm:w-13 sm:h-14 flex items-center justify-center relative"
                >
                  {/* Carried Remainder Button inside top-left corner */}
                  {col > 0 && (
                    <button
                      type="button"
                      onClick={() => onSelectCell({ type: 'carry', index: col })}
                      className={`absolute -top-1 -left-1 min-w-5 h-5 px-0.5 rounded text-xs font-mono font-bold flex items-center justify-center border transition-all ${
                        isCarryActive
                          ? 'bg-blue-100 border-blue-500 text-blue-900 ring-1 ring-blue-400'
                          : carryVal
                          ? 'bg-amber-100 border-amber-300 text-amber-900'
                          : 'bg-slate-100/60 border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                      title="Carry remainder to this digit"
                      aria-label={`carried remainder to digit ${ch}`}
                    >
                      {carryVal}
                    </button>
                  )}

                  {/* The Dividend digit */}
                  <span className="font-mono text-3xl font-semibold text-slate-800">{ch}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
