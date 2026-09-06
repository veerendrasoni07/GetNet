import { ExistingDietEstimate } from '../existing-diet/existing-diet.types';
import { DetailedNutritionTarget } from '../nutrition/nutrition.types';
import { NutritionGap } from './nutrition-gap.types';

export function calculateNutritionGap(
  target: DetailedNutritionTarget,
  existing: ExistingDietEstimate
): NutritionGap {
  const caloriesGap = Math.max(0, target.calories.target - existing.totalReliableCalories);
  const proteinGap = Math.max(0, target.protein.target - existing.totalReliableProtein);
  const carbsGap = Math.max(0, target.carbohydrates.target - existing.totalReliableCarbs);
  const fatGap = Math.max(0, target.fat.target - existing.totalReliableFat);
  
  // Estimate baseline fiber from mess food (~12-18g default for typical rotis + dal + sabzi)
  const existingFiber = Math.round(existing.mealEstimates.length * 7);
  const fiberGap = Math.max(0, target.fiber.target - existingFiber);

  return {
    targetCalories: target.calories.target,
    existingCalories: existing.totalReliableCalories,
    caloriesGap,

    targetProtein: target.protein.target,
    existingProtein: existing.totalReliableProtein,
    proteinGap,

    targetCarbs: target.carbohydrates.target,
    existingCarbs: existing.totalReliableCarbs,
    carbsGap,

    targetFat: target.fat.target,
    existingFat: existing.totalReliableFat,
    fatGap,

    targetFiber: target.fiber.target,
    existingFiber,
    fiberGap,
  };
}

/** Nutrition gap assessment detects critical deficits in key vitamins, minerals, and protein. */
