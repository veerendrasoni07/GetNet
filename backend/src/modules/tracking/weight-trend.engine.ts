export interface WeightEntry {
  date: string; // YYYY-MM-DD
  weightKg: number;
}

export interface WeightTrendResult {
  previousWeekAverageKg: number;
  currentWeekAverageKg: number;
  weeklyChangeKg: number; // e.g. +0.23 or -0.40
  trendDirection: 'gaining' | 'losing' | 'stable';
}

export function calculateWeightTrend(
  previousWeekEntries: WeightEntry[],
  currentWeekEntries: WeightEntry[]
): WeightTrendResult {
  const prevSum = previousWeekEntries.reduce((sum, e) => sum + e.weightKg, 0);
  const prevAvg = previousWeekEntries.length > 0 ? prevSum / previousWeekEntries.length : 0;

  const currSum = currentWeekEntries.reduce((sum, e) => sum + e.weightKg, 0);
  const currAvg = currentWeekEntries.length > 0 ? currSum / currentWeekEntries.length : 0;

  const weeklyChangeKg = Number((currAvg - prevAvg).toFixed(2));

  let trendDirection: WeightTrendResult['trendDirection'] = 'stable';
  if (weeklyChangeKg >= 0.15) {
    trendDirection = 'gaining';
  } else if (weeklyChangeKg <= -0.15) {
    trendDirection = 'losing';
  }

  return {
    previousWeekAverageKg: Number(prevAvg.toFixed(2)),
    currentWeekAverageKg: Number(currAvg.toFixed(2)),
    weeklyChangeKg,
    trendDirection,
  };
}
