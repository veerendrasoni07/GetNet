import { Goal } from '../profile/profile.types';

export type RotiPortion = 0 | 1 | 2 | 3 | 4 | 5;
export type BowlPortion = 'none' | 'half' | 'medium' | 'large';
export type SabziPortion = 'small' | 'medium' | 'large';

export interface MessMealSelection {
  mealName: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  rotiCount: RotiPortion;
  ricePortion: BowlPortion;
  dalPortion: BowlPortion;
  sabziPortion: SabziPortion;
  eggCount?: number;
}

export interface MessDietInput {
  meals: MessMealSelection[];
}

export interface EstimatedMealNutrition {
  mealName: string;
  caloriesRange: { min: number; max: number };
  proteinRange: { min: number; max: number };
  carbsRange: { min: number; max: number };
  fatRange: { min: number; max: number };
  // Goal-aware conservative values
  reliableCalories: number;
  reliableProtein: number;
  reliableCarbs: number;
  reliableFat: number;
}

export interface ExistingDietEstimate {
  totalReliableCalories: number;
  totalReliableProtein: number;
  totalReliableCarbs: number;
  totalReliableFat: number;
  mealEstimates: EstimatedMealNutrition[];
}
