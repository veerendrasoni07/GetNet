import { Goal } from '../profile/profile.types';
import { WeightTrendResult } from '../tracking/weight-trend.engine';

export interface AdaptiveEvaluationInput {
  goal: Goal;
  weightTrend: WeightTrendResult;
  adherencePercentage: number; // 0 to 100
  frequentlySkippedSlot?: string; // e.g. "11 AM Snack"
  currentCalories: number;
}

export interface MicroAdjustment {
  calorieChange: number; // e.g. +120 or -150
  actionSummary: string; // e.g. "Add 1 Banana to Pre-Workout snack"
  suggestedFoodAddition?: string;
}

export interface AdaptiveEvaluationResult {
  status: 'on_track' | 'adjusted_calories' | 'adjusted_schedule' | 'insufficient_adherence';
  headline: string;
  adviceMessage: string;
  microAdjustment?: MicroAdjustment;
  rescheduledSlotSuggestion?: {
    originalSlot: string;
    newSlot: string;
  };
}

export function evaluateAdaptiveProgress(input: AdaptiveEvaluationInput): AdaptiveEvaluationResult {
  const { goal, weightTrend, adherencePercentage, frequentlySkippedSlot, currentCalories } = input;

  const isAdherenceHigh = adherencePercentage >= 75;

  // 1. Muscle Gain Goal Evaluation
  if (goal === 'muscle_gain') {
    if (weightTrend.weeklyChangeKg >= 0.15 && weightTrend.weeklyChangeKg <= 0.45) {
      return {
        status: 'on_track',
        headline: 'Progress On Track! 💪',
        adviceMessage: `Your weight is increasing steadily at +${weightTrend.weeklyChangeKg} kg/week with ${adherencePercentage}% diet adherence. Keep following your current plan!`,
      };
    }

    if (weightTrend.weeklyChangeKg < 0.15) {
      if (isAdherenceHigh) {
        // High adherence but not gaining weight -> micro calorie boost (+120-150 kcal)
        return {
          status: 'adjusted_calories',
          headline: 'Increasing Calories (+130 kcal/day)',
          adviceMessage: `You logged ${adherencePercentage}% meal adherence, but your weight remained stable. We added a micro-adjustment (+1 banana or +250ml milk) to fuel muscle growth without blowing up your routine.`,
          microAdjustment: {
            calorieChange: 130,
            actionSummary: 'Add 1 Banana (or 250ml Milk) to Pre-Workout snack',
            suggestedFoodAddition: 'food_banana_2',
          },
        };
      } else {
        // Low adherence -> DO NOT increase calories! Reschedule or simplify
        const skipped = frequentlySkippedSlot || 'Mid-morning snack';
        return {
          status: 'adjusted_schedule',
          headline: 'Simplifying Your Schedule ⏱️',
          adviceMessage: `Your target diet is adequate, but your meal completion was ${adherencePercentage}%. You frequently skipped the ${skipped}. Let's move that food to your Evening Snack slot when it's easier to eat.`,
          rescheduledSlotSuggestion: {
            originalSlot: skipped,
            newSlot: 'Evening / Post-Workout Snack',
          },
        };
      }
    }
  }

  // 2. Fat Loss Goal Evaluation
  if (goal === 'fat_loss') {
    if (weightTrend.weeklyChangeKg <= -0.20 && weightTrend.weeklyChangeKg >= -0.75) {
      return {
        status: 'on_track',
        headline: 'Great Fat Loss Progress! 🔥',
        adviceMessage: `You lost ${Math.abs(weightTrend.weeklyChangeKg)} kg this week with ${adherencePercentage}% adherence. Your current plan is working optimally.`,
      };
    }

    if (weightTrend.weeklyChangeKg > -0.15) {
      if (isAdherenceHigh) {
        return {
          status: 'adjusted_calories',
          headline: 'Adjusting Deficit (-150 kcal/day)',
          adviceMessage: `With ${adherencePercentage}% adherence, weight loss stagnated. We made a small micro-reduction (-150 kcal) by adjusting snack portion sizes while keeping protein intact.`,
          microAdjustment: {
            calorieChange: -150,
            actionSummary: 'Reduce snack portion slightly while maintaining protein intake',
          },
        };
      } else {
        return {
          status: 'insufficient_adherence',
          headline: 'Focusing on Diet Consistency 🎯',
          adviceMessage: `Your target deficit is correct, but completion was ${adherencePercentage}%. Stick to the current plan for another week before making any target changes.`,
        };
      }
    }
  }

  // Default maintenance / recomposition on track
  return {
    status: 'on_track',
    headline: 'Body Composition On Track 🎯',
    adviceMessage: `Your weight trend (${weightTrend.weeklyChangeKg >= 0 ? '+' : ''}${weightTrend.weeklyChangeKg} kg/week) matches your goal. Continue consistent training and nutrition.`,
  };
}

/** Plateau detection monitors weight trend variance and triggers metabolic adjustments. */
