import React from 'react';
import { Delete, ArrowLeft, ArrowRight, HelpCircle, CheckCircle2 } from 'lucide-react';

interface KeypadProps {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onClear: () => void;
  onNavigateLeft: () => void;
  onNavigateRight: () => void;
  onCheck: () => void;
  onHelp: () => void;
  isCheckDisabled?: boolean;
  isHelpDisabled?: boolean;
  helpLabel?: string;
  isMobileLayout?: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({
  onDigit,
  onDelete,
  onNavigateLeft,
  onNavigateRight,
  onCheck,
  onHelp,
  isCheckDisabled = false,
  isHelpDisabled = false,
  helpLabel = 'Help',
  isMobileLayout = false,
}) => {
  // Common key style
  const baseKeyClass =
    'flex items-center justify-center font-mono font-semibold text-2xl rounded-xl transition-all duration-100 select-none active:scale-95 touch-manipulation cursor-pointer border shadow-sm';
  const digitKeyClass = `${baseKeyClass} bg-white text-slate-800 border-slate-200 hover:bg-slate-50 active:bg-slate-100 min-h-[60px] md:min-h-[64px]`;
  const actionKeyClass = `${baseKeyClass} bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 active:bg-slate-300 min-h-[60px] md:min-h-[64px] text-lg`;
  const checkKeyClass = `${baseKeyClass} bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 active:bg-emerald-800 shadow-md min-h-[60px] md:min-h-[64px] font-sans font-bold text-lg`;
  const helpKeyClass = `${baseKeyClass} bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100 active:bg-amber-200 min-h-[60px] md:min-h-[64px] font-sans text-base`;

  const handlePointerDown = (e: React.PointerEvent) => {
    // Prevent focus loss from active cell
    e.preventDefault();
  };

  if (isMobileLayout) {
    // 4-column compact layout for mobile phone
    return (
      <div className="w-full bg-slate-50 p-2 border-t border-slate-200 select-none">
        <div className="grid grid-cols-4 gap-1.5 max-w-md mx-auto">
          {/* Row 1 */}
          <button
            type="button"
            onPointerDown={handlePointerDown}
            onClick={() => onDigit('1')}
            className={digitKeyClass}
            aria-label="1"
          >
            1
          </button>
          <button
            type="button"
            onPointerDown={handlePointerDown}
            onClick={() => onDigit('2')}
            className={digitKeyClass}
            aria-label="2"
          >
            2
          </button>
          <button
            type="button"
            onPointerDown={handlePointerDown}
            onClick={() => onDigit('3')}
            className={digitKeyClass}
            aria-label="3"
          >
            3
          </button>
          <button
            type="button"
            onPointerDown={handlePointerDown}
            onClick={onDelete}
            className={`${actionKeyClass} text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100`}
            aria-label="Delete"
          >
            <Delete className="w-6 h-6" />
          </button>

          {/* Row 2 */}
          <button
            type="button"
            onPointerDown={handlePointerDown}
            onClick={() => onDigit('4')}
            className={digitKeyClass}
            aria-label="4"
          >
            4
          </button>
          <button
            type="button"
            onPointerDown={handlePointerDown}
            onClick={() => onDigit('5')}
            className={digitKeyClass}
            aria-label="5"
          >
            5
          </button>
          <button
            type="button"
            onPointerDown={handlePointerDown}
            onClick={() => onDigit('6')}
            className={digitKeyClass}
            aria-label="6"
          >
            6
          </button>
          <button
            type="button"
            onPointerDown={handlePointerDown}
            onClick={onNavigateLeft}
            className={actionKeyClass}
            aria-label="Previous cell"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          {/* Row 3 */}
          <button
            type="button"
            onPointerDown={handlePointerDown}
            onClick={() => onDigit('7')}
            className={digitKeyClass}
            aria-label="7"
          >
            7
          </button>
          <button
            type="button"
            onPointerDown={handlePointerDown}
            onClick={() => onDigit('8')}
            className={digitKeyClass}
            aria-label="8"
          >
            8
          </button>
          <button
            type="button"
            onPointerDown={handlePointerDown}
            onClick={() => onDigit('9')}
            className={digitKeyClass}
            aria-label="9"
          >
            9
          </button>
          <button
            type="button"
            onPointerDown={handlePointerDown}
            onClick={onNavigateRight}
            className={actionKeyClass}
            aria-label="Next cell"
          >
            <ArrowRight className="w-6 h-6" />
          </button>

          {/* Row 4 */}
          <button
            type="button"
            onPointerDown={handlePointerDown}
            onClick={onHelp}
            disabled={isHelpDisabled}
            className={`${helpKeyClass} ${isHelpDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            aria-label={helpLabel}
          >
            <HelpCircle className="w-5 h-5 mr-1" />
            <span className="text-sm font-semibold">{helpLabel}</span>
          </button>
          <button
            type="button"
            onPointerDown={handlePointerDown}
            onClick={() => onDigit('0')}
            className={digitKeyClass}
            aria-label="0"
          >
            0
          </button>
          <button
            type="button"
            onPointerDown={handlePointerDown}
            onClick={onCheck}
            disabled={isCheckDisabled}
            className={`${checkKeyClass} col-span-2 ${isCheckDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Check answer"
          >
            <CheckCircle2 className="w-6 h-6 mr-1.5" />
            <span>Check</span>
          </button>
        </div>
      </div>
    );
  }

  // Desktop / Tablet landscape layout (side panel)
  return (
    <div className="w-full flex flex-col gap-3 select-none">
      {/* 3x3 Digit Grid */}
      <div className="grid grid-cols-3 gap-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            onPointerDown={handlePointerDown}
            onClick={() => onDigit(digit)}
            className={digitKeyClass}
            aria-label={digit}
          >
            {digit}
          </button>
        ))}

        {/* Row 4: Left Arrow, 0, Right Arrow */}
        <button
          type="button"
          onPointerDown={handlePointerDown}
          onClick={onNavigateLeft}
          className={actionKeyClass}
          aria-label="Previous cell"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button
          type="button"
          onPointerDown={handlePointerDown}
          onClick={() => onDigit('0')}
          className={digitKeyClass}
          aria-label="0"
        >
          0
        </button>

        <button
          type="button"
          onPointerDown={handlePointerDown}
          onClick={onNavigateRight}
          className={actionKeyClass}
          aria-label="Next cell"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Delete Button (Wide) */}
      <button
        type="button"
        onPointerDown={handlePointerDown}
        onClick={onDelete}
        className={`${baseKeyClass} bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 min-h-[52px] text-base gap-2 font-sans`}
        aria-label="Delete"
      >
        <Delete className="w-5 h-5" />
        <span>Delete (⌫)</span>
      </button>

      {/* Action Buttons: Help & Check */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onPointerDown={handlePointerDown}
          onClick={onHelp}
          disabled={isHelpDisabled}
          className={`${helpKeyClass} ${isHelpDisabled ? 'opacity-40 cursor-not-allowed' : ''} min-h-[58px]`}
          aria-label={helpLabel}
        >
          <HelpCircle className="w-5 h-5 mr-1.5" />
          <span>{helpLabel}</span>
        </button>

        <button
          type="button"
          onPointerDown={handlePointerDown}
          onClick={onCheck}
          disabled={isCheckDisabled}
          className={`${checkKeyClass} ${isCheckDisabled ? 'opacity-50 cursor-not-allowed' : ''} min-h-[58px]`}
          aria-label="Check answer"
        >
          <CheckCircle2 className="w-6 h-6 mr-1.5" />
          <span>Check</span>
        </button>
      </div>
    </div>
  );
};
