import { UserStore, DifficultyLevel, OperationType, SessionResult } from '../types/math';

const STORAGE_KEY = 'ela-four-operations-v1';

const DEFAULT_STORE: UserStore = {
  schemaVersion: 1,
  levels: {
    addition: 'medium',
    subtraction: 'medium',
    multiplication: 'easy',
    division: 'easy',
  },
  history: [],
  rewardSeconds: 0,
  todayRewardSeconds: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
  settings: {
    divisionLayout: 'bus_stop',
    guideMode: 'auto',
    soundEnabled: true,
    parentLanguage: 'tr',
  },
  weakSpots: {},
};

export function loadUserStore(): UserStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveUserStore(DEFAULT_STORE);
      return DEFAULT_STORE;
    }

    const parsed = JSON.parse(raw);
    const today = new Date().toISOString().split('T')[0];

    // Maintain backwards compatibility with schemaVersion 1
    const merged: UserStore = {
      schemaVersion: 1,
      levels: {
        addition: parsed.levels?.addition || 'medium',
        subtraction: parsed.levels?.subtraction || 'medium',
        multiplication: parsed.levels?.multiplication || 'easy',
        division: parsed.levels?.division || 'easy',
      },
      history: Array.isArray(parsed.history) ? parsed.history : [],
      rewardSeconds: typeof parsed.rewardSeconds === 'number' ? parsed.rewardSeconds : 0,
      todayRewardSeconds:
        parsed.lastActiveDate === today && typeof parsed.todayRewardSeconds === 'number'
          ? parsed.todayRewardSeconds
          : 0,
      lastActiveDate: today,
      settings: {
        divisionLayout: parsed.settings?.divisionLayout === 'long_steps' ? 'long_steps' : 'bus_stop',
        guideMode: ['auto', 'on', 'off'].includes(parsed.settings?.guideMode)
          ? parsed.settings.guideMode
          : 'auto',
        soundEnabled: parsed.settings?.soundEnabled ?? true,
        parentLanguage: parsed.settings?.parentLanguage === 'en' ? 'en' : 'tr',
      },
      weakSpots: parsed.weakSpots || {},
    };

    return merged;
  } catch (e) {
    console.error('Failed to load user store from localStorage', e);
    return DEFAULT_STORE;
  }
}

export function saveUserStore(store: UserStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to save user store to localStorage', e);
  }
}

/**
 * Updates level progression based on 10-question evaluation rule:
 * - 8 out of 10 correct on 1st attempt -> advance level
 * - 3 consecutive failures on 1st attempt -> drop 1 level
 */
export function evaluateLevelProgression(
  currentLevel: DifficultyLevel,
  firstAttemptResults: boolean[] // array of last attempts
): { newLevel: DifficultyLevel; changed: 'promoted' | 'demoted' | 'unchanged' } {
  const levelsOrder: DifficultyLevel[] = ['easy', 'medium', 'hard', 'very_hard'];
  const currentIndex = levelsOrder.indexOf(currentLevel);

  // Check last 3 consecutive failures
  if (firstAttemptResults.length >= 3) {
    const last3 = firstAttemptResults.slice(-3);
    if (last3.every((res) => res === false)) {
      if (currentIndex > 0) {
        return { newLevel: levelsOrder[currentIndex - 1], changed: 'demoted' };
      }
    }
  }

  // Check 8 out of 10 rule
  if (firstAttemptResults.length >= 8) {
    const last10 = firstAttemptResults.slice(-10);
    const correctCount = last10.filter(Boolean).length;
    if (correctCount >= 8 && currentIndex < levelsOrder.length - 1) {
      return { newLevel: levelsOrder[currentIndex + 1], changed: 'promoted' };
    }
  }

  return { newLevel: currentLevel, changed: 'unchanged' };
}

/**
 * Format seconds into mm:ss
 */
export function formatRewardTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Generate export filename: ela-four-operations-YYYY-MM-DD-HHMM
 */
export function getExportFilename(extension: 'txt' | 'json'): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `ela-four-operations-${yyyy}-${mm}-${dd}-${hh}${min}.${extension}`;
}

/**
 * Exports data as downloadable text file
 */
export function exportAsText(store: UserStore): void {
  const filename = getExportFilename('txt');
  let content = `ELA'S MATHS NOTEBOOK (DÖRT İŞLEM DEFTERİ v3)\n`;
  content += `Date Exported: ${new Date().toLocaleString()}\n`;
  content += `Student: Ela (Year 5, Eversley Primary)\n`;
  content += `--------------------------------------------------\n`;
  content += `TOTAL REWARD TIME BANK: ${formatRewardTime(store.rewardSeconds)} (${store.rewardSeconds} seconds)\n`;
  content += `TODAY'S REWARD TIME:    ${formatRewardTime(store.todayRewardSeconds)}\n\n`;
  content += `CURRENT CURRICULUM LEVELS:\n`;
  content += `  Addition:       ${store.levels.addition.toUpperCase()}\n`;
  content += `  Subtraction:    ${store.levels.subtraction.toUpperCase()}\n`;
  content += `  Multiplication: ${store.levels.multiplication.toUpperCase()}\n`;
  content += `  Division:       ${store.levels.division.toUpperCase()}\n\n`;
  content += `PEDAGOGICAL WEAK SPOTS IDENTIFIED:\n`;
  if (Object.keys(store.weakSpots).length === 0) {
    content += `  None recorded yet - great accuracy!\n`;
  } else {
    for (const [key, count] of Object.entries(store.weakSpots)) {
      content += `  - ${key.replace(/_/g, ' ')}: ${count} times\n`;
    }
  }
  content += `\nPAST SESSIONS (${store.history.length} completed):\n`;
  store.history.forEach((sess, idx) => {
    content += `  Session #${idx + 1} [${sess.date}] Mode: ${sess.mode.toUpperCase()}\n`;
    content += `    Operations: ${sess.operations.join(', ')}\n`;
    content += `    Score: ${sess.correctFirstTry}/${sess.totalQuestions} on 1st attempt (${sess.correctAfterRetry} after retry, ${sess.helpedCount} helped)\n`;
    content += `    Reward earned: ${formatRewardTime(sess.totalRewardSeconds)}\n`;
    content += `    Attempts detail:\n`;
    sess.attempts.forEach((att, aIdx) => {
      content += `      Q${aIdx + 1}: ${att.problem.num1} ${getOpSymbol(att.problem.operation)} ${att.problem.num2} = ${att.userAnswer} ${att.userRemainder ? `r${att.userRemainder}` : ''} | Expected: ${att.problem.correctAnswer}${att.problem.remainder ? ` r${att.problem.remainder}` : ''} [${att.firstAttemptCorrect ? '1st Try OK' : att.isCorrect ? 'Fixed' : 'Helped'}]\n`;
    });
    content += `\n`;
  });

  downloadFile(filename, content, 'text/plain');
}

/**
 * Exports data as downloadable JSON
 */
export function exportAsJson(store: UserStore): void {
  const filename = getExportFilename('json');
  const jsonStr = JSON.stringify(store, null, 2);
  downloadFile(filename, jsonStr, 'application/json');
}

function getOpSymbol(op: OperationType): string {
  switch (op) {
    case 'addition':
      return '+';
    case 'subtraction':
      return '−';
    case 'multiplication':
      return '×';
    case 'division':
      return '÷';
  }
}

function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
