import { FoodItem } from './food.types';

const INITIAL_FOOD_DATABASE: Omit<FoodItem, 'costPer10gProtein' | 'costPer100Calories' | 'proteinPer100Calories'>[] = [
  {
    id: 'food_toned_milk_500ml',
    name: 'Toned Milk (Packet)',
    servingUnit: '500 ml',
    servingSizeGramsOrMl: 500,
    calories: 290,
    protein: 15.5,
    carbs: 24,
    fat: 15,
    fiber: 0,
    estimatedCostInr: 27,
    dietType: 'vegetarian',
    cookingRequired: false,
    fridgeRequired: true,
    portability: 'medium',
    hostelSuitability: 'excellent',
    allowedMealCategories: ['breakfast', 'snack', 'post_workout', 'pre_workout'],
    minServingsPerDay: 0.5,
    maxServingsPerDay: 2,
  },
  {
    id: 'food_roasted_chana_50g',
    name: 'Roasted Chana (Bhuna Chana)',
    servingUnit: '50 g',
    servingSizeGramsOrMl: 50,
    calories: 180,
    protein: 11,
    carbs: 29,
    fat: 3,
    fiber: 8,
    estimatedCostInr: 8,
    dietType: 'vegan',
    cookingRequired: false,
    fridgeRequired: false,
    portability: 'high',
    hostelSuitability: 'excellent',
    allowedMealCategories: ['snack', 'pre_workout', 'post_workout'],
    minServingsPerDay: 1,
    maxServingsPerDay: 3,
  },
  {
    id: 'food_boiled_eggs_3',
    name: 'Whole Boiled Eggs (3 eggs)',
    servingUnit: '3 eggs',
    servingSizeGramsOrMl: 150,
    calories: 215,
    protein: 18,
    carbs: 1.5,
    fat: 15,
    fiber: 0,
    estimatedCostInr: 21,
    dietType: 'eggetarian',
    cookingRequired: true,
    requiredEquipment: ['kettle', 'induction', 'microwave'],
    fridgeRequired: false,
    portability: 'high',
    hostelSuitability: 'good',
    allowedMealCategories: ['breakfast', 'snack', 'post_workout'],
    minServingsPerDay: 1,
    maxServingsPerDay: 2,
  },
  {
    id: 'food_banana_2',
    name: 'Bananas (2 medium)',
    servingUnit: '2 bananas',
    servingSizeGramsOrMl: 200,
    calories: 180,
    protein: 2.2,
    carbs: 46,
    fat: 0.6,
    fiber: 5,
    estimatedCostInr: 10,
    dietType: 'vegan',
    cookingRequired: false,
    fridgeRequired: false,
    portability: 'high',
    hostelSuitability: 'excellent',
    allowedMealCategories: ['breakfast', 'pre_workout', 'snack'],
    minServingsPerDay: 1,
    maxServingsPerDay: 2,
  },
  {
    id: 'food_peanuts_50g',
    name: 'Roasted Peanuts',
    servingUnit: '50 g',
    servingSizeGramsOrMl: 50,
    calories: 280,
    protein: 13,
    carbs: 10,
    fat: 24,
    fiber: 4.5,
    estimatedCostInr: 10,
    dietType: 'vegan',
    cookingRequired: false,
    fridgeRequired: false,
    portability: 'high',
    hostelSuitability: 'excellent',
    allowedMealCategories: ['snack', 'pre_workout'],
    minServingsPerDay: 0.5,
    maxServingsPerDay: 2,
  },
  {
    id: 'food_paneer_100g',
    name: 'Fresh Paneer (Raw/Cubed)',
    servingUnit: '100 g',
    servingSizeGramsOrMl: 100,
    calories: 265,
    protein: 18,
    carbs: 6,
    fat: 20,
    fiber: 0,
    estimatedCostInr: 40,
    dietType: 'vegetarian',
    cookingRequired: false,
    fridgeRequired: true,
    portability: 'medium',
    hostelSuitability: 'good',
    allowedMealCategories: ['snack', 'dinner', 'post_workout'],
    minServingsPerDay: 1,
    maxServingsPerDay: 2,
  },
  {
    id: 'food_curd_200g',
    name: 'Curd / Dahi',
    servingUnit: '200 g',
    servingSizeGramsOrMl: 200,
    calories: 120,
    protein: 7,
    carbs: 10,
    fat: 6,
    fiber: 0,
    estimatedCostInr: 15,
    dietType: 'vegetarian',
    cookingRequired: false,
    fridgeRequired: true,
    portability: 'low',
    hostelSuitability: 'good',
    allowedMealCategories: ['breakfast', 'snack', 'dinner'],
    minServingsPerDay: 1,
    maxServingsPerDay: 2,
  },
  {
    id: 'food_whey_protein_1scoop',
    name: 'Whey Protein Powder (1 Scoop)',
    servingUnit: '1 scoop (32g)',
    servingSizeGramsOrMl: 32,
    calories: 120,
    protein: 24,
    carbs: 3,
    fat: 1.5,
    fiber: 0,
    estimatedCostInr: 65,
    dietType: 'vegetarian',
    cookingRequired: false,
    fridgeRequired: false,
    portability: 'high',
    hostelSuitability: 'excellent',
    allowedMealCategories: ['post_workout', 'breakfast', 'snack'],
    minServingsPerDay: 1,
    maxServingsPerDay: 2,
  },
  {
    id: 'food_sattu_50g',
    name: 'Chana Sattu Drink',
    servingUnit: '50 g',
    servingSizeGramsOrMl: 50,
    calories: 190,
    protein: 11.5,
    carbs: 32,
    fat: 2.5,
    fiber: 7,
    estimatedCostInr: 12,
    dietType: 'vegan',
    cookingRequired: false,
    fridgeRequired: false,
    portability: 'high',
    hostelSuitability: 'excellent',
    allowedMealCategories: ['breakfast', 'snack', 'pre_workout'],
    minServingsPerDay: 1,
    maxServingsPerDay: 2,
  },
  {
    id: 'food_sprouts_100g',
    name: 'Moong Sprouts',
    servingUnit: '100 g',
    servingSizeGramsOrMl: 100,
    calories: 105,
    protein: 8,
    carbs: 18,
    fat: 0.8,
    fiber: 5.5,
    estimatedCostInr: 12,
    dietType: 'vegan',
    cookingRequired: false,
    fridgeRequired: true,
    portability: 'medium',
    hostelSuitability: 'good',
    allowedMealCategories: ['snack', 'breakfast'],
    minServingsPerDay: 1,
    maxServingsPerDay: 2,
  },
  {
    id: 'food_soy_chunks_50g',
    name: 'Boiled Soy Chunks',
    servingUnit: '50 g (dry weight)',
    servingSizeGramsOrMl: 50,
    calories: 170,
    protein: 26,
    carbs: 16,
    fat: 0.5,
    fiber: 6,
    estimatedCostInr: 12,
    dietType: 'vegan',
    cookingRequired: true,
    requiredEquipment: ['induction', 'kettle', 'microwave'],
    fridgeRequired: false,
    portability: 'low',
    hostelSuitability: 'poor',
    allowedMealCategories: ['lunch', 'dinner', 'post_workout'],
    minServingsPerDay: 1,
    maxServingsPerDay: 2,
  },
  {
    id: 'food_peanut_butter_30g',
    name: 'Peanut Butter (2 tbsp)',
    servingUnit: '30 g',
    servingSizeGramsOrMl: 30,
    calories: 190,
    protein: 8,
    carbs: 6,
    fat: 16,
    fiber: 2,
    estimatedCostInr: 15,
    dietType: 'vegan',
    cookingRequired: false,
    fridgeRequired: false,
    portability: 'high',
    hostelSuitability: 'excellent',
    allowedMealCategories: ['breakfast', 'snack', 'pre_workout'],
    minServingsPerDay: 1,
    maxServingsPerDay: 2,
  },
  {
    id: 'food_oats_50g',
    name: 'Rolled Oats (Instant/Boiled)',
    servingUnit: '50 g',
    servingSizeGramsOrMl: 50,
    calories: 190,
    protein: 6.5,
    carbs: 34,
    fat: 3,
    fiber: 5,
    estimatedCostInr: 15,
    dietType: 'vegan',
    cookingRequired: true,
    requiredEquipment: ['kettle', 'microwave', 'induction'],
    fridgeRequired: false,
    portability: 'medium',
    hostelSuitability: 'good',
    allowedMealCategories: ['breakfast', 'pre_workout', 'snack'],
    minServingsPerDay: 1,
    maxServingsPerDay: 2,
  },
  {
    id: 'food_chicken_breast_150g',
    name: 'Boiled / Grilled Chicken Breast',
    servingUnit: '150 g',
    servingSizeGramsOrMl: 150,
    calories: 240,
    protein: 46,
    carbs: 0,
    fat: 5,
    fiber: 0,
    estimatedCostInr: 65,
    dietType: 'non_vegetarian',
    cookingRequired: true,
    requiredEquipment: ['induction'],
    fridgeRequired: true,
    portability: 'medium',
    hostelSuitability: 'poor',
    allowedMealCategories: ['lunch', 'dinner', 'post_workout'],
    minServingsPerDay: 1,
    maxServingsPerDay: 2,
  },
];

export function enrichFoodMetrics(food: Omit<FoodItem, 'costPer10gProtein' | 'costPer100Calories' | 'proteinPer100Calories'>): FoodItem {
  const costPer10gProtein = food.protein > 0 ? Number(((food.estimatedCostInr / food.protein) * 10).toFixed(2)) : 999;
  const costPer100Calories = food.calories > 0 ? Number(((food.estimatedCostInr / food.calories) * 100).toFixed(2)) : 999;
  const proteinPer100Calories = food.calories > 0 ? Number(((food.protein / food.calories) * 100).toFixed(2)) : 0;

  return {
    ...food,
    costPer10gProtein,
    costPer100Calories,
    proteinPer100Calories,
  };
}

let inMemoryFoodCache: FoodItem[] | null = null;

export function setInMemoryFoodCache(foods: FoodItem[]): void {
  inMemoryFoodCache = foods;
}

/**
 * Projects a CanonicalFood Mongoose document or record into the FoodItem DTO shape
 * required by the diet plan optimizer and recommendation engine.
 */
export function projectCanonicalToFoodItem(
  canonical: any,
  estimatedCostPerServing: number = 20
): FoodItem {
  const serving = canonical.servings?.[0] || { name: '100g portion', grams: 100 };
  const servingGrams = serving.grams || 100;
  const scale = servingGrams / 100;

  const calories = Math.round((canonical.nutrition?.caloriesKcal || 0) * scale);
  const protein = Number(((canonical.nutrition?.proteinG || 0) * scale).toFixed(1));
  const carbs = Number(((canonical.nutrition?.carbohydratesG || 0) * scale).toFixed(1));
  const fat = Number(((canonical.nutrition?.fatG || 0) * scale).toFixed(1));
  const fiber = Number(((canonical.nutrition?.fiberG || 0) * scale).toFixed(1));

  let dietType: any = 'vegetarian';
  const tags = canonical.dietaryTags || [];
  if (tags.includes('vegan')) dietType = 'vegan';
  else if (tags.includes('vegetarian')) dietType = 'vegetarian';
  else if (tags.includes('eggetarian')) dietType = 'eggetarian';
  else if (tags.includes('non_vegetarian')) dietType = 'non_vegetarian';

  const rawItem: Omit<FoodItem, 'costPer10gProtein' | 'costPer100Calories' | 'proteinPer100Calories'> = {
    id: canonical._id ? String(canonical._id) : `food_${canonical.name.replace(/\s+/g, '_')}`,
    name: canonical.displayName || canonical.name,
    servingUnit: serving.name,
    servingSizeGramsOrMl: servingGrams,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    estimatedCostInr: estimatedCostPerServing,
    dietType,
    cookingRequired: canonical.cookingRequired ?? false,
    requiredEquipment: canonical.requiredEquipment || [],
    fridgeRequired: canonical.fridgeRequired ?? false,
    portability: canonical.portability || 'medium',
    hostelSuitability: canonical.hostelSuitability || 'good',
    allowedMealCategories: canonical.allowedMealCategories || ['snack'],
    minServingsPerDay: canonical.minServingsPerDay ?? 0.5,
    maxServingsPerDay: canonical.maxServingsPerDay ?? 2,
  };

  return enrichFoodMetrics(rawItem);
}

export function getAllFoods(): FoodItem[] {
  if (inMemoryFoodCache && inMemoryFoodCache.length > 0) {
    return inMemoryFoodCache;
  }
  return INITIAL_FOOD_DATABASE.map(enrichFoodMetrics);
}

/**
 * Asynchronously loads active foods from MongoDB, evaluates location-aware prices,
 * and caches them for subsequent recommendation runs.
 */
export async function getAllFoodsAsync(location?: { city: string; state?: string }): Promise<FoodItem[]> {
  try {
    const { CanonicalFood } = await import('../../database/models/CanonicalFood');
    const { CurrentPriceEngine } = await import('./services/price.engine');

    const dbFoods = await CanonicalFood.find({ isActive: true }).lean();
    if (!dbFoods || dbFoods.length === 0) {
      return getAllFoods();
    }

    const priceEngine = new CurrentPriceEngine();
    const targetLoc = location || { city: 'Indore', state: 'Madhya Pradesh' };

    const projected: FoodItem[] = [];
    for (const food of dbFoods) {
      try {
        const priceResult = await priceEngine.getBestPrice(food, targetLoc);
        const servingGrams = food.servings?.[0]?.grams || 100;
        const costPerServing = Number(
          ((priceResult.estimatedPrice / 100) * servingGrams).toFixed(2)
        );
        projected.push(projectCanonicalToFoodItem(food, costPerServing));
      } catch {
        projected.push(projectCanonicalToFoodItem(food, 20));
      }
    }

    if (projected.length > 0) {
      inMemoryFoodCache = projected;
      return projected;
    }
  } catch {
    // Fall back to static dataset
  }

  return getAllFoods();
}

/** Food repository provides verified nutritional profiles tailored for student and budget diets. */

