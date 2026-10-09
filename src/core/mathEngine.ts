import { DifficultyLevel, OperationType, Problem, DiagnosticResult } from '../types/math';

/**
 * Random integer helper between min and max inclusive.
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates an authentic Year 5 curriculum problem.
 */
export function generateProblem(operation: OperationType, level: DifficultyLevel): Problem {
  const id = `prob_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  switch (operation) {
    case 'addition':
      return generateAddition(id, level);
    case 'subtraction':
      return generateSubtraction(id, level);
    case 'multiplication':
      return generateMultiplication(id, level);
    case 'division':
      return generateDivision(id, level);
    default:
      return generateAddition(id, level);
  }
}

function generateAddition(id: string, level: DifficultyLevel): Problem {
  let num1 = 0;
  let num2 = 0;

  if (level === 'easy') {
    // 3-digit + 3-digit with exactly 1 carry
    for (let i = 0; i < 50; i++) {
      num1 = randomInt(150, 480);
      num2 = randomInt(120, 480);
      const carries = countAdditionCarries(num1, num2);
      if (carries === 1) break;
    }
  } else if (level === 'medium') {
    // 3-digit + 3-digit with 2 carries
    for (let i = 0; i < 50; i++) {
      num1 = randomInt(350, 850);
      num2 = randomInt(260, 650);
      const carries = countAdditionCarries(num1, num2);
      if (carries === 2) break;
    }
  } else if (level === 'hard') {
    // 4-digit + 4-digit with 2 or 3 carries
    for (let i = 0; i < 50; i++) {
      num1 = randomInt(2450, 6800);
      num2 = randomInt(1750, 5900);
      const carries = countAdditionCarries(num1, num2);
      if (carries >= 2) break;
    }
  } else {
    // very_hard: 4-digit or 5-digit with carry chain (e.g. 9998 + 4735)
    num1 = randomInt(7800, 9950);
    num2 = randomInt(4500, 8900);
  }

  // Fallback defaults if loop didn't match
  if (!num1 || !num2) {
    num1 = level === 'easy' ? 347 : level === 'medium' ? 486 : 3875;
    num2 = level === 'easy' ? 128 : level === 'medium' ? 357 : 4689;
  }

  const carries = computeAdditionCarries(num1, num2);

  return {
    id,
    operation: 'addition',
    level,
    num1,
    num2,
    correctAnswer: num1 + num2,
    intermediate: {
      carries,
    },
  };
}

function countAdditionCarries(a: number, b: number): number {
  let carry = 0;
  let count = 0;
  let n1 = a;
  let n2 = b;
  while (n1 > 0 || n2 > 0) {
    const sum = (n1 % 10) + (n2 % 10) + carry;
    carry = sum >= 10 ? 1 : 0;
    if (carry > 0) count++;
    n1 = Math.floor(n1 / 10);
    n2 = Math.floor(n2 / 10);
  }
  return count;
}

function computeAdditionCarries(a: number, b: number): number[] {
  const carries: number[] = [];
  let carry = 0;
  let n1 = a;
  let n2 = b;
  while (n1 > 0 || n2 > 0) {
    const sum = (n1 % 10) + (n2 % 10) + carry;
    carry = sum >= 10 ? 1 : 0;
    carries.push(carry);
    n1 = Math.floor(n1 / 10);
    n2 = Math.floor(n2 / 10);
  }
  return carries;
}

function generateSubtraction(id: string, level: DifficultyLevel): Problem {
  let num1 = 0;
  let num2 = 0;

  if (level === 'easy') {
    // 3-digit with 1 simple exchange (e.g. 452 - 128)
    for (let i = 0; i < 50; i++) {
      const top = randomInt(350, 780);
      const bot = randomInt(120, top - 60);
      const ex = countSubtractionExchanges(top, bot);
      if (ex === 1 && top > bot) {
        num1 = top;
        num2 = bot;
        break;
      }
    }
  } else if (level === 'medium') {
    // 3-digit or 4-digit with 2 exchanges
    for (let i = 0; i < 50; i++) {
      const top = randomInt(520, 1850);
      const bot = randomInt(260, top - 80);
      const ex = countSubtractionExchanges(top, bot);
      if (ex === 2 && top > bot) {
        num1 = top;
        num2 = bot;
        break;
      }
    }
  } else if (level === 'hard') {
    // 4-digit with zero exchange (e.g. 5004 - 2367 or 4032 - 1658)
    const thousands = randomInt(4, 8);
    const ones = randomInt(1, 5);
    num1 = thousands * 1000 + randomInt(0, 3) * 10 + ones; // e.g. 5004, 6023
    num2 = randomInt(1500, num1 - 800);
  } else {
    // very_hard: Multi-zero chain (e.g. 40,003 - 2,678)
    const tenThousands = randomInt(3, 7);
    const ones = randomInt(1, 4);
    num1 = tenThousands * 10000 + ones; // e.g. 40003
    num2 = randomInt(1500, 9800);
  }

  if (!num1 || !num2 || num1 <= num2) {
    num1 = level === 'easy' ? 452 : level === 'medium' ? 734 : level === 'hard' ? 5004 : 40003;
    num2 = level === 'easy' ? 128 : level === 'medium' ? 386 : level === 'hard' ? 2367 : 2678;
  }

  return {
    id,
    operation: 'subtraction',
    level,
    num1,
    num2,
    correctAnswer: num1 - num2,
  };
}

function countSubtractionExchanges(a: number, b: number): number {
  let count = 0;
  const digitsA = a.toString().split('').map(Number);
  const digitsB = b.toString().padStart(digitsA.length, '0').split('').map(Number);

  for (let i = digitsA.length - 1; i >= 0; i--) {
    if (digitsA[i] < digitsB[i]) {
      count++;
      // borrow
      let j = i - 1;
      while (j >= 0 && digitsA[j] === 0) {
        j--;
      }
      if (j >= 0) {
        digitsA[j]--;
        for (let k = j + 1; k < i; k++) {
          digitsA[k] += 9;
        }
        digitsA[i] += 10;
      }
    }
  }
  return count;
}

function generateMultiplication(id: string, level: DifficultyLevel): Problem {
  let num1 = 0;
  let num2 = 0;

  if (level === 'easy') {
    // Short multiplication: 2-digit × 1-digit or 3-digit × 1-digit
    num1 = randomInt(34, 185);
    num2 = randomInt(3, 8);
  } else if (level === 'medium') {
    // 2-digit × 2-digit long multiplication (e.g. 37 × 24)
    num1 = randomInt(24, 76);
    num2 = randomInt(14, 38);
  } else if (level === 'hard') {
    // 3-digit × 2-digit long multiplication (e.g. 347 × 26)
    num1 = randomInt(135, 485);
    num2 = randomInt(16, 48);
  } else {
    // very_hard: 3-digit × 2-digit or 4-digit × 2-digit (e.g. 586 × 47)
    num1 = randomInt(420, 890);
    num2 = randomInt(35, 78);
  }

  // Pre-calculate partial products for 2-digit multiplier
  const partialProducts: number[] = [];
  if (num2 >= 10) {
    const units = num2 % 10;
    const tens = Math.floor(num2 / 10);
    partialProducts.push(num1 * units);
    partialProducts.push(num1 * tens * 10);
  }

  return {
    id,
    operation: 'multiplication',
    level,
    num1,
    num2,
    correctAnswer: num1 * num2,
    intermediate: {
      partialProducts,
    },
  };
}

function generateDivision(id: string, level: DifficultyLevel): Problem {
  let divisor = 0;
  let quotient = 0;
  let remainder = 0;

  if (level === 'easy') {
    // 3-digit ÷ 1-digit, exact division, no remainder (e.g. 384 ÷ 6 = 64)
    divisor = randomInt(3, 8);
    quotient = randomInt(32, 95);
    remainder = 0;
  } else if (level === 'medium') {
    // 3 or 4-digit ÷ 1-digit, internal carries with/without remainder
    divisor = randomInt(4, 9);
    quotient = randomInt(65, 240);
    remainder = Math.random() > 0.4 ? randomInt(1, divisor - 1) : 0;
  } else if (level === 'hard') {
    // 4-digit ÷ 1-digit with zero in quotient trap (e.g. 618 ÷ 6 = 103, 7249 ÷ 7 = 1035 r4)
    divisor = randomInt(4, 8);
    // Force a 0 in the quotient middle: e.g. 103, 204, 1056
    const high = randomInt(1, 4);
    const low = randomInt(12, 68);
    quotient = high * 1000 + low; // e.g. 2045 or 1034
    remainder = Math.random() > 0.3 ? randomInt(1, divisor - 1) : 0;
  } else {
    // very_hard: 5-digit ÷ 1-digit (e.g. 74853 ÷ 6 = 12475 r3)
    divisor = randomInt(5, 9);
    quotient = randomInt(11200, 24500);
    remainder = randomInt(1, divisor - 1);
  }

  const num1 = quotient * divisor + remainder;
  const num2 = divisor;

  // Occasional word problem context (1 in 4)
  let wordProblem;
  if (Math.random() < 0.25) {
    const contexts = [
      {
        context: `${num1} pencils are packed into boxes of ${num2}. How many full boxes can be made?`,
        label: 'Full boxes',
      },
      {
        context: `A bakery baked ${num1} biscuits and packs ${num2} in each tin. How many tins are needed?`,
        label: 'Tins filled',
      },
      {
        context: `${num1} stickers are shared equally among ${num2} friends. How many does each friend receive?`,
        label: 'Stickers each',
      },
    ];
    wordProblem = contexts[Math.floor(Math.random() * contexts.length)];
  }

  return {
    id,
    operation: 'division',
    level,
    num1,
    num2,
    correctAnswer: quotient,
    remainder,
    wordProblem,
  };
}

/**
 * Pedagogical Diagnosis Engine
 * Inspects user input and returns granular feedback.
 * CRITICAL RULE: A problem is marked correct if the FINAL ANSWER ROW matches!
 * Intermediate inputs (carries, steps) provide diagnostic insight if wrong or incomplete.
 */
export function diagnoseAttempt(
  problem: Problem,
  userAnswerStr: string,
  userRemainderStr: string = '',
  intermediateData?: Record<string, string>
): DiagnosticResult {
  const cleanedAns = userAnswerStr.trim();
  const userAns = parseInt(cleanedAns, 10);
  const userRem = userRemainderStr.trim() ? parseInt(userRemainderStr.trim(), 10) : 0;
  const expectedAns = problem.correctAnswer;
  const expectedRem = problem.remainder || 0;

  // Check final correctness
  const isAnswerCorrect = !isNaN(userAns) && userAns === expectedAns;
  const isRemainderCorrect = expectedRem === userRem;

  if (isAnswerCorrect && (problem.operation !== 'division' || isRemainderCorrect)) {
    return {
      isCorrect: true,
      message: 'Spot on! Well calculated.',
    };
  }

  // Not correct: determine precise educational error
  switch (problem.operation) {
    case 'addition':
      return diagnoseAddition(problem, userAns, intermediateData);
    case 'subtraction':
      return diagnoseSubtraction(problem, userAns, intermediateData);
    case 'multiplication':
      return diagnoseMultiplication(problem, userAns, intermediateData);
    case 'division':
      return diagnoseDivision(problem, userAns, userRem, intermediateData);
  }
}

function diagnoseAddition(
  problem: Problem,
  userAns: number,
  intermediateData?: Record<string, string>
): DiagnosticResult {
  const { num1, num2, correctAnswer } = problem;

  // Check 1: Forgot carry (e.g. 86 + 39 = 115)
  // Compute sum without any carries
  const digits1 = num1.toString().split('').map(Number).reverse();
  const digits2 = num2.toString().split('').map(Number).reverse();
  const len = Math.max(digits1.length, digits2.length);
  let noCarryStr = '';
  for (let i = 0; i < len; i++) {
    const d1 = digits1[i] || 0;
    const d2 = digits2[i] || 0;
    noCarryStr = ((d1 + d2) % 10).toString() + noCarryStr;
  }
  const noCarryVal = parseInt(noCarryStr, 10);

  if (userAns === noCarryVal || userAns === correctAnswer - 10 || userAns === correctAnswer - 100) {
    return {
      isCorrect: false,
      errorType: 'forgot_carry',
      message: 'Did you forget to add the carried 1 to the next column?',
      hintLevel1: 'Remember to look above the numbers: is there a carry number to add in?',
      hintLevel2: 'When a column adds up to 10 or more, carry the 1 into the column to the left.',
      hintLevel3: `The correct sum is ${correctAnswer}. Check each column starting from the ones!`,
    };
  }

  // Check 2: Carried 2 instead of 1 or added carry twice
  if (userAns === correctAnswer + 10 || userAns === correctAnswer + 100) {
    return {
      isCorrect: false,
      errorType: 'added_carry_twice',
      message: 'Careful! It looks like a carry was added twice or counted as 2.',
      hintLevel1: 'Check the tens or hundreds column additions again.',
      hintLevel2: 'Each carry should only be added once.',
      hintLevel3: `Expected total is ${correctAnswer}.`,
    };
  }

  // General column arithmetic error
  return {
    isCorrect: false,
    errorType: 'column_arithmetic_error',
    message: 'Check your column additions starting from the ones on the right.',
    hintLevel1: 'Add the digits in the right-hand column first, then work left.',
    hintLevel2: `Look closely at ${num1 % 10} + ${num2 % 10}. Does it make 10 or more?`,
    hintLevel3: `The correct answer is ${correctAnswer}.`,
  };
}

function diagnoseSubtraction(
  problem: Problem,
  userAns: number,
  intermediateData?: Record<string, string>
): DiagnosticResult {
  const { num1, num2, correctAnswer } = problem;

  // Error: Smaller from larger without exchanging (e.g. 52 - 18 -> answered 46 or 44)
  const d1 = num1.toString().split('').map(Number).reverse();
  const d2 = num2.toString().padStart(num1.toString().length, '0').split('').map(Number).reverse();
  let naiveReversedStr = '';
  for (let i = 0; i < d1.length; i++) {
    naiveReversedStr = Math.abs((d1[i] || 0) - (d2[i] || 0)).toString() + naiveReversedStr;
  }
  const naiveVal = parseInt(naiveReversedStr, 10);

  if (userAns === naiveVal) {
    return {
      isCorrect: false,
      errorType: 'smaller_from_larger_without_exchange',
      message: "Remember: if the top digit is smaller than the bottom digit, you must exchange (borrow) from the left!",
      hintLevel1: 'You cannot subtract a bigger number from a smaller number without exchanging.',
      hintLevel2: 'Tap the top digit to cross it out and exchange 1 ten for 10 ones.',
      hintLevel3: `The correct answer is ${correctAnswer}.`,
    };
  }

  // Error: Forgot to reduce donor column after exchange (e.g. took 1 ten, but left donor digit unchanged)
  if (userAns === correctAnswer + 10 || userAns === correctAnswer + 100) {
    return {
      isCorrect: false,
      errorType: 'forgot_reduction_after_exchange',
      message: 'Did you forget to reduce the number you exchanged from by 1?',
      hintLevel1: 'When you take a ten, the column you borrowed from becomes 1 less.',
      hintLevel2: 'Check your crossed-out numbers on the top row.',
      hintLevel3: `The correct answer is ${correctAnswer}.`,
    };
  }

  return {
    isCorrect: false,
    errorType: 'subtraction_arithmetic_error',
    message: 'Check your subtraction column by column, starting from the ones on the right.',
    hintLevel1: 'Work from right to left. If you need more in a column, exchange from the column to the left.',
    hintLevel2: `Think: What is ${num1} take away ${num2}?`,
    hintLevel3: `The correct answer is ${correctAnswer}.`,
  };
}

function diagnoseMultiplication(
  problem: Problem,
  userAns: number,
  intermediateData?: Record<string, string>
): DiagnosticResult {
  const { num1, num2, correctAnswer } = problem;

  // Check 1: Long multiplication missing placeholder zero
  if (num2 >= 10) {
    const units = num2 % 10;
    const tens = Math.floor(num2 / 10);
    const p1 = num1 * units;
    const p2WithoutZero = num1 * tens; // forgot zero!
    const wrongSum = p1 + p2WithoutZero;

    if (userAns === wrongSum) {
      return {
        isCorrect: false,
        errorType: 'forgot_placeholder_zero',
        message: 'Don’t forget the placeholder zero (0) when multiplying by the tens digit!',
        hintLevel1: 'When you multiply by the tens digit, put a 0 in the ones place first.',
        hintLevel2: `In the second row, you are multiplying by ${tens * 10}, so it must end with 0.`,
        hintLevel3: `First line: ${num1} × ${units} = ${p1}. Second line: ${num1} × ${tens * 10} = ${p1 * 10}. Total: ${correctAnswer}.`,
      };
    }
  }

  // Check 2: Times table error vs carry error
  return {
    isCorrect: false,
    errorType: 'multiplication_error',
    message: 'Check your times table calculations and partial products.',
    hintLevel1: 'Break the calculation down: multiply by the ones first, then the tens.',
    hintLevel2: `Remember to add any carried numbers after multiplying, not before!`,
    hintLevel3: `The correct answer is ${correctAnswer}.`,
  };
}

function diagnoseDivision(
  problem: Problem,
  userAns: number,
  userRem: number,
  intermediateData?: Record<string, string>
): DiagnosticResult {
  const { num1, num2, correctAnswer, remainder = 0 } = problem;

  // Check 1: Missing zero in quotient trap (e.g. 618 ÷ 6 = 13 instead of 103)
  const expectedStr = correctAnswer.toString();
  const userStr = userAns.toString();
  if (expectedStr.includes('0') && userStr === expectedStr.replace(/0/g, '')) {
    return {
      isCorrect: false,
      errorType: 'missing_zero_in_quotient',
      message: `When the divisor doesn’t go into a digit, remember to write a 0 in the answer line!`,
      hintLevel1: `How many times does ${num2} go into that middle digit? If 0, write 0 on top before carrying.`,
      hintLevel2: `0 is a very important place-holder! ${num2} goes into the digit 0 times, carrying the full digit.`,
      hintLevel3: `The quotient is ${correctAnswer}${remainder > 0 ? ` r ${remainder}` : ''}.`,
    };
  }

  // Check 2: Remainder incorrect but quotient correct
  if (userAns === correctAnswer && userRem !== remainder) {
    return {
      isCorrect: false,
      errorType: 'incorrect_remainder',
      message: `The quotient is correct, but check your remainder: how much is left over at the end?`,
      hintLevel1: `Multiply ${userAns} × ${num2} = ${userAns * num2}. What is ${num1} − ${userAns * num2}?`,
      hintLevel2: `The leftover remainder should be smaller than ${num2}.`,
      hintLevel3: `The correct remainder is ${remainder}.`,
    };
  }

  // Check 3: Remainder larger than divisor
  if (userRem >= num2) {
    return {
      isCorrect: false,
      errorType: 'remainder_larger_than_divisor',
      message: `The remainder cannot be bigger than the divisor (${num2})! You can make another whole group.`,
      hintLevel1: `Check if you can divide by ${num2} one more time.`,
      hintLevel2: `Remainders must always be less than ${num2}.`,
      hintLevel3: `The answer is ${correctAnswer}${remainder > 0 ? ` r ${remainder}` : ''}.`,
    };
  }

  return {
    isCorrect: false,
    errorType: 'division_error',
    message: `Check how many times ${num2} fits into each digit, and carry any remainder forward.`,
    hintLevel1: `Work from left to right across the bus stop.`,
    hintLevel2: `Use the multiples of ${num2}: ${Array.from({ length: 6 }, (_, i) => (i + 1) * num2).join(', ')}...`,
    hintLevel3: `The correct answer is ${correctAnswer}${remainder > 0 ? ` r ${remainder}` : ''}.`,
  };
}

/**
 * Generates an inverse checking equation for Fix-It Mode.
 * e.g., for 452 - 128: checks whether (userAnswer + 128) equals 452.
 */
export function getInverseCheckString(problem: Problem, userAnswer: number): string {
  switch (problem.operation) {
    case 'addition':
      return `Inverse Check: ${userAnswer} − ${problem.num2} = ${userAnswer - problem.num2} (Does it equal ${problem.num1}?)`;
    case 'subtraction':
      return `Inverse Check: ${userAnswer} + ${problem.num2} = ${userAnswer + problem.num2} (Does it equal ${problem.num1}?)`;
    case 'multiplication':
      return `Inverse Check: Does ${userAnswer} ÷ ${problem.num2} equal ${problem.num1}?`;
    case 'division':
      return `Inverse Check: (${userAnswer} × ${problem.num2}) + ${problem.remainder || 0} = ${userAnswer * problem.num2 + (problem.remainder || 0)} (Does it equal ${problem.num1}?)`;
  }
}
