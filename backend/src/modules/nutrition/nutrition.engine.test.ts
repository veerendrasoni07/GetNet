import { describe, expect, it } from 'vitest';

import {
  calculateNutritionTarget,
} from './nutrition.engine';

import {
  NutritionProfile,
} from './nutrition.types';

describe('Nutrition Engine', () => {
  it('calculates a nutrition target for a valid profile', () => {
    const profile: NutritionProfile = {
      age: 25,
      sex: 'male',

      heightCm: 175,
      weightKg: 70,
      targetWeightKg: 85,

      activityLevel: 'moderate',
      goal: 'muscle_gain',

      dietType: 'eggetarian',

      dailyBudget: 100,
      mealsPerDay: 4,

      cookingTimeMinutes: 30,

      allergies: [],
      dislikedFoods: [],
      preferredFoods: [],
    };

    const result =
      calculateNutritionTarget(profile);

    expect(result.calories.target)
      .toBeGreaterThan(0);

    expect(result.protein.target)
      .toBeGreaterThan(0);

    expect(result.carbohydrates.target)
      .toBeGreaterThan(0);

    expect(result.fat.target)
      .toBeGreaterThan(0);

    expect(result.fiber.target)
      .toBeGreaterThan(0);

    expect(result.waterMl)
      .toBeGreaterThan(0);
  });
});