import { Goal } from '../profile/profile.types';
import {
  BowlPortion,
  BreakfastType,
  EstimatedMealNutrition,
  ExistingDietEstimate,
  MessDietInput,
  MessMealSelection,
  RotiPortion,
  SabziPortion,
} from './existing-diet.types';

export const INDIAN_BREAKFAST_NUTRIENTS: Record<
  BreakfastType,
  {
    name: string;
    unitLabel: string;
    cal: [number, number];
    pro: [number, number];
    carb: [number, number];
    fat: [number, number];
  }
> = {
  poha: {
    name: 'Poha',
    unitLabel: 'Plate',
    cal: [210, 270],
    pro: [3.8, 5.2],
    carb: [38, 46],
    fat: [4.5, 7.5],
  },
  upma: {
    name: 'Upma',
    unitLabel: 'Bowl',
    cal: [190, 250],
    pro: [4.8, 6.2],
    carb: [34, 42],
    fat: [4.0, 6.5],
  },
  idli_sambar: {
    name: 'Idli with Sambar',
    unitLabel: 'Idlis',
    cal: [85, 105],
    pro: [2.7, 3.5],
    carb: [16, 20],
    fat: [0.8, 1.5],
  },
  dosa: {
    name: 'Dosa with Sambar',
    unitLabel: 'Dosa',
    cal: [180, 230],
    pro: [3.8, 5.2],
    carb: [28, 36],
    fat: [4.5, 7.0],
  },
  paratha: {
    name: 'Stuffed Paratha',
    unitLabel: 'Paratha',
    cal: [200, 260],
    pro: [4.5, 6.0],
    carb: [28, 35],
    fat: [7.5, 11.0],
  },
  chilla: {
    name: 'Besan Chilla',
    unitLabel: 'Chilla',
    cal: [110, 140],
    pro: [5.5, 7.0],
    carb: [14, 18],
    fat: [3.5, 5.0],
  },
  oats_dalia: {
    name: 'Oats / Vegetable Dalia',
    unitLabel: 'Bowl',
    cal: [190, 240],
    pro: [6.5, 8.5],
    carb: [32, 40],
    fat: [3.5, 5.5],
  },
  sprouts: {
    name: 'Moong / Chana Sprouts',
    unitLabel: 'Bowl',
    cal: [140, 180],
    pro: [8.5, 11.5],
    carb: [22, 28],
    fat: [1.0, 2.0],
  },
  bread_omelette: {
    name: 'Bread Omelette (2 Eggs)',
    unitLabel: 'Serving',
    cal: [290, 350],
    pro: [14.0, 17.5],
    carb: [24, 30],
    fat: [12.0, 15.5],
  },
  roti_sabzi: {
    name: 'Roti & Sabzi',
    unitLabel: 'Serving',
    cal: [250, 320],
    pro: [6.5, 8.5],
    carb: [38, 48],
    fat: [6.0, 9.0],
  },
};

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
  let calMin = 0;
  let calMax = 0;
  let proMin = 0;
  let proMax = 0;
  let carbMin = 0;
  let carbMax = 0;
  let fatMin = 0;
  let fatMax = 0;

  // 1. Indian Breakfast Branch
  if (
    selection.mealName === 'breakfast' &&
    selection.breakfastType &&
    selection.breakfastType !== 'roti_sabzi' &&
    INDIAN_BREAKFAST_NUTRIENTS[selection.breakfastType]
  ) {
    const bfData = INDIAN_BREAKFAST_NUTRIENTS[selection.breakfastType];
    const qty = selection.breakfastQuantity && selection.breakfastQuantity > 0 ? selection.breakfastQuantity : 1;
    calMin = bfData.cal[0] * qty;
    calMax = bfData.cal[1] * qty;
    proMin = bfData.pro[0] * qty;
    proMax = bfData.pro[1] * qty;
    carbMin = bfData.carb[0] * qty;
    carbMax = bfData.carb[1] * qty;
    fatMin = bfData.fat[0] * qty;
    fatMax = bfData.fat[1] * qty;

    // Eggs addition if selected
    const eggs = selection.eggCount || 0;
    calMin += eggs * 70; calMax += eggs * 80;
    proMin += eggs * 6; proMax += eggs * 6.5;
    carbMin += eggs * 0.5; carbMax += eggs * 1;
    fatMin += eggs * 5; fatMax += eggs * 6;
  } else {
    // 2. Standard Indian Lunch/Dinner/Roti Staples
    const rotiCount = selection.rotiCount || 0;
    calMin += rotiCount * 80;
    calMax += rotiCount * 100;
    proMin += rotiCount * 2.5;
    proMax += rotiCount * 3.5;
    carbMin += rotiCount * 15;
    carbMax += rotiCount * 18;
    fatMin += rotiCount * 1;
    fatMax += rotiCount * 2.5;

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
  }

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

/** Existing diet engine computes baseline micronutrient and caloric averages from meal recalls. */
