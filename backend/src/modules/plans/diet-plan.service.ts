import { filterFoodsForUser } from '../constraints/constraint.engine';
import { calculateExistingDiet } from '../existing-diet/existing-diet.engine';
import { MessMealSelection } from '../existing-diet/existing-diet.types';
import { getAllFoods } from '../foods/food.repository';
import { FoodItem } from '../foods/food.types';
import { calculateNutritionGap } from '../nutrition-gap/nutrition-gap.engine';
import { calculateNutritionTarget } from '../nutrition/nutrition.engine';
import { optimizeDietPlan, OptimizationResult } from '../optimizer/diet.optimizer';
import { UserDietProfile } from '../profile/profile.types';
import { scoreCandidateFoods } from '../recommendation/scoring.engine';
import { generateDailySchedule, DailyDietSchedule } from '../schedule/schedule.engine';

export interface CompleteDietPlanResponse {
  nutritionTarget: ReturnType<typeof calculateNutritionTarget>;
  existingDietEstimate: ReturnType<typeof calculateExistingDiet>;
  nutritionGap: ReturnType<typeof calculateNutritionGap>;
  optimizationResult: OptimizationResult;
  dailySchedule: DailyDietSchedule;
}

export interface SubstitutionOption {
  replacementFood: FoodItem;
  servings: number;
  calories: number;
  protein: number;
  dailyCostInr: number;
  costDeltaInr: number; // e.g. +7 or -3
  costDeltaText: string; // "+₹7/day"
  reasons: string[];
}

export function generateCompleteDietPlan(
  profile: UserDietProfile,
  messSelections: MessMealSelection[]
): CompleteDietPlanResponse {
  // 1. Calculate Nutrition Targets
  const nutritionTarget = calculateNutritionTarget(profile.body, profile.training);

  // 2. Estimate Mess/Existing Food Baseline
  const existingDietEstimate = calculateExistingDiet(
    { meals: messSelections },
    profile.body.goal
  );

  // 3. Calculate Missing Nutrition Gap
  const nutritionGap = calculateNutritionGap(nutritionTarget, existingDietEstimate);

  // 4. Get & Filter Candidate Foods against constraints
  const allFoods = getAllFoods();
  const { allowedFoods } = filterFoodsForUser(allFoods, profile);

  // 5. Score Allowed Foods
  const scoredFoods = scoreCandidateFoods(allowedFoods, profile, nutritionGap);

  // 6. Optimize Food Allocation within Budget
  const dailyBudget = profile.budget.dailyExtraBudget || 66.67;
  const optimizationResult = optimizeDietPlan(scoredFoods, nutritionGap, dailyBudget);

  // 7. Generate Time-Slotted Daily Schedule
  const dailySchedule = generateDailySchedule(
    profile.schedule,
    existingDietEstimate,
    optimizationResult,
    messSelections,
    profile.body.goal,
    nutritionTarget.calories.target,
    nutritionTarget.protein.target
  );

  return {
    nutritionTarget,
    existingDietEstimate,
    nutritionGap,
    optimizationResult,
    dailySchedule,
  };
}

export function substituteFoodItem(
  profile: UserDietProfile,
  targetFoodId: string,
  currentSelectedFoodIds: string[]
): SubstitutionOption[] {
  const allFoods = getAllFoods();
  const { allowedFoods } = filterFoodsForUser(allFoods, profile);
  const targetFood = allFoods.find((f) => f.id === targetFoodId);

  if (!targetFood) {
    throw new Error(`Target food item with ID '${targetFoodId}' not found.`);
  }

  // Filter candidates excluding targetFood and currently selected foods
  const candidates = allowedFoods.filter(
    (f) => f.id !== targetFoodId && !currentSelectedFoodIds.includes(f.id)
  );

  const options: SubstitutionOption[] = [];

  for (const candidate of candidates) {
    // Determine serving ratio to match protein/calories of target food
    const proteinRatio = candidate.protein > 0 ? targetFood.protein / candidate.protein : 1;
    const servings = Math.max(0.5, Number((proteinRatio).toFixed(1)));

    const itemCost = Number((servings * candidate.estimatedCostInr).toFixed(2));
    const costDelta = Number((itemCost - targetFood.estimatedCostInr).toFixed(2));
    const costDeltaText = costDelta >= 0 ? `+₹${costDelta}/day` : `-₹${Math.abs(costDelta)}/day`;

    options.push({
      replacementFood: candidate,
      servings,
      calories: Math.round(servings * candidate.calories),
      protein: Math.round(servings * candidate.protein),
      dailyCostInr: itemCost,
      costDeltaInr: costDelta,
      costDeltaText,
      reasons: [
        `Preserves ~${Math.round(targetFood.protein)}g protein`,
        costDelta <= 0 ? 'Cost effective option' : 'Slightly higher cost',
        !candidate.cookingRequired ? 'Ready to eat' : 'Fits equipment',
      ],
    });
  }

  // Sort by closest protein/calorie match and cost
  return options.sort((a, b) => Math.abs(a.protein - targetFood.protein) - Math.abs(b.protein - targetFood.protein)).slice(0, 4);
}
