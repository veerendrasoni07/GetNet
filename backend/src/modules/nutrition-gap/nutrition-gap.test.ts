import { calculateNutritionGap } from './nutrition-gap.engine';
import { DetailedNutritionTarget } from '../nutrition/nutrition.types';
import { ExistingDietEstimate } from '../existing-diet/existing-diet.types';

describe('Nutrition Gap Engine', () => {
  it('correctly calculates the remaining gap to be solved by extra food optimizer', () => {
    const target: DetailedNutritionTarget = {
      bmr: 1500,
      tdee: 2250,
      calories: { target: 2500, min: 2375, max: 2625 },
      protein: { target: 125, min: 112, max: 137 },
      carbohydrates: { target: 300, min: 270, max: 330 },
      fat: { target: 70, min: 60, max: 80 },
      fiber: { target: 35 },
      waterMl: 2600,
    };

    const existing: ExistingDietEstimate = {
      totalReliableCalories: 1900,
      totalReliableProtein: 55,
      totalReliableCarbs: 230,
      totalReliableFat: 45,
      mealEstimates: [
        {
          mealName: 'lunch',
          caloriesRange: { min: 650, max: 850 },
          proteinRange: { min: 18, max: 27 },
          carbsRange: { min: 90, max: 120 },
          fatRange: { min: 15, max: 25 },
          reliableCalories: 950,
          reliableProtein: 28,
          reliableCarbs: 115,
          reliableFat: 23,
        },
        {
          mealName: 'dinner',
          caloriesRange: { min: 650, max: 850 },
          proteinRange: { min: 18, max: 27 },
          carbsRange: { min: 90, max: 120 },
          fatRange: { min: 15, max: 25 },
          reliableCalories: 950,
          reliableProtein: 27,
          reliableCarbs: 115,
          reliableFat: 22,
        },
      ],
    };

    const gap = calculateNutritionGap(target, existing);

    expect(gap.caloriesGap).toBe(600); // 2500 - 1900
    expect(gap.proteinGap).toBe(70);   // 125 - 55
    expect(gap.carbsGap).toBe(70);     // 300 - 230
    expect(gap.fatGap).toBe(25);       // 70 - 45
  });
});
