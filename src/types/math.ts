export type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'very_hard';

export type AppMode = 'learn' | 'fix_it' | 'test';

export type DivisionLayout = 'bus_stop' | 'long_steps';

export type GuideMode = 'auto' | 'on' | 'off';

export interface Problem {
  id: string;
  operation: OperationType;
  level: DifficultyLevel;
  num1: number;
  num2: number;
  correctAnswer: number;
  remainder?: number; // for division
  wordProblem?: {
    context: string;
    label: string; // e.g. "Boxes needed" or "Remainder pencils"
  };
  // Pre-calculated steps for diagnosis
  intermediate?: {
    carries?: number[];
    exchanges?: { index: number; original: number; modified: number; recipientTen: boolean }[];
    partialProducts?: number[];
    divisionSteps?: { quotientDigit: number; product: number; remainder: number }[];
  };
}

export interface GridCell {
  id: string;
  row: number;
  col: number;
  type: 'answer' | 'carry' | 'exchange_new' | 'exchange_ten' | 'partial_answer' | 'remainder' | 'static';
  value: string;
  expectedValue?: string;
  isStrikethrough?: boolean;
  isReadOnly?: boolean;
  label?: string;
  ariaLabel: string;
  tag?: string; // e.g. 'partial_1', 'partial_2', 'carry_top'
}

export interface DiagnosticResult {
  isCorrect: boolean;
  firstErrorCellId?: string;
  errorType?: string;
  message: string;
  hintLevel1?: string;
  hintLevel2?: string;
  hintLevel3?: string;
}

export interface QuestionAttempt {
  problem: Problem;
  userAnswer: string;
  userRemainder?: string;
  attemptsCount: number;
  isCorrect: boolean;
  firstAttemptCorrect: boolean;
  wasHelped: boolean;
  rewardEarnedSeconds: number;
  diagnostics: string[];
  timeTakenSeconds: number;
}

export interface SessionResult {
  date: string;
  mode: AppMode;
  operations: OperationType[];
  totalQuestions: number;
  correctFirstTry: number;
  correctAfterRetry: number;
  helpedCount: number;
  totalRewardSeconds: number;
  attempts: QuestionAttempt[];
}

export interface UserStore {
  schemaVersion: number;
  levels: Record<OperationType, DifficultyLevel>;
  history: SessionResult[];
  rewardSeconds: number; // cumulative reward bank
  todayRewardSeconds: number;
  lastActiveDate: string;
  settings: {
    divisionLayout: DivisionLayout;
    guideMode: GuideMode;
    soundEnabled: boolean;
    parentLanguage: 'tr' | 'en';
  };
  weakSpots: Record<string, number>; // e.g., 'forgot_carry': 4, 'zero_exchange': 2
}
