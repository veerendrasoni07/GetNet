import { FoodCategory, FoodType, MacroNutrients, NutritionConfidence, ServingDefinition } from '../../../../database/models/CanonicalFood';

export interface NutritionCandidate {
  externalId: string;
  provider: string;
  name: string;
  description?: string;
  category?: string;
  dataType?: 'Foundation' | 'SR Legacy' | 'Survey (FNDDS)' | 'Branded' | 'IFCT_Verified';
  score?: number;
  matchReason?: string;
}

export interface NormalizedNutritionRecord {
  name: string;
  displayName: string;
  aliases: string[];
  category: FoodCategory;
  foodType: FoodType;
  dietaryTags: string[];
  nutrition: MacroNutrients;
  servings: ServingDefinition[];
  cookingRequired: boolean;
  requiredEquipment: string[];
  fridgeRequired: boolean;
  portability: 'high' | 'medium' | 'low';
  hostelSuitability: 'excellent' | 'good' | 'poor';
  allowedMealCategories: string[];
  source: {
    provider: string;
    externalId: string;
    version?: string;
    retrievedAt: Date;
    sourceUrl?: string;
    confidence: NutritionConfidence;
  };
}

export interface NutritionProvider {
  readonly name: string;
  searchFood(query: string, options?: { foodType?: FoodType; category?: FoodCategory }): Promise<NutritionCandidate[]>;
  getFoodDetails(externalId: string): Promise<NormalizedNutritionRecord | null>;
  healthCheck(): Promise<boolean>;
}
