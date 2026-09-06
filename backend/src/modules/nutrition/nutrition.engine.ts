import {
  ActivityLevel,
  Goal,
  NutritionProfile,
  NutritionTarget,
} from './nutrition.types';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  very_high: 1.9,
};

function calculateBmr(profile: NutritionProfile): number {
  const { weightKg, heightCm, age, sex } = profile;

  const base =
    10 * weightKg +
    6.25 * heightCm -
    5 * age;

  return sex === 'male'
    ? base + 5
    : base - 161;
}

function calculateTdee(
  bmr: number,
  activityLevel: ActivityLevel,
): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

function calculateGoalCalories(
  tdee: number,
  goal: Goal,
): number {
  switch (goal) {
    case 'fat_loss':
      return tdee - 400;

    case 'muscle_gain':
      return tdee + 250;

    case 'maintenance':
      return tdee;
  }
}

function calculateProtein(
  weightKg: number,
  goal: Goal,
): number {
  switch (goal) {
    case 'fat_loss':
      return weightKg * 1.8;

    case 'muscle_gain':
      return weightKg * 2.0;

    case 'maintenance':
      return weightKg * 1.6;
  }
}

function calculateFat(
  weightKg: number,
): number {
  return weightKg * 0.8;
}

function calculateCarbohydrates(
  calories: number,
  protein: number,
  fat: number,
): number {
  const proteinCalories = protein * 4;
  const fatCalories = fat * 9;

  const remainingCalories =
    calories -
    proteinCalories -
    fatCalories;

  return Math.max(0, remainingCalories / 4);
}

function calculateFiber(
  calories: number,
): number {
  return (calories / 1000) * 14;
}

function calculateWater(
  weightKg: number,
): number {
  return weightKg * 35;
}

export function calculateNutritionTarget(
  profile: NutritionProfile,
): NutritionTarget {
  const bmr = calculateBmr(profile);

  const tdee = calculateTdee(
    bmr,
    profile.activityLevel,
  );

  const calories = calculateGoalCalories(
    tdee,
    profile.goal,
  );

  const protein = calculateProtein(
    profile.weightKg,
    profile.goal,
  );

  const fat = calculateFat(
    profile.weightKg,
  );

  const carbohydrates = calculateCarbohydrates(
    calories,
    protein,
    fat,
  );

  const fiber = calculateFiber(calories);

  const waterMl = calculateWater(
    profile.weightKg,
  );

  return {
    calories: {
      target: Math.round(calories),
      min: Math.round(calories * 0.95),
      max: Math.round(calories * 1.05),
    },

    protein: {
      target: Math.round(protein),
      min: Math.round(protein * 0.9),
      max: Math.round(protein * 1.1),
    },

    carbohydrates: {
      target: Math.round(carbohydrates),
      min: Math.round(carbohydrates * 0.9),
      max: Math.round(carbohydrates * 1.1),
    },

    fat: {
      target: Math.round(fat),
      min: Math.round(fat * 0.9),
      max: Math.round(fat * 1.1),
    },

    fiber: {
      target: Math.round(fiber),
    },

    waterMl: Math.round(waterMl),
  };
}