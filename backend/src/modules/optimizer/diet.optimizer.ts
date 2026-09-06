import { FoodItem } from '../foods/food.types';
import { NutritionGap } from '../nutrition-gap/nutrition-gap.types';
import { ScoredFoodItem } from '../recommendation/scoring.engine';

export interface SelectedFoodItem {
  food: FoodItem;
  servings: number;
  totalCostInr: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  reasons: string[];
}

export interface OptimizationResult {
  selectedItems: SelectedFoodItem[];
  dailyCostInr: number;
  monthlyCostInr: number;
  dailyBudgetInr: number;
  monthlyBudgetInr: number;
  achievedCalories: number;
  achievedProtein: number;
  achievedCarbs: number;
  achievedFat: number;
  achievedFiber: number;
  budgetStatus: 'under_budget' | 'on_budget' | 'budget_gap';
  budgetAnalysisMessage: string;
}

export function optimizeDietPlan(
  scoredFoods: ScoredFoodItem[],
  gap: NutritionGap,
  dailyBudget: number
): OptimizationResult {
  const selectedItems: SelectedFoodItem[] = [];
  let remainingBudget = dailyBudget;
  let remainingProteinGap = gap.proteinGap;
  let remainingCaloriesGap = gap.caloriesGap;

  let achievedCalories = 0;
  let achievedProtein = 0;
  let achievedCarbs = 0;
  let achievedFat = 0;
  let achievedFiber = 0;

  // Heuristic knapsack loop over scored foods
  for (const item of scoredFoods) {
    if (remainingBudget <= 2) break; // budget exhausted
    if (remainingProteinGap <= 3 && remainingCaloriesGap <= 50) break; // target fulfilled

    const food = item.food;
    const costPerServing = food.estimatedCostInr;

    if (costPerServing > remainingBudget) continue;

    // Calculate maximum servings allowed by budget and daily limits
    const maxServingsByBudget = Math.floor(remainingBudget / costPerServing);
    const maxServingsLimit = food.maxServingsPerDay || 2;
    const chosenServings = Math.min(maxServingsByBudget, maxServingsLimit);

    if (chosenServings <= 0) continue;

    const itemCost = chosenServings * costPerServing;
    const itemCal = chosenServings * food.calories;
    const itemPro = chosenServings * food.protein;
    const itemCarb = chosenServings * food.carbs;
    const itemFat = chosenServings * food.fat;
    const itemFiber = chosenServings * food.fiber;

    // Generate practical human-readable metadata reasons (Step 27 rule)
    const reasons: string[] = [];
    if (food.costPer10gProtein && food.costPer10gProtein < 20) reasons.push('high protein per rupee');
    if (!food.cookingRequired) reasons.push('no cooking required');
    if (food.hostelSuitability === 'excellent') reasons.push('fits hostel lifestyle');
    if (food.portability === 'high') reasons.push('highly portable snack');

    selectedItems.push({
      food,
      servings: chosenServings,
      totalCostInr: itemCost,
      totalCalories: itemCal,
      totalProtein: itemPro,
      totalCarbs: itemCarb,
      totalFat: itemFat,
      totalFiber: itemFiber,
      reasons,
    });

    remainingBudget -= itemCost;
    remainingProteinGap -= itemPro;
    remainingCaloriesGap -= itemCal;

    achievedCalories += itemCal;
    achievedProtein += itemPro;
    achievedCarbs += itemCarb;
    achievedFat += itemFat;
    achievedFiber += itemFiber;
  }

  const dailyCost = Number(selectedItems.reduce((s, i) => s + i.totalCostInr, 0).toFixed(2));
  const monthlyCost = Math.round(dailyCost * 30);
  const monthlyBudget = Math.round(dailyBudget * 30);

  let budgetStatus: OptimizationResult['budgetStatus'] = 'under_budget';
  let budgetAnalysisMessage = '';

  if (remainingProteinGap > 10) {
    budgetStatus = 'budget_gap';
    const missingProtein = Math.round(remainingProteinGap);
    // Estimate cost per 10g protein average (~₹20) to close gap
    const extraMonthlyCostNeeded = Math.round((missingProtein / 10) * 20 * 30);

    budgetAnalysisMessage = `Target nutrition cannot be fully achieved at ₹${monthlyBudget}/month. Current best plan provides ${Math.round(gap.existingProtein + achievedProtein)}g protein/day (Target: ${gap.targetProtein}g/day). Adding ~₹${extraMonthlyCostNeeded}/month to budget would close the ${missingProtein}g/day protein gap.`;
  } else if (dailyCost < dailyBudget - 2) {
    budgetStatus = 'under_budget';
    const underMonthly = monthlyBudget - monthlyCost;
    budgetAnalysisMessage = `Your plan costs ₹${monthlyCost}/month, which is ₹${underMonthly} under your ₹${monthlyBudget}/month budget!`;
  } else {
    budgetStatus = 'on_budget';
    budgetAnalysisMessage = `Your plan fits perfectly within your ₹${monthlyBudget}/month extra food budget!`;
  }

  return {
    selectedItems,
    dailyCostInr: dailyCost,
    monthlyCostInr: monthlyCost,
    dailyBudgetInr: dailyBudget,
    monthlyBudgetInr: monthlyBudget,
    achievedCalories,
    achievedProtein,
    achievedCarbs,
    achievedFat,
    achievedFiber,
    budgetStatus,
    budgetAnalysisMessage,
  };
}
