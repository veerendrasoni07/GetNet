export type Sex = 'male' | 'female';

export type Goal =
  | 'fat_loss'
  | 'maintenance'
  | 'muscle_gain';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'high'
  | 'very_high';

export type DietType =
  | 'omnivore'
  | 'vegetarian'
  | 'vegan'
  | 'eggetarian';

export interface NutritionProfile {
  age: number;
  sex: Sex;

  heightCm: number;
  weightKg: number;
  targetWeightKg: number;

  activityLevel: ActivityLevel;
  goal: Goal;

  dietType: DietType;

  dailyBudget: number;
  mealsPerDay: number;

  cookingTimeMinutes: number;

  allergies: string[];
  dislikedFoods: string[];
  preferredFoods: string[];
}

export interface NutritionTarget {
  calories: {
    target: number;
    min: number;
    max: number;
  };

  protein: {
    target: number;
    min: number;
    max: number;
  };

  carbohydrates: {
    target: number;
    min: number;
    max: number;
  };

  fat: {
    target: number;
    min: number;
    max: number;
  };

  fiber: {
    target: number;
  };

  waterMl: number;
}