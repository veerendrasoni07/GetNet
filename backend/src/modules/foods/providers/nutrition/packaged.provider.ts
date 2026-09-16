import {
  NormalizedNutritionRecord,
  NutritionCandidate,
  NutritionProvider,
} from './nutrition-provider.interface';
import { FoodCategory, FoodType } from '../../../../database/models/CanonicalFood';
import { FoodValidator } from '../../validation/food.validator';

/**
 * Tier 3 — Packaged Food Provider Adapter (e.g., Open Food Facts / Approved Packaged Data)
 * Manages verified branded products without tightly coupling database to a single vendor.
 */
export class PackagedFoodProvider implements NutritionProvider {
  public readonly name = 'PACKAGED_FOOD';

  private static readonly PACKAGED_REGISTRY: NormalizedNutritionRecord[] = [
    {
      name: 'whey protein isolate powder',
      displayName: 'Whey Protein Powder (100% Isolate/Concentrate)',
      aliases: ['whey protein', 'protein powder', 'whey isolate', 'raw whey'],
      category: 'SUPPLEMENTS',
      foodType: 'PACKAGED',
      dietaryTags: ['vegetarian', 'gluten_free'],
      nutrition: {
        basisGrams: 100,
        caloriesKcal: 380,
        proteinG: 78.0,
        carbohydratesG: 6.0,
        fatG: 4.5,
        fiberG: 0,
        calciumMg: 450,
      },
      servings: [
        { name: '1 standard scoop (approx 32g)', grams: 32, householdMeasure: '1 scoop' },
      ],
      cookingRequired: false,
      requiredEquipment: ['mixer'],
      fridgeRequired: false,
      portability: 'high',
      hostelSuitability: 'excellent',
      allowedMealCategories: ['post_workout', 'breakfast', 'snack'],
      source: {
        provider: 'PACKAGED',
        externalId: 'PKG-WHEY-001',
        version: 'Standard Supplement Label',
        retrievedAt: new Date('2024-01-01'),
        confidence: 'HIGH',
      },
    },
    {
      name: 'peanut butter classic creamy',
      displayName: 'Peanut Butter (Classic / Unsweetened)',
      aliases: ['peanut butter', 'pinaat batar', 'unsweetened peanut butter'],
      category: 'FATS_OILS',
      foodType: 'PACKAGED',
      dietaryTags: ['vegetarian', 'vegan', 'gluten_free'],
      nutrition: {
        basisGrams: 100,
        caloriesKcal: 625,
        proteinG: 26.0,
        carbohydratesG: 18.0,
        fatG: 50.0,
        fiberG: 6.0,
        ironMg: 2.2,
      },
      servings: [
        { name: '1 tablespoon (approx 15g)', grams: 15, householdMeasure: '1 tbsp' },
        { name: '2 tablespoons (approx 30g)', grams: 30, householdMeasure: '2 tbsp' },
      ],
      cookingRequired: false,
      requiredEquipment: [],
      fridgeRequired: false,
      portability: 'high',
      hostelSuitability: 'excellent',
      allowedMealCategories: ['breakfast', 'snack', 'pre_workout'],
      source: {
        provider: 'PACKAGED',
        externalId: 'PKG-PB-001',
        version: 'Packaged Label Average',
        retrievedAt: new Date('2024-01-01'),
        confidence: 'HIGH',
      },
    },
  ];

  public async searchFood(
    query: string,
    options?: { foodType?: FoodType; category?: FoodCategory }
  ): Promise<NutritionCandidate[]> {
    const norm = FoodValidator.normalizeFoodName(query);
    const results: NutritionCandidate[] = [];

    for (const item of PackagedFoodProvider.PACKAGED_REGISTRY) {
      if (options?.category && item.category !== options.category) continue;

      const normName = FoodValidator.normalizeFoodName(item.name);
      if (normName.includes(norm) || item.aliases.some((a) => a.includes(norm))) {
        results.push({
          externalId: item.source.externalId,
          provider: 'PACKAGED',
          name: item.displayName,
          description: `Packaged verified product: ${item.displayName}`,
          category: item.category,
          dataType: 'Branded',
          score: 85,
          matchReason: 'Packaged registry match',
        });
      }
    }
    return results;
  }

  public async getFoodDetails(externalId: string): Promise<NormalizedNutritionRecord | null> {
    const found = PackagedFoodProvider.PACKAGED_REGISTRY.find(
      (p) => p.source.externalId === externalId
    );
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  public async healthCheck(): Promise<boolean> {
    return true;
  }
}
