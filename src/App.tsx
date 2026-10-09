/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Home,
  Star,
  Clock,
  PenTool,
  Volume2,
  VolumeX,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  OperationType,
  AppMode,
  Problem,
  QuestionAttempt,
  SessionResult,
  UserStore,
} from './types/math';
import {
  generateProblem,
  diagnoseAttempt,
  getInverseCheckString,
} from './core/mathEngine';
import {
  loadUserStore,
  saveUserStore,
  formatRewardTime,
  evaluateLevelProgression,
} from './core/storage';
import { playAudioSound } from './utils/audio';
import { NotebookGrid } from './components/NotebookGrid';
import { Keypad } from './components/Keypad';
import { StartScreen } from './components/StartScreen';
import { SessionEnd } from './components/SessionEnd';
import { ParentMenu } from './components/ParentMenu';
import { HelpModal } from './components/HelpModal';
import { Scratchpad } from './components/Scratchpad';

type Screen = 'start' | 'question' | 'session_end';

export default function App() {
  // Global User Store
  const [store, setStore] = useState<UserStore>(() => loadUserStore());

  // Screen State
  const [currentScreen, setCurrentScreen] = useState<Screen>('start');
  const [isParentMenuOpen, setIsParentMenuOpen] = useState<boolean>(false);
  const [parentClickCount, setParentClickCount] = useState<number>(0);

  // Practice Configuration
  const [selectedOps, setSelectedOps] = useState<OperationType[]>([
    'addition',
    'subtraction',
  ]);
  const [selectedMode, setSelectedMode] = useState<AppMode>('learn');

  // Session Progression (10 questions)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [sessionAttempts, setSessionAttempts] = useState<QuestionAttempt[]>([]);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);

  // Active Notebook Grid State
  const [userAnswerDigits, setUserAnswerDigits] = useState<Record<number, string>>({});
  const [userRemainder, setUserRemainder] = useState<string>('');
  const [userCarries, setUserCarries] = useState<Record<number, string>>({});
  const [userExchanges, setUserExchanges] = useState<
    Record<number, { isStruck: boolean; newValue: string; tenAdded: boolean }>
  >({});
  const [userPartialProducts, setUserPartialProducts] = useState<{
    line1: Record<number, string>;
    line2: Record<number, string>;
  }>({ line1: {}, line2: {} });

  const [activeCell, setActiveCell] = useState<{
    type: string;
    index: number;
    line?: number;
  } | null>(null);

  // Feedback & Diagnostics
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'info' | 'success' | 'warn'>('info');
  const [firstErrorCell, setFirstErrorCell] = useState<string | null>(null);
  const [attemptsOnCurrentQ, setAttemptsOnCurrentQ] = useState<number>(0);
  const [wasHelpedCurrentQ, setWasHelpedCurrentQ] = useState<boolean>(false);
  const [inverseCheckMsg, setInverseCheckMsg] = useState<string | null>(null);

  // Help & Scratchpad State
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [helpTier, setHelpTier] = useState<number>(1);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState<boolean>(false);
  const [showDivisorMultiples, setShowDivisorMultiples] = useState<boolean>(false);

  // Session End Summary State
  const [lastCompletedSession, setLastCompletedSession] = useState<SessionResult | null>(null);
  const [levelChangeAlert, setLevelChangeAlert] = useState<string | null>(null);

  // Mobile / Viewport detection
  const [isMobileView, setIsMobileView] = useState<boolean>(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobileView(window.innerWidth < 900);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Save store when changed
  const handleUpdateStore = useCallback((updated: UserStore) => {
    setStore(updated);
    saveUserStore(updated);
  }, []);

  // 5 Taps on Header Title triggers secret Parent Menu
  const handleHeaderTitleClick = () => {
    const nextCount = parentClickCount + 1;
    if (nextCount >= 5) {
      setIsParentMenuOpen(true);
      setParentClickCount(0);
    } else {
      setParentClickCount(nextCount);
      // Reset after 3 seconds if not completed
      setTimeout(() => setParentClickCount(0), 3000);
    }
  };

  // Toggle operations in Start Screen
  const handleToggleOp = (op: OperationType) => {
    if (selectedOps.includes(op)) {
      if (selectedOps.length > 1) {
        setSelectedOps(selectedOps.filter((o) => o !== op));
      }
    } else {
      setSelectedOps([...selectedOps, op]);
    }
  };

  // Prepare a Question
  const initQuestion = useCallback(
    (index: number) => {
      // Pick operation from selectedOps
      const op = selectedOps[index % selectedOps.length];
      const lvl = store.levels[op];
      const prob = generateProblem(op, lvl);

      setCurrentProblem(prob);
      setCurrentQuestionIndex(index);
      setUserAnswerDigits({});
      setUserRemainder('');
      setUserCarries({});
      setUserExchanges({});
      setUserPartialProducts({ line1: {}, line2: {} });
      setFeedbackMessage(null);
      setFeedbackType('info');
      setFirstErrorCell(null);
      setAttemptsOnCurrentQ(0);
      setWasHelpedCurrentQ(false);
      setInverseCheckMsg(null);
      setHelpTier(1);
      setShowDivisorMultiples(false);

      // Focus starting cell
      if (prob.operation === 'division') {
        // Quotient starts left-to-right at index 0
        setActiveCell({ type: 'answer', index: 0 });
      } else if (prob.operation === 'addition') {
        // Addition has 1 extra column for carry overflow
        const ansLen = Math.max(prob.num1.toString().length, prob.num2.toString().length) + 1;
        setActiveCell({ type: 'answer', index: ansLen - 1 });
      } else if (prob.operation === 'multiplication') {
        const maxCols = prob.num1.toString().length + prob.num2.toString().length;
        setActiveCell({ type: 'answer', index: maxCols - 1 });
      } else {
        // Subtraction
        const len = Math.max(prob.num1.toString().length, prob.num2.toString().length);
        setActiveCell({ type: 'answer', index: len - 1 });
      }
    },
    [selectedOps, store.levels]
  );

  // Start Session
  const handleStartSession = () => {
    if (selectedOps.length === 0) return;
    setSessionAttempts([]);
    setCurrentQuestionIndex(0);
    setLevelChangeAlert(null);
    initQuestion(0);
    setCurrentScreen('question');
  };

  // Switch Active Cell
  const handleSelectCell = (cell: { type: string; index: number; line?: number }) => {
    setActiveCell(cell);
  };

  // Tap-to-Exchange in Subtraction
  const handleToggleExchange = (colIndex: number) => {
    if (!currentProblem || currentProblem.operation !== 'subtraction') return;

    const currentEx = userExchanges[colIndex];
    if (currentEx?.isStruck) {
      // Undo exchange
      const updated = { ...userExchanges };
      delete updated[colIndex];
      setUserExchanges(updated);
      playAudioSound('tap', store.settings.soundEnabled);
    } else {
      // Apply exchange / decomposition
      const num1Str = currentProblem.num1.toString();
      const num2Str = currentProblem.num2.toString();
      const len = Math.max(num1Str.length, num2Str.length);
      const padded1 = num1Str.padStart(len, ' ');

      const originalDigitChar = padded1[colIndex];
      const originalDigit = parseInt(originalDigitChar, 10);
      if (isNaN(originalDigit)) return;

      const newDonorValue = originalDigit === 0 ? 9 : originalDigit - 1;

      const updated = {
        ...userExchanges,
        [colIndex]: {
          isStruck: true,
          newValue: newDonorValue.toString(),
          tenAdded: false,
        },
      };

      // Recipient to the right receives '1'
      const recipientCol = colIndex + 1;
      if (recipientCol < len) {
        updated[recipientCol] = {
          ...(updated[recipientCol] || { isStruck: false, newValue: '' }),
          tenAdded: true,
        };
      }

      setUserExchanges(updated);
      playAudioSound('exchange', store.settings.soundEnabled);
      setActiveCell({ type: 'exchange_new', index: colIndex });
    }
  };

  // Handle Input Digit
  const handleInputDigit = useCallback(
    (digit: string) => {
      if (!activeCell || !currentProblem) return;
      playAudioSound('tap', store.settings.soundEnabled);

      const { type, index, line } = activeCell;

      if (type === 'answer') {
        setUserAnswerDigits((prev) => ({ ...prev, [index]: digit }));

        // Auto-advance logic
        if (currentProblem.operation === 'division') {
          // Division advances left to right
          const maxCols = currentProblem.num1.toString().length;
          if (index + 1 < maxCols) {
            setActiveCell({ type: 'answer', index: index + 1 });
          } else if (currentProblem.remainder !== undefined) {
            // Move to remainder if available
            setActiveCell({ type: 'remainder', index: 0 });
          }
        } else {
          // Addition, Subtraction, Multiplication advances right to left
          if (index > 0) {
            setActiveCell({ type: 'answer', index: index - 1 });
          }
        }
      } else if (type === 'remainder') {
        setUserRemainder(digit);
      } else if (type === 'carry') {
        setUserCarries((prev) => ({ ...prev, [index]: digit }));
      } else if (type === 'exchange_new') {
        setUserExchanges((prev) => ({
          ...prev,
          [index]: {
            ...(prev[index] || { isStruck: true, tenAdded: false }),
            newValue: digit,
          },
        }));
      } else if (type === 'partial_1') {
        setUserPartialProducts((prev) => ({
          ...prev,
          line1: { ...prev.line1, [index]: digit },
        }));
        if (index > 0) {
          setActiveCell({ type: 'partial_1', index: index - 1, line: 1 });
        }
      } else if (type === 'partial_2') {
        setUserPartialProducts((prev) => ({
          ...prev,
          line2: { ...prev.line2, [index]: digit },
        }));
        if (index > 0) {
          setActiveCell({ type: 'partial_2', index: index - 1, line: 2 });
        }
      }
    },
    [activeCell, currentProblem, store.settings.soundEnabled]
  );

  // Handle Delete (Backspace)
  const handleDelete = useCallback(() => {
    if (!activeCell) return;
    playAudioSound('tap', store.settings.soundEnabled);

    const { type, index } = activeCell;
    if (type === 'answer') {
      setUserAnswerDigits((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    } else if (type === 'remainder') {
      setUserRemainder('');
    } else if (type === 'carry') {
      setUserCarries((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    } else if (type === 'exchange_new') {
      setUserExchanges((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    } else if (type === 'partial_1') {
      setUserPartialProducts((prev) => {
        const next = { ...prev, line1: { ...prev.line1 } };
        delete next.line1[index];
        return next;
      });
    } else if (type === 'partial_2') {
      setUserPartialProducts((prev) => {
        const next = { ...prev, line2: { ...prev.line2 } };
        delete next.line2[index];
        return next;
      });
    }
  }, [activeCell, store.settings.soundEnabled]);

  // Navigate Cells
  const handleNavigate = useCallback(
    (direction: 'left' | 'right') => {
      if (!activeCell || !currentProblem) return;
      playAudioSound('tap', store.settings.soundEnabled);

      const { type, index, line } = activeCell;
      if (type === 'answer') {
        const maxCols =
          currentProblem.operation === 'division'
            ? currentProblem.num1.toString().length
            : currentProblem.operation === 'addition'
            ? Math.max(
                currentProblem.num1.toString().length,
                currentProblem.num2.toString().length
              ) + 1
            : currentProblem.operation === 'multiplication'
            ? currentProblem.num1.toString().length + currentProblem.num2.toString().length
            : Math.max(
                currentProblem.num1.toString().length,
                currentProblem.num2.toString().length
              );

        if (direction === 'left' && index > 0) {
          setActiveCell({ type: 'answer', index: index - 1 });
        } else if (direction === 'right' && index < maxCols - 1) {
          setActiveCell({ type: 'answer', index: index + 1 });
        } else if (
          direction === 'right' &&
          currentProblem.operation === 'division' &&
          index === maxCols - 1
        ) {
          setActiveCell({ type: 'remainder', index: 0 });
        }
      } else if (type === 'remainder' && direction === 'left') {
        const maxCols = currentProblem.num1.toString().length;
        setActiveCell({ type: 'answer', index: maxCols - 1 });
      } else if (type === 'partial_1' || type === 'partial_2') {
        const maxCols = currentProblem.num1.toString().length + 2;
        if (direction === 'left' && index > 0) {
          setActiveCell({ type, index: index - 1, line });
        } else if (direction === 'right' && index < maxCols - 1) {
          setActiveCell({ type, index: index + 1, line });
        }
      }
    },
    [activeCell, currentProblem, store.settings.soundEnabled]
  );

  // Compute Full Answer String
  const assembleAnswerString = useCallback(() => {
    if (!currentProblem) return '';
    // Sort keys in order and join
    const keys = Object.keys(userAnswerDigits)
      .map(Number)
      .sort((a, b) => a - b);
    return keys.map((k) => userAnswerDigits[k]).join('');
  }, [currentProblem, userAnswerDigits]);

  // Check Answer Handler
  const handleCheckAnswer = useCallback(() => {
    if (!currentProblem) return;

    const answerStr = assembleAnswerString();
    if (!answerStr) {
      setFeedbackMessage('Please enter your answer in the notebook first!');
      setFeedbackType('warn');
      return;
    }

    const diag = diagnoseAttempt(currentProblem, answerStr, userRemainder);

    if (diag.isCorrect) {
      // CORRECT!
      playAudioSound('correct', store.settings.soundEnabled);

      const isFirstTry = attemptsOnCurrentQ === 0 && !wasHelpedCurrentQ;
      // Calculate reward: 1st=60s, 2nd=30s, 3rd=15s, helped/other=5s
      const rewardSec = isFirstTry
        ? 60
        : wasHelpedCurrentQ
        ? 5
        : attemptsOnCurrentQ === 1
        ? 30
        : attemptsOnCurrentQ === 2
        ? 15
        : 5;

      const attemptRecord: QuestionAttempt = {
        problem: currentProblem,
        userAnswer: answerStr,
        userRemainder: userRemainder || undefined,
        attemptsCount: attemptsOnCurrentQ + 1,
        isCorrect: true,
        firstAttemptCorrect: isFirstTry,
        wasHelped: wasHelpedCurrentQ,
        rewardEarnedSeconds: rewardSec,
        diagnostics: [],
        timeTakenSeconds: 0,
      };

      const updatedAttempts = [...sessionAttempts, attemptRecord];
      setSessionAttempts(updatedAttempts);

      // Update store reward bank
      const updatedStore: UserStore = {
        ...store,
        rewardSeconds: store.rewardSeconds + rewardSec,
        todayRewardSeconds: store.todayRewardSeconds + rewardSec,
      };

      setFeedbackMessage(
        isFirstTry
          ? `Brilliant! Gold star (+${formatRewardTime(rewardSec)})`
          : `Well done for fixing it! (+${formatRewardTime(rewardSec)})`
      );
      setFeedbackType('success');

      // Proceed after brief pause (~1s)
      setTimeout(() => {
        if (currentQuestionIndex + 1 >= 10) {
          // Completed all 10 questions!
          finishSession(updatedAttempts, updatedStore);
        } else {
          handleUpdateStore(updatedStore);
          initQuestion(currentQuestionIndex + 1);
        }
      }, 1000);
    } else {
      // INCORRECT
      playAudioSound('wrong', store.settings.soundEnabled);
      const nextAttemptCount = attemptsOnCurrentQ + 1;
      setAttemptsOnCurrentQ(nextAttemptCount);

      // Record weak spot
      if (diag.errorType) {
        const curWeak = { ...store.weakSpots };
        curWeak[diag.errorType] = (curWeak[diag.errorType] || 0) + 1;
        setStore((prev) => ({ ...prev, weakSpots: curWeak }));
      }

      if (selectedMode === 'test') {
        // Test mode: don't reveal error; quietly proceed
        setFeedbackMessage('Answer recorded.');
        const attemptRecord: QuestionAttempt = {
          problem: currentProblem,
          userAnswer: answerStr,
          userRemainder: userRemainder || undefined,
          attemptsCount: nextAttemptCount,
          isCorrect: false,
          firstAttemptCorrect: false,
          wasHelped: false,
          rewardEarnedSeconds: 0,
          diagnostics: diag.errorType ? [diag.errorType] : [],
          timeTakenSeconds: 0,
        };
        const updatedAttempts = [...sessionAttempts, attemptRecord];
        setSessionAttempts(updatedAttempts);

        setTimeout(() => {
          if (currentQuestionIndex + 1 >= 10) {
            finishSession(updatedAttempts, store);
          } else {
            initQuestion(currentQuestionIndex + 1);
          }
        }, 600);
      } else {
        // Learn / Fix It mode
        setFeedbackMessage(diag.message);
        setFeedbackType('warn');
        if (diag.firstErrorCellId) {
          setFirstErrorCell(diag.firstErrorCellId);
        }

        if (selectedMode === 'fix_it') {
          const invMsg = getInverseCheckString(
            currentProblem,
            parseInt(answerStr, 10) || 0
          );
          setInverseCheckMsg(invMsg);
        }
      }
    }
  }, [
    currentProblem,
    assembleAnswerString,
    userRemainder,
    attemptsOnCurrentQ,
    wasHelpedCurrentQ,
    sessionAttempts,
    store,
    currentQuestionIndex,
    selectedMode,
    handleUpdateStore,
    initQuestion,
  ]);

  // Finish Full 10-Question Session
  const finishSession = (attempts: QuestionAttempt[], currentStore: UserStore) => {
    playAudioSound('star', currentStore.settings.soundEnabled);

    const firstTryCount = attempts.filter((a) => a.firstAttemptCorrect).length;
    const fixedCount = attempts.filter((a) => !a.firstAttemptCorrect && a.isCorrect && !a.wasHelped).length;
    const helped = attempts.filter((a) => a.wasHelped).length;
    const totalRew = attempts.reduce((acc, a) => acc + a.rewardEarnedSeconds, 0);

    const sessionRecord: SessionResult = {
      date: new Date().toLocaleDateString(),
      mode: selectedMode,
      operations: selectedOps,
      totalQuestions: attempts.length,
      correctFirstTry: firstTryCount,
      correctAfterRetry: fixedCount,
      helpedCount: helped,
      totalRewardSeconds: totalRew,
      attempts,
    };

    // Check level progression for the primary operations practiced
    let promoMsg: string | null = null;
    const updatedLevels = { ...currentStore.levels };

    selectedOps.forEach((op) => {
      const opAttempts = attempts.filter((a) => a.problem.operation === op);
      if (opAttempts.length >= 3) {
        const { newLevel, changed } = evaluateLevelProgression(
          updatedLevels[op],
          opAttempts.map((a) => a.firstAttemptCorrect)
        );
        if (changed === 'promoted') {
          updatedLevels[op] = newLevel;
          promoMsg = `Promoted to ${newLevel.toUpperCase()} in ${op}!`;
        } else if (changed === 'demoted') {
          updatedLevels[op] = newLevel;
        }
      }
    });

    const finalStore: UserStore = {
      ...currentStore,
      levels: updatedLevels,
      history: [sessionRecord, ...currentStore.history],
    };

    setLastCompletedSession(sessionRecord);
    setLevelChangeAlert(promoMsg);
    handleUpdateStore(finalStore);
    setCurrentScreen('session_end');
  };

  // Reveal Solution via Help Ladder
  const handleRevealSolution = () => {
    if (!currentProblem) return;
    setWasHelpedCurrentQ(true);

    const ansStr = currentProblem.correctAnswer.toString();
    const len = ansStr.length;
    const digitsMap: Record<number, string> = {};
    for (let i = 0; i < len; i++) {
      digitsMap[i] = ansStr[i];
    }
    setUserAnswerDigits(digitsMap);
    if (currentProblem.remainder !== undefined) {
      setUserRemainder(currentProblem.remainder.toString());
    }
  };

  // Physical Keyboard Listener
  useEffect(() => {
    if (currentScreen !== 'question' || isHelpOpen || isParentMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore modifier combinations
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleInputDigit(e.key);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleNavigate('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNavigate('right');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleCheckAnswer();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (window.confirm('Return to home screen? Current session progress will be lost.')) {
          setCurrentScreen('start');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentScreen,
    isHelpOpen,
    isParentMenuOpen,
    handleInputDigit,
    handleDelete,
    handleNavigate,
    handleCheckAnswer,
  ]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none text-slate-800">
      {/* SCREEN 1: Start Screen */}
      {currentScreen === 'start' && (
        <StartScreen
          selectedOps={selectedOps}
          onToggleOp={handleToggleOp}
          selectedMode={selectedMode}
          onSelectMode={setSelectedMode}
          onStartSession={handleStartSession}
          store={store}
          onTitleClick={handleHeaderTitleClick}
        />
      )}

      {/* SCREEN 2: Question Exercise Notebook Screen */}
      {currentScreen === 'question' && currentProblem && (
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Bar (~48px) */}
          <header className="h-12 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between text-slate-700 shadow-2xs">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Return to home? Current session will be lost.')) {
                    setCurrentScreen('start');
                  }
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Home (Esc)"
                aria-label="Home"
              >
                <Home className="w-5 h-5" />
              </button>

              <div
                onClick={handleHeaderTitleClick}
                className="cursor-pointer font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2"
                title="5 taps for Parent Settings"
              >
                <span>Ela's Notebook</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold hidden sm:inline-block">
                  Q{currentQuestionIndex + 1} of 10
                </span>
              </div>
            </div>

            {/* Status pills in Top Bar */}
            <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold">
              <span className="capitalize text-slate-600 hidden md:inline-block">
                {currentProblem.operation} · {currentProblem.level}
              </span>

              {/* Sound Toggle */}
              <button
                type="button"
                onClick={() => {
                  const updated = {
                    ...store,
                    settings: {
                      ...store.settings,
                      soundEnabled: !store.settings.soundEnabled,
                    },
                  };
                  handleUpdateStore(updated);
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                title={store.settings.soundEnabled ? 'Mute' : 'Unmute'}
              >
                {store.settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* Rough Work / Scratchpad Drawer Toggle */}
              <button
                type="button"
                onClick={() => setIsScratchpadOpen(!isScratchpadOpen)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold ${
                  isScratchpadOpen
                    ? 'bg-amber-100 border-amber-300 text-amber-900'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title="Toggle Scratchpad / Rough Work"
              >
                <PenTool className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Rough Work</span>
              </button>

              {/* Reward Time */}
              <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg font-mono">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{formatRewardTime(store.rewardSeconds)}</span>
              </div>
            </div>
          </header>

          {/* Main Workspace */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* LEFT / CENTER: The Notebook (takes full height) */}
            <div className="flex-1 flex flex-col justify-center items-center p-2 sm:p-4 overflow-y-auto">
              <NotebookGrid
                problem={currentProblem}
                userAnswerDigits={userAnswerDigits}
                userRemainder={userRemainder}
                userCarries={userCarries}
                userExchanges={userExchanges}
                userPartialProducts={userPartialProducts}
                activeCell={activeCell}
                onSelectCell={handleSelectCell}
                onToggleExchange={handleToggleExchange}
                divisionLayout={store.settings.divisionLayout}
                guideMode={store.settings.guideMode}
                firstErrorCell={firstErrorCell}
                showDivisorMultiples={showDivisorMultiples}
                onToggleMultiples={() => setShowDivisorMultiples(!showDivisorMultiples)}
              />

              {/* Inverse Check alert in Fix-It Mode */}
              {inverseCheckMsg && (
                <div className="mt-2 max-w-xl w-full bg-indigo-50 border border-indigo-200 rounded-xl p-2.5 text-xs sm:text-sm text-indigo-900 font-mono text-center">
                  {inverseCheckMsg}
                </div>
              )}
            </div>

            {/* RIGHT PANEL (Desktop / Landscape >= 900px): Feedback & Keypad */}
            {!isMobileView && (
              <div className="w-80 lg:w-96 bg-white border-l border-slate-200 p-4 flex flex-col justify-between shadow-xs">
                {/* Feedback line (max 2 lines) */}
                <div className="min-h-16 flex items-center justify-center p-3 rounded-2xl border text-sm text-center leading-snug transition-all bg-slate-50 border-slate-200">
                  {feedbackMessage ? (
                    <p
                      className={`font-semibold ${
                        feedbackType === 'success'
                          ? 'text-emerald-700'
                          : feedbackType === 'warn'
                          ? 'text-amber-800'
                          : 'text-slate-700'
                      }`}
                    >
                      {feedbackMessage}
                    </p>
                  ) : (
                    <p className="text-slate-400 text-xs">
                      Enter digits into the squared paper, then press Check.
                    </p>
                  )}
                </div>

                {/* Keypad */}
                <div className="my-auto py-2">
                  <Keypad
                    onDigit={handleInputDigit}
                    onDelete={handleDelete}
                    onClear={handleDelete}
                    onNavigateLeft={() => handleNavigate('left')}
                    onNavigateRight={() => handleNavigate('right')}
                    onCheck={handleCheckAnswer}
                    onHelp={() => setIsHelpOpen(true)}
                    isCheckDisabled={false}
                    isHelpDisabled={selectedMode === 'test'}
                    helpLabel={selectedMode === 'test' ? 'Test Mode' : 'Help'}
                    isMobileLayout={false}
                  />
                </div>

                {/* Bottom stats banner */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-amber-700 font-semibold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    <span>Stars: {sessionAttempts.filter((a) => a.firstAttemptCorrect).length}</span>
                  </span>
                  <span>Question {currentQuestionIndex + 1}/10</span>
                </div>
              </div>
            )}
          </div>

            {/* MOBILE DOCK (Phone portrait / narrow < 900px): Feedback + 4-col Keypad */}
            {isMobileView && (
              <div className="w-full bg-white border-t border-slate-200 flex flex-col">
                {/* Single feedback line */}
                {feedbackMessage && (
                  <div className="px-3 py-1.5 bg-amber-50 border-b border-amber-200 text-xs font-semibold text-center text-amber-900 truncate">
                    {feedbackMessage}
                  </div>
                )}
                <Keypad
                  onDigit={handleInputDigit}
                  onDelete={handleDelete}
                  onClear={handleDelete}
                  onNavigateLeft={() => handleNavigate('left')}
                  onNavigateRight={() => handleNavigate('right')}
                  onCheck={handleCheckAnswer}
                  onHelp={() => setIsHelpOpen(true)}
                  isCheckDisabled={false}
                  isHelpDisabled={selectedMode === 'test'}
                  helpLabel={selectedMode === 'test' ? 'Test' : 'Help'}
                  isMobileLayout={true}
                />
              </div>
            )}
        </div>
      )}

      {/* SCREEN 3: Session End */}
      {currentScreen === 'session_end' && lastCompletedSession && (
        <SessionEnd
          session={lastCompletedSession}
          store={store}
          onAgain={handleStartSession}
          onHome={() => setCurrentScreen('start')}
          levelChangeMessage={levelChangeAlert}
        />
      )}

      {/* 3-Tier Help Ladder Modal */}
      {currentProblem && (
        <HelpModal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
          problem={currentProblem}
          helpTier={helpTier}
          onAdvanceTier={() => setHelpTier((prev) => Math.min(3, prev + 1))}
          onRevealSolution={handleRevealSolution}
        />
      )}

      {/* Rough Work Scratchpad */}
      <Scratchpad
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
      />

      {/* Secret Parent & Teacher Menu */}
      <ParentMenu
        isOpen={isParentMenuOpen}
        onClose={() => setIsParentMenuOpen(false)}
        store={store}
        onUpdateStore={handleUpdateStore}
      />
    </div>
  );
}
