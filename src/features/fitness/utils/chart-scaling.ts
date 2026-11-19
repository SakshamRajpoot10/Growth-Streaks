/**
 * Dynamic "nice number" algorithm for chart axis scaling.
 * Complies with Part 8 of Master Engineering Directive:
 * Adapts to actual data and configured goals using clean intervals (1, 2, 2.5, 5, 10 * 10^k).
 * Prevents hardcoded axes (e.g. 0, 50, 100) and ensures goal lines are never clipped.
 */
export interface NiceScaleResult {
  top: number;
  ticks: number[];
}

export function calculateNiceScale(
  actualMax: number,
  goalValue?: number | null
): NiceScaleResult {
  const validGoal = goalValue && goalValue > 0 ? goalValue : 0;
  const target = Math.max(actualMax, validGoal);

  if (target <= 0) {
    return { top: 100, ticks: [100, 50, 0] };
  }

  // Determine order of magnitude
  const exponent = Math.floor(Math.log10(target));
  const fraction = target / Math.pow(10, exponent);

  let niceFraction = 10;
  if (fraction <= 1.0) niceFraction = 1.0;
  else if (fraction <= 2.0) niceFraction = 2.0;
  else if (fraction <= 2.5) niceFraction = 2.5;
  else if (fraction <= 5.0) niceFraction = 5.0;
  else if (fraction <= 7.5) niceFraction = 7.5;
  else niceFraction = 10.0;

  let top = Math.round(niceFraction * Math.pow(10, exponent));

  // If rounding or target boundary caused top to be less than target, advance one tier
  if (top < target) {
    top = Math.round(10 * Math.pow(10, exponent));
  }

  const mid = Math.round(top / 2);
  return {
    top,
    ticks: [top, mid, 0],
  };
}
