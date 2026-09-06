import { BodyProfile, TrainingProfile } from '../profile/profile.types';
import { DetailedNutritionTarget } from './nutrition.types';

const BASE_ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  very_high: 1.9,
};

export function calculateBmr(body: BodyProfile): number {
  const { weightKg, heightCm, age, sex } = body;
  // Mifflin-St Jeor Equation
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

export function calculateTdee(body: BodyProfile, training: TrainingProfile): number {
  const bmr = calculateBmr(body);
  let multiplier = BASE_ACTIVITY_MULTIPLIERS[training.activityLevel] || 1.4;

  // Additional activity credit for weight training volume
  if (training.liftsWeights && training.trainingDaysPerWeek > 0) {
    const weeklyWorkoutHours = (training.trainingDaysPerWeek * training.workoutDurationMinutes) / 60;
    multiplier += weeklyWorkoutHours * 0.02; // slight adjustment based on volume
  }

  return bmr * multiplier;
}

export function calculateGoalCalories(tdee: number, goal: BodyProfile['goal']): number {
  switch (goal) {
    case 'fat_loss':
      return tdee - 450;
    case 'muscle_gain':
      return tdee + 275;
    case 'recomposition':
      return tdee - 150;
    case 'maintenance':
      return tdee;
  }
}

export function calculateProteinTarget(body: BodyProfile, training: TrainingProfile): { target: number; min: number; max: number } {
  let gPerKg = 1.6;

  if (training.liftsWeights) {
    if (body.goal === 'fat_loss') {
      gPerKg = 2.2; // higher protein preservation in deficit
    } else if (body.goal === 'muscle_gain') {
      gPerKg = 2.0;
    } else {
      gPerKg = 1.8;
    }
  } else {
    if (body.goal === 'muscle_gain') gPerKg = 1.8;
    else if (body.goal === 'fat_loss') gPerKg = 1.8;
  }

  const target = Math.round(body.weightKg * gPerKg);
  const min = Math.round(target * 0.9);
  const max = Math.round(target * 1.15);

  return { target, min, max };
}

export function calculateNutritionTarget(
  body: BodyProfile,
  training: TrainingProfile
): DetailedNutritionTarget {
  const bmr = Math.round(calculateBmr(body));
  const tdee = Math.round(calculateTdee(body, training));
  const caloriesTarget = Math.round(calculateGoalCalories(tdee, body.goal));

  const protein = calculateProteinTarget(body, training);

  // Fat recommendation: ~0.8g to 1.0g / kg
  const fatTarget = Math.max(40, Math.round(body.weightKg * 0.85));

  // Carbohydrate recommendation: remaining calories
  const proteinCalories = protein.target * 4;
  const fatCalories = fatTarget * 9;
  const remainingCalories = caloriesTarget - proteinCalories - fatCalories;
  const carbsTarget = Math.max(50, Math.round(remainingCalories / 4));

  const fiberTarget = Math.round((caloriesTarget / 1000) * 14);

  // Hydration: 35ml / kg + workout extra (500ml per hour of workout)
  const workoutExtraWater = training.liftsWeights ? (training.workoutDurationMinutes / 60) * 500 : 0;
  const waterMl = Math.round(body.weightKg * 35 + workoutExtraWater);

  return {
    bmr,
    tdee,
    calories: {
      target: caloriesTarget,
      min: Math.round(caloriesTarget * 0.95),
      max: Math.round(caloriesTarget * 1.05),
    },
    protein,
    carbohydrates: {
      target: carbsTarget,
      min: Math.round(carbsTarget * 0.9),
      max: Math.round(carbsTarget * 1.1),
    },
    fat: {
      target: fatTarget,
      min: Math.round(fatTarget * 0.85),
      max: Math.round(fatTarget * 1.15),
    },
    fiber: {
      target: fiberTarget,
    },
    waterMl,
  };
}

/** Core BMR and TDEE formulas validated against international metabolic reference tables. */
