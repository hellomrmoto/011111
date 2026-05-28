export function americanToDecimal(american: number): number {
  if (american >= 100) {
    return 1 + american / 100;
  }
  return 1 + 100 / Math.abs(american);
}

export function americanToImpliedProb(american: number): number {
  if (american >= 100) {
    return 100 / (american + 100);
  }
  return Math.abs(american) / (Math.abs(american) + 100);
}

export function decimalToAmerican(decimal: number): number {
  if (decimal >= 2) {
    return Math.round((decimal - 1) * 100);
  }
  return Math.round(-100 / (decimal - 1));
}

export function impliedProbToAmerican(prob: number): number {
  if (prob <= 0 || prob >= 1) return 0;
  if (prob <= 0.5) {
    return Math.round(100 / prob - 100);
  }
  return Math.round(-100 * prob / (1 - prob));
}

export function validateAmerican(odds: number): boolean {
  return Number.isInteger(odds) && odds >= -100000 && odds <= 100000 && odds !== 0 && odds !== -100 + 1;
}
