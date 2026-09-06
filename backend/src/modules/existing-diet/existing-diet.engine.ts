import { Goal } from '../profile/profile.types';
import {
  BowlPortion,
  EstimatedMealNutrition,
  ExistingDietEstimate,
  MessDietInput,
  MessMealSelection,
  RotiPortion,
  SabziPortion,
} from './existing-diet.types';

const RICE_NUTRIENTS: Record<BowlPortion, { cal: [number, number]; pro: [number, number]; carb: [number, number]; fat: [number, number] }> = {
  none: { cal: [0, 0], pro: [0, 0], carb: [0, 0], fat: [0, 0] },
  half: { cal: [110, 140], pro: [2.5, 3], carb: [24, 30], fat: [0.5, 1] },
  medium: { cal: [200, 250], pro: [4, 5.5], carb: [44, 55], fat: [1, 2] },
  large: { cal: [320, 390], pro: [6.5, 8.5], carb: [70, 85], fat: [1.5, 3] },
};

const DAL_NUTRIENTS: Record<BowlPortion, { cal: [number, number]; pro: [number, number]; carb: [number, number]; fat: [number, number] }> = {
  none: { cal: [0, 0], pro: [0, 0], carb: [0, 0], fat: [0, 0] },
  half: { cal: [60, 85], pro: [3, 4.5], carb: [9, 13], fat: [1.5, 3] },
  medium: { cal: [120, 160], pro: [6, 9], carb: [18, 25], fat: [3, 5] },
  large: { cal: [190, 250], pro: [10, 14], carb: [28, 38], fat: [5, 8] },
};

const SABZI_NUTRIENTS: Record<SabziPortion, { cal: [number, number]; pro: [number, number]; carb: [number, number]; fat: [number, number] }> = {
  small: { cal: [70, 100], pro: [1.5, 2.5], carb: [8, 12], fat: [4, 6] },
  medium: { cal: [130, 180], pro: [2.5, 4.5], carb: [14, 20], fat: [7, 11] },
  large: { cal: [190, 260], pro: [4, 6.5], carb: [20, 30], fat: [11, 16] },
};

export function estimateMessMealNutrition(
  selection: MessMealSelection,
  goal: Goal
): EstimatedMealNutrition {
  // Roti calculation
  const rotiCount = selection.rotiCount || 0;
  let calMin = rotiCount * 80;
  let calMax = rotiCount * 100;
  let proMin = rotiCount * 2.5;
  let proMax = rotiCount * 3.5;
  let carbMin = rotiCount * 15;
  let carbMax = rotiCount * 18;
  let fatMin = rotiCount * 1;
  let fatMax = rotiCount * 2.5;

  // Rice calculation
  const rice = RICE_NUTRIENTS[selection.ricePortion || 'none'];
  calMin += rice.cal[0]; calMax += rice.cal[1];
  proMin += rice.pro[0]; proMax += rice.pro[1];
  carbMin += rice.carb[0]; carbMax += rice.carb[1];
  fatMin += rice.fat[0]; fatMax += rice.fat[1];

  // Dal calculation
  const dal = DAL_NUTRIENTS[selection.dalPortion || 'none'];
  calMin += dal.cal[0]; calMax += dal.cal[1];
  proMin += dal.pro[0]; proMax += dal.pro[1];
  carbMin += dal.carb[0]; carbMax += dal.carb[1];
  fatMin += dal.fat[0]; fatMax += dal.fat[1];

  // Sabzi calculation
  const sabzi = SABZI_NUTRIENTS[selection.sabziPortion || 'medium'];
  calMin += sabzi.cal[0]; calMax += sabzi.cal[1];
  proMin += sabzi.pro[0]; proMax += sabzi.pro[1];
  carbMin += sabzi.carb[0]; carbMax += sabzi.carb[1];
  fatMin += sabzi.fat[0]; fatMax += sabzi.fat[1];

  // Eggs calculation
  const eggs = selection.eggCount || 0;
  calMin += eggs * 70; calMax += eggs * 80;
  proMin += eggs * 6; proMax += eggs * 6.5;
  carbMin += eggs * 0.5; carbMax += eggs * 1;
  fatMin += eggs * 5; fatMax += eggs * 6;

  // Goal-aware conservatism:
  let reliableCalories: number;
  let reliableProtein: number;

  if (goal === 'muscle_gain') {
    // For muscle gain, assume conservative low protein target to guarantee surplus protein
    reliableProtein = Math.round(proMin);
    reliableCalories = Math.round((calMin + calMax) / 2);
  } else if (goal === 'fat_loss') {
    // For fat loss, assume conservative high calories so deficit is preserved
    reliableCalories = Math.round(calMax);
    reliableProtein = Math.round((proMin + proMax) / 2);
  } else {
    reliableCalories = Math.round((calMin + calMax) / 2);
    reliableProtein = Math.round((proMin + proMax) / 2);
  }

  const reliableCarbs = Math.round((carbMin + carbMax) / 2);
  const reliableFat = Math.round((fatMin + fatMax) / 2);

  return {
    mealName: selection.mealName,
    caloriesRange: { min: Math.round(calMin), max: Math.round(calMax) },
    proteinRange: { min: Math.round(proMin), max: Math.round(proMax) },
    carbsRange: { min: Math.round(carbMin), max: Math.round(carbMax) },
    fatRange: { min: Math.round(fatMin), max: Math.round(fatMax) },
    reliableCalories,
    reliableProtein,
    reliableCarbs,
    reliableFat,
  };
}

export function calculateExistingDiet(
  input: MessDietInput,
  goal: Goal
): ExistingDietEstimate {
  const mealEstimates = input.meals.map((meal) => estimateMessMealNutrition(meal, goal));

  const totalReliableCalories = mealEstimates.reduce((sum, m) => sum + m.reliableCalories, 0);
  const totalReliableProtein = mealEstimates.reduce((sum, m) => sum + m.reliableProtein, 0);
  const totalReliableCarbs = mealEstimates.reduce((sum, m) => sum + m.reliableCarbs, 0);
  const totalReliableFat = mealEstimates.reduce((sum, m) => sum + m.reliableFat, 0);

  return {
    totalReliableCalories,
    totalReliableProtein,
    totalReliableCarbs,
    totalReliableFat,
    mealEstimates,
  };
}
