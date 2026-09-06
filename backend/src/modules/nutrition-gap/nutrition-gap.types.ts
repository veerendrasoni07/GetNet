export interface NutritionGap {
  targetCalories: number;
  existingCalories: number;
  caloriesGap: number;

  targetProtein: number;
  existingProtein: number;
  proteinGap: number;

  targetCarbs: number;
  existingCarbs: number;
  carbsGap: number;

  targetFat: number;
  existingFat: number;
  fatGap: number;

  targetFiber: number;
  existingFiber: number;
  fiberGap: number;
}
