import { DietType, Equipment } from '../profile/profile.types';

export type Portability = 'high' | 'medium' | 'low';
export type HostelSuitability = 'excellent' | 'good' | 'poor';
export type MealCategory = 'breakfast' | 'lunch' | 'snack' | 'pre_workout' | 'post_workout' | 'dinner';

export interface FoodItem {
  id: string;
  name: string;
  servingUnit: string;            // e.g. "500ml", "50g", "2 eggs", "2 bananas"
  servingSizeGramsOrMl: number;   // e.g. 500
  calories: number;               // per serving
  protein: number;                // per serving
  carbs: number;                  // per serving
  fat: number;                    // per serving
  fiber: number;                  // per serving
  estimatedCostInr: number;       // cost per serving in INR
  dietType: DietType;
  cookingRequired: boolean;
  requiredEquipment?: Equipment[]; // equipment required if cooking
  fridgeRequired: boolean;
  portability: Portability;
  hostelSuitability: HostelSuitability;
  allowedMealCategories: MealCategory[];
  minServingsPerDay?: number;
  maxServingsPerDay?: number;
  
  // Derived metadata metrics
  costPer10gProtein?: number;
  costPer100Calories?: number;
  proteinPer100Calories?: number;
}
