import { evaluateAdaptiveProgress } from './adaptive-diet.engine';
import { calculateWeightTrend } from '../tracking/weight-trend.engine';

describe('Adaptive Coach & Weight Trend Engine', () => {
  it('calculates 7-day weight trend correctly filtering daily fluctuations', () => {
    const prevWeek = [
      { date: '2026-09-01', weightKg: 60.0 },
      { date: '2026-09-02', weightKg: 60.4 },
      { date: '2026-09-03', weightKg: 59.9 },
      { date: '2026-09-04', weightKg: 60.2 },
      { date: '2026-09-05', weightKg: 60.1 },
    ];

    const currWeek = [
      { date: '2026-09-08', weightKg: 60.3 },
      { date: '2026-09-09', weightKg: 60.5 },
      { date: '2026-09-10', weightKg: 60.2 },
      { date: '2026-09-11', weightKg: 60.4 },
      { date: '2026-09-12', weightKg: 60.35 },
    ];

    const trend = calculateWeightTrend(prevWeek, currWeek);
    expect(trend.weeklyChangeKg).toBe(0.23);
    expect(trend.trendDirection).toBe('gaining');
  });

  it('makes micro calorie boost for muscle gain when adherence is high but weight stagnated', () => {
    const result = evaluateAdaptiveProgress({
      goal: 'muscle_gain',
      weightTrend: { previousWeekAverageKg: 60.0, currentWeekAverageKg: 60.05, weeklyChangeKg: 0.05, trendDirection: 'stable' },
      adherencePercentage: 92,
      currentCalories: 2500,
    });

    expect(result.status).toBe('adjusted_calories');
    expect(result.microAdjustment?.calorieChange).toBe(130);
    expect(result.adviceMessage).toContain('micro-adjustment');
  });

  it('does NOT increase calories when adherence is poor, suggesting schedule adjustment instead', () => {
    const result = evaluateAdaptiveProgress({
      goal: 'muscle_gain',
      weightTrend: { previousWeekAverageKg: 60.0, currentWeekAverageKg: 60.0, weeklyChangeKg: 0.0, trendDirection: 'stable' },
      adherencePercentage: 55, // Low completion
      frequentlySkippedSlot: '11 AM Snack',
      currentCalories: 2500,
    });

    expect(result.status).toBe('adjusted_schedule');
    expect(result.microAdjustment).toBeUndefined(); // No calorie increase!
    expect(result.rescheduledSlotSuggestion?.originalSlot).toBe('11 AM Snack');
  });
});
