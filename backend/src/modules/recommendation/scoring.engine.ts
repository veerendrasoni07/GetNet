import { FoodItem } from '../foods/food.types';
import { UserDietProfile } from '../profile/profile.types';
import { NutritionGap } from '../nutrition-gap/nutrition-gap.types';

export interface ScoredFoodItem {
  food: FoodItem;
  score: number;
  breakdown: {
    proteinEfficiencyScore: number;
    costEfficiencyScore: number;
    lifestyleScore: number;
    userPreferenceScore: number;
  };
}

export function scoreCandidateFoods(
  candidates: FoodItem[],
  profile: UserDietProfile,
  gap: NutritionGap
): ScoredFoodItem[] {
  const dailyBudget = profile.budget.dailyExtraBudget || 66.67;
  const isHostel = profile.lifestyle.livingSituation === 'hostel';
  const isBudgetConstrained = dailyBudget < 100;
  const isMuscleGain = profile.body.goal === 'muscle_gain';

  // Dynamic weight assignment
  const costWeight = isBudgetConstrained ? 0.35 : 0.20;
  const proteinWeight = isMuscleGain ? 0.40 : 0.25;
  const lifestyleWeight = isHostel ? 0.25 : 0.15;
  const preferenceWeight = 0.15;

  return candidates.map((food) => {
    // 1. Protein Efficiency Score (0 to 100)
    // High protein density (protein / calories) & high protein per rupee
    const proteinDensity = (food.proteinPer100Calories || 0) / 25; // normalized (25g protein per 100cal = 100%)
    const costPer10gPro = food.costPer10gProtein || 999;
    const costProteinScore = Math.max(0, 100 - costPer10gPro * 3);
    const proteinEfficiencyScore = Math.min(100, Math.round(proteinDensity * 50 + costProteinScore * 0.5));

    // 2. Cost Efficiency Score (0 to 100)
    const costPerServing = food.estimatedCostInr;
    const costEfficiencyScore = Math.max(0, 100 - (costPerServing / dailyBudget) * 100);

    // 3. Lifestyle / Practicality Score (0 to 100)
    let lifestyleScore = 70;
    if (food.hostelSuitability === 'excellent') lifestyleScore += 30;
    else if (food.hostelSuitability === 'good') lifestyleScore += 15;
    else if (food.hostelSuitability === 'poor') lifestyleScore -= 30;

    if (food.portability === 'high') lifestyleScore += 10;
    if (!food.cookingRequired) lifestyleScore += 10;

    lifestyleScore = Math.min(100, Math.max(0, lifestyleScore));

    // 4. User Preference Score
    let userPreferenceScore = 50;
    const dislikes = profile.preferences.dislikedFoods || [];
    if (dislikes.some((d) => food.name.toLowerCase().includes(d.toLowerCase()))) {
      userPreferenceScore = 0;
    }

    const finalScore = Number(
      (
        proteinEfficiencyScore * proteinWeight +
        costEfficiencyScore * costWeight +
        lifestyleScore * lifestyleWeight +
        userPreferenceScore * preferenceWeight
      ).toFixed(2)
    );

    return {
      food,
      score: finalScore,
      breakdown: {
        proteinEfficiencyScore,
        costEfficiencyScore: Math.round(costEfficiencyScore),
        lifestyleScore,
        userPreferenceScore,
      },
    };
  }).sort((a, b) => b.score - a.score);
}
