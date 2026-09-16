import { NormalizedPrices } from '../../../database/models/PriceObservation';

export type SupportedUnit = 'g' | 'kg' | 'ml' | 'L' | 'piece' | 'pack';

export interface PriceNormalizationResult {
  normalized: NormalizedPrices;
  effectiveUnit: '100g' | '100ml' | 'unit';
  pricePerStandardBasis: number;
}

/**
 * Standard unit converter and normalizer.
 * Enforces scientific rules:
 * 1. 1kg = 1000g, 1L = 1000ml.
 * 2. Strict density barrier: Never converts ml <-> g unless explicit density is provided.
 */
export class UnitNormalizer {
  /**
   * Calculates normalized prices (per 100g, per kg, per liter, or per unit).
   */
  public static normalizePrice(
    price: number,
    quantityValue: number,
    unit: SupportedUnit
  ): PriceNormalizationResult {
    if (quantityValue <= 0) {
      throw new Error(`Invalid quantity value: ${quantityValue}. Must be greater than 0.`);
    }
    if (price < 0) {
      throw new Error(`Invalid price: ${price}. Cannot be negative.`);
    }

    const normalized: NormalizedPrices = {};
    let effectiveUnit: '100g' | '100ml' | 'unit' = '100g';
    let pricePerStandardBasis = 0;

    switch (unit) {
      case 'g': {
        // e.g. 500g at ₹92 => ₹18.40 / 100g, ₹184 / 1kg
        const perGram = price / quantityValue;
        normalized.pricePer100g = Number((perGram * 100).toFixed(2));
        normalized.pricePerKg = Number((perGram * 1000).toFixed(2));
        effectiveUnit = '100g';
        pricePerStandardBasis = normalized.pricePer100g;
        break;
      }
      case 'kg': {
        // e.g. 1kg at ₹160 => ₹160 / kg, ₹16 / 100g
        const totalGrams = quantityValue * 1000;
        const perGram = price / totalGrams;
        normalized.pricePer100g = Number((perGram * 100).toFixed(2));
        normalized.pricePerKg = Number(price.toFixed(2));
        effectiveUnit = '100g';
        pricePerStandardBasis = normalized.pricePer100g;
        break;
      }
      case 'ml': {
        // e.g. 200ml at ₹30 => ₹15 / 100ml, ₹150 / 1L
        const perMl = price / quantityValue;
        normalized.pricePerLiter = Number((perMl * 1000).toFixed(2));
        // We store pricePerLiter; price per 100ml is represented on basis
        effectiveUnit = '100ml';
        pricePerStandardBasis = Number((perMl * 100).toFixed(2));
        break;
      }
      case 'L': {
        // e.g. 1L at ₹70 => ₹70 / L, ₹7 / 100ml
        const totalMl = quantityValue * 1000;
        const perMl = price / totalMl;
        normalized.pricePerLiter = Number(price.toFixed(2));
        effectiveUnit = '100ml';
        pricePerStandardBasis = Number((perMl * 100).toFixed(2));
        break;
      }
      case 'piece':
      case 'pack': {
        const perUnit = price / quantityValue;
        normalized.pricePerUnit = Number(perUnit.toFixed(2));
        effectiveUnit = 'unit';
        pricePerStandardBasis = normalized.pricePerUnit;
        break;
      }
      default:
        throw new Error(`Unsupported unit '${unit}' provided for normalization.`);
    }

    return {
      normalized,
      effectiveUnit,
      pricePerStandardBasis,
    };
  }

  /**
   * Converts volume (ml) to weight (g) only when explicit food density (g/ml) is known.
   * Example: Whole cow milk density ~1.03 g/ml; mustard oil ~0.92 g/ml.
   * If density is undefined or null, returns null.
   */
  public static convertVolumeToWeight(
    volumeMl: number,
    densityGPerMl?: number
  ): number | null {
    if (!densityGPerMl || densityGPerMl <= 0) {
      return null;
    }
    return Number((volumeMl * densityGPerMl).toFixed(2));
  }

  /**
   * Scales a nutrient value from arbitrary weight in grams to 100g basis.
   */
  public static scaleNutrientTo100g(value: number, currentWeightGrams: number): number {
    if (currentWeightGrams <= 0) return 0;
    return Number(((value / currentWeightGrams) * 100).toFixed(2));
  }

  /**
   * Scales a 100g basis nutrient value to target serving size in grams.
   */
  public static scaleNutrientToServing(valuePer100g: number, servingGrams: number): number {
    return Number(((valuePer100g / 100) * servingGrams).toFixed(2));
  }
}
