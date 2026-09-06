import { FoodItem } from '../foods/food.types';
import { UserDietProfile } from '../profile/profile.types';

export interface ConstraintResult {
  allowed: boolean;
  rejectionReason?: string;
}

export function filterDietType(food: FoodItem, userDietType: string): ConstraintResult {
  if (userDietType === 'vegan') {
    if (food.dietType !== 'vegan') {
      return { allowed: false, rejectionReason: `Diet restriction: User is vegan but food is ${food.dietType}` };
    }
  } else if (userDietType === 'vegetarian') {
    if (food.dietType !== 'vegetarian' && food.dietType !== 'vegan') {
      return { allowed: false, rejectionReason: `Diet restriction: User is vegetarian but food is ${food.dietType}` };
    }
  } else if (userDietType === 'eggetarian') {
    if (food.dietType === 'non_vegetarian') {
      return { allowed: false, rejectionReason: `Diet restriction: User is eggetarian but food is non-vegetarian` };
    }
  }
  return { allowed: true };
}

export function filterAllergies(food: FoodItem, allergies: string[]): ConstraintResult {
  const foodNameLower = food.name.toLowerCase();
  const foodIdLower = food.id.toLowerCase();

  for (const allergy of allergies) {
    const term = allergy.toLowerCase().trim();
    if (!term) continue;

    if (
      foodNameLower.includes(term) ||
      foodIdLower.includes(term) ||
      (term.includes('lactose') || term.includes('dairy')) && ['milk', 'paneer', 'curd', 'whey'].some(d => foodIdLower.includes(d)) ||
      (term.includes('peanut') || term.includes('nut')) && foodIdLower.includes('peanut') ||
      (term.includes('egg')) && foodIdLower.includes('egg') ||
      (term.includes('soy')) && foodIdLower.includes('soy')
    ) {
      return { allowed: false, rejectionReason: `Allergy restriction: User allergic to ${allergy}` };
    }
  }
  return { allowed: true };
}

export function filterEquipment(food: FoodItem, profile: UserDietProfile): ConstraintResult {
  if (food.cookingRequired) {
    const userEquipment = profile.lifestyle.availableEquipment || [];
    if (userEquipment.includes('none') || userEquipment.length === 0) {
      return { allowed: false, rejectionReason: `Equipment restriction: Cooking required but no equipment available` };
    }

    if (food.requiredEquipment && food.requiredEquipment.length > 0) {
      const hasRequired = food.requiredEquipment.some((eq) => userEquipment.includes(eq));
      if (!hasRequired) {
        return {
          allowed: false,
          rejectionReason: `Equipment restriction: Requires ${food.requiredEquipment.join('/')} but user lacks equipment`,
        };
      }
    }
  }
  return { allowed: true };
}

export function filterFridge(food: FoodItem, profile: UserDietProfile): ConstraintResult {
  if (food.fridgeRequired) {
    const userEquipment = profile.lifestyle.availableEquipment || [];
    const hasFridge = userEquipment.includes('refrigerator');
    
    // Exception for 500ml milk packet or small curd if hostel student consumes immediately
    const isSingleUse = food.id.includes('milk') || food.id.includes('curd');

    if (!hasFridge && !isSingleUse && profile.lifestyle.livingSituation === 'hostel') {
      return { allowed: false, rejectionReason: `Storage restriction: Requires refrigerator` };
    }
  }
  return { allowed: true };
}

export function filterFoodsForUser(foods: FoodItem[], profile: UserDietProfile): { allowedFoods: FoodItem[]; rejectedFoods: { food: FoodItem; reason: string }[] } {
  const allowedFoods: FoodItem[] = [];
  const rejectedFoods: { food: FoodItem; reason: string }[] = [];

  for (const food of foods) {
    const dietCheck = filterDietType(food, profile.preferences.dietType);
    if (!dietCheck.allowed) {
      rejectedFoods.push({ food, reason: dietCheck.rejectionReason! });
      continue;
    }

    const allergyCheck = filterAllergies(food, profile.preferences.allergies);
    if (!allergyCheck.allowed) {
      rejectedFoods.push({ food, reason: allergyCheck.rejectionReason! });
      continue;
    }

    const equipmentCheck = filterEquipment(food, profile);
    if (!equipmentCheck.allowed) {
      rejectedFoods.push({ food, reason: equipmentCheck.rejectionReason! });
      continue;
    }

    const fridgeCheck = filterFridge(food, profile);
    if (!fridgeCheck.allowed) {
      rejectedFoods.push({ food, reason: fridgeCheck.rejectionReason! });
      continue;
    }

    allowedFoods.push(food);
  }

  return { allowedFoods, rejectedFoods };
}
