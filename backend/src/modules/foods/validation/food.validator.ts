import { MacroNutrients } from '../../../database/models/CanonicalFood';

export interface NutritionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  calculatedAtwaterCalories?: number;
  atwaterDeviationPercent?: number;
}

export class FoodValidator {
  /**
   * Validates macronutrient sanity on a 100g basis.
   * Enforces non-negative values, realistic physiological bounds, and Atwater sanity check.
   */
  public static validateNutrition(nutrition: MacroNutrients): NutritionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Non-negativity check
    if (nutrition.caloriesKcal < 0) errors.push('Calories cannot be negative.');
    if (nutrition.proteinG < 0) errors.push('Protein cannot be negative.');
    if (nutrition.carbohydratesG < 0) errors.push('Carbohydrates cannot be negative.');
    if (nutrition.fatG < 0) errors.push('Fat cannot be negative.');
    if (nutrition.fiberG < 0) errors.push('Fiber cannot be negative.');

    // 2. Physical bounds for 100g basis
    if (nutrition.basisGrams === 100) {
      if (nutrition.proteinG > 100) {
        errors.push(`Protein (${nutrition.proteinG}g) cannot exceed 100g on a 100g basis.`);
      }
      if (nutrition.carbohydratesG > 100) {
        errors.push(`Carbohydrates (${nutrition.carbohydratesG}g) cannot exceed 100g on a 100g basis.`);
      }
      if (nutrition.fatG > 100) {
        errors.push(`Fat (${nutrition.fatG}g) cannot exceed 100g on a 100g basis.`);
      }
      if (nutrition.fiberG > 100) {
        errors.push(`Fiber (${nutrition.fiberG}g) cannot exceed 100g on a 100g basis.`);
      }

      // Pure fat is the most energy dense nutrient (9 kcal/g => 900 kcal/100g). Allowing up to 920 for measurement drift.
      if (nutrition.caloriesKcal > 920) {
        errors.push(`Calories (${nutrition.caloriesKcal} kcal) exceed the physiological maximum of 900-920 kcal/100g.`);
      }

      // Sum of macronutrients check (allowing up to 105g for measurement variance / moisture calculation)
      const macroSum = nutrition.proteinG + nutrition.carbohydratesG + nutrition.fatG;
      if (macroSum > 105) {
        warnings.push(`Combined macronutrients sum to ${macroSum.toFixed(1)}g per 100g, exceeding 100g.`);
      }
    }

    // 3. Atwater Consistency Check: 4*P + 4*C + 9*F
    // Do NOT overwrite authoritative calories; calculate for sanity verification
    const atwaterCalories = Number(
      (nutrition.proteinG * 4 + nutrition.carbohydratesG * 4 + nutrition.fatG * 9).toFixed(1)
    );

    let atwaterDeviationPercent: number | undefined;

    if (nutrition.caloriesKcal > 10) {
      const diff = Math.abs(nutrition.caloriesKcal - atwaterCalories);
      atwaterDeviationPercent = Number(((diff / nutrition.caloriesKcal) * 100).toFixed(1));

      // Fiber, organic acids, sugar alcohols, and specific protein heat combustion factors can legitimately cause up to ~25% deviation
      if (atwaterDeviationPercent > 25) {
        warnings.push(
          `Atwater caloric estimate (${atwaterCalories} kcal) deviates by ${atwaterDeviationPercent}% from reported calories (${nutrition.caloriesKcal} kcal). Manual review advised.`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      calculatedAtwaterCalories: atwaterCalories,
      atwaterDeviationPercent,
    };
  }

  /**
   * Standardizes food name for matching and deduplication.
   * e.g., "  Moong Dal (Yellow Split)  " -> "moong dal yellow split"
   */
  public static normalizeFoodName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/gi, ' ') // replace punctuation with spaces
      .replace(/\s+/g, ' ')      // collapse multi-space
      .trim();
  }

  /**
   * Determines if a candidate food name or alias collides with an existing canonical food.
   */
  public static isPotentialDuplicate(
    candidateName: string,
    candidateAliases: string[] = [],
    existingFood: { name: string; displayName?: string; aliases?: string[] }
  ): boolean {
    const normCandName = this.normalizeFoodName(candidateName);
    const normExistingName = this.normalizeFoodName(existingFood.name);

    if (normCandName === normExistingName) return true;

    if (existingFood.displayName && normCandName === this.normalizeFoodName(existingFood.displayName)) {
      return true;
    }

    const candNormalizedAliases = candidateAliases.map((a) => this.normalizeFoodName(a));
    const existingNormalizedAliases = (existingFood.aliases || []).map((a) => this.normalizeFoodName(a));

    if (candNormalizedAliases.includes(normExistingName)) return true;
    if (existingNormalizedAliases.includes(normCandName)) return true;

    // Check overlap between aliases
    for (const ca of candNormalizedAliases) {
      if (ca.length > 3 && existingNormalizedAliases.includes(ca)) {
        return true;
      }
    }

    return false;
  }
}
