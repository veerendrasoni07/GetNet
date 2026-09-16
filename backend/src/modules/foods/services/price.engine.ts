import { Types } from 'mongoose';
import { env } from '../../../config/env';
import { CanonicalFood, CanonicalFoodDocument } from '../../../database/models/CanonicalFood';
import { PriceObservation } from '../../../database/models/PriceObservation';
import { UnitNormalizer } from '../normalization/unit.normalizer';
import { BlinkitPriceProvider } from '../providers/prices/blinkit.provider';
import { GovernmentPriceProvider } from '../providers/prices/government.provider';
import { HistoricalPriceProvider } from '../providers/prices/historical.provider';
import { InstamartPriceProvider } from '../providers/prices/instamart.provider';
import { ManualPriceProvider } from '../providers/prices/manual.provider';
import { PriceCandidate, PriceProvider } from '../providers/prices/price-provider.interface';

export type PriceFreshness = 'LIVE' | 'RECENT' | 'AGING' | 'STALE' | 'ESTIMATED';
export type PriceLocationLevel = 'LOCAL' | 'CITY' | 'STATE' | 'NATIONAL';

export interface LocationQuery {
  country?: string;
  state?: string;
  city: string;
  postalCode?: string;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface BestPriceResult {
  foodId?: string;
  foodName: string;
  estimatedPrice: number;
  range: PriceRange;
  unit: '100g' | '100ml' | 'unit';
  pricePer100g?: number;
  currency: 'INR';
  freshness: PriceFreshness;
  priceLocationLevel: PriceLocationLevel;
  location: string;
  source: string;
  confidenceScore: number;
  lastUpdated: Date;
  economics?: {
    proteinPer100g?: number;
    costPerGramProtein?: number;
    costPer25gProtein?: number;
    costPer100Kcal?: number;
  };
}

export class CurrentPriceEngine {
  private instamartProvider = new InstamartPriceProvider();
  private blinkitProvider = new BlinkitPriceProvider();
  private governmentProvider = new GovernmentPriceProvider();
  private historicalProvider = new HistoricalPriceProvider();
  private manualProvider = new ManualPriceProvider();

  /**
   * Resolves the best, location-aware price for a canonical food.
   * Traverses priority chain with strict fallback and freshness determination.
   */
  public async getBestPrice(
    food: CanonicalFoodDocument | { _id?: any; name: string; displayName?: string; nutrition?: any },
    location: LocationQuery
  ): Promise<BestPriceResult> {
    const foodName = food.name;
    const foodId = food._id ? String(food._id) : undefined;
    const targetCity = location.city.trim();

    // 1. Check Priority 1: Authorized Instamart
    if (this.instamartProvider.isAvailable()) {
      const candidate = await this.instamartProvider.getPrice(foodName, location);
      if (candidate) {
        return this.formatPriceResult(food, candidate, 'LIVE', 'CITY');
      }
    }

    // 2. Check Priority 2: Authorized Blinkit
    if (this.blinkitProvider.isAvailable()) {
      const candidate = await this.blinkitProvider.getPrice(foodName, location);
      if (candidate) {
        return this.formatPriceResult(food, candidate, 'LIVE', 'CITY');
      }
    }

    // 3. Check Priority 3: Government Retail Price Monitor
    const govCandidate = await this.governmentProvider.getPrice(foodName, location);
    if (govCandidate) {
      const isCityMatch =
        govCandidate.location.city.toLowerCase() === targetCity.toLowerCase();
      const level: PriceLocationLevel = isCityMatch ? 'CITY' : 'NATIONAL';
      const freshness = this.calculateFreshness(govCandidate.observedAt);
      return this.formatPriceResult(food, govCandidate, freshness, level);
    }

    // 4. Check Priority 4: Stored Recent Price Observations in MongoDB
    if (foodId && Types.ObjectId.isValid(foodId)) {
      const histCandidate = await this.historicalProvider.getPrice(foodId, location);
      if (histCandidate) {
        const isCityMatch =
          histCandidate.location.city.toLowerCase() === targetCity.toLowerCase();
        const level: PriceLocationLevel = isCityMatch ? 'CITY' : 'STATE';
        const freshness = this.calculateFreshness(histCandidate.observedAt);
        return this.formatPriceResult(food, histCandidate, freshness, level);
      }
    }

    // 5. Check Priority 5: Admin / Manual Verified Staples
    const manualCandidate = await this.manualProvider.getPrice(foodName, location);
    if (manualCandidate) {
      return this.formatPriceResult(food, manualCandidate, 'RECENT', 'CITY');
    }

    // 6. Priority 6: Statistical Baseline Fallback (ESTIMATED)
    return this.createEstimatedFallback(food, location);
  }

  /**
   * Records a verified price observation into MongoDB.
   * Strictly append-only: Never overwrites past records.
   */
  public async recordObservation(
    canonicalFoodId: Types.ObjectId,
    candidate: PriceCandidate
  ): Promise<void> {
    const norm = UnitNormalizer.normalizePrice(
      candidate.price,
      candidate.quantity.value,
      candidate.quantity.unit
    );

    await PriceObservation.create({
      canonicalFoodId,
      provider: candidate.sourceProvider,
      seller: candidate.brand,
      location: candidate.location,
      price: {
        sellingPrice: candidate.price,
        mrp: candidate.mrp,
        currency: candidate.currency,
      },
      quantity: candidate.quantity,
      normalized: norm.normalized,
      availability: candidate.availability,
      observedAt: candidate.observedAt,
      expiresAt: candidate.expiresAt,
      sourceMetadata: candidate.sourceMetadata,
      confidenceScore: candidate.confidenceScore,
    });
  }

  /**
   * Calculates freshness state based on configured time thresholds.
   */
  public calculateFreshness(observedAt: Date): PriceFreshness {
    const now = Date.now();
    const ageMs = now - new Date(observedAt).getTime();
    const ageHours = ageMs / (1000 * 60 * 60);
    const ageDays = ageHours / 24;

    if (ageHours <= env.PRICE_RECENT_HOURS) {
      return 'RECENT';
    }
    if (ageDays <= env.PRICE_AGING_DAYS) {
      return 'AGING';
    }
    if (ageDays <= env.PRICE_STALE_DAYS) {
      return 'STALE';
    }
    return 'ESTIMATED';
  }

  private formatPriceResult(
    food: any,
    candidate: PriceCandidate,
    freshness: PriceFreshness,
    level: PriceLocationLevel
  ): BestPriceResult {
    const norm = UnitNormalizer.normalizePrice(
      candidate.price,
      candidate.quantity.value,
      candidate.quantity.unit
    );

    const estPrice = norm.pricePerStandardBasis;
    // Derive realistic price range around normalized price (e.g. ±7%) to capture retail variance
    const minPrice = Number((estPrice * 0.93).toFixed(2));
    const maxPrice = Number((estPrice * 1.07).toFixed(2));

    const economics = this.calculateEconomics(food, estPrice, norm.effectiveUnit);

    return {
      foodId: food._id ? String(food._id) : undefined,
      foodName: food.displayName || food.name,
      estimatedPrice: estPrice,
      range: {
        min: minPrice,
        max: maxPrice,
      },
      unit: norm.effectiveUnit,
      pricePer100g: norm.effectiveUnit === '100g' ? estPrice : undefined,
      currency: 'INR',
      freshness,
      priceLocationLevel: level,
      location: candidate.location.city,
      source: candidate.sourceProvider,
      confidenceScore: candidate.confidenceScore,
      lastUpdated: candidate.observedAt,
      economics,
    };
  }

  private createEstimatedFallback(food: any, location: LocationQuery): BestPriceResult {
    // Standard baseline estimate (e.g. ₹20 per 100g default for unlisted grocery)
    const defaultPricePer100g = 20.0;
    const economics = this.calculateEconomics(food, defaultPricePer100g, '100g');

    return {
      foodId: food._id ? String(food._id) : undefined,
      foodName: food.displayName || food.name,
      estimatedPrice: defaultPricePer100g,
      range: {
        min: 15.0,
        max: 25.0,
      },
      unit: '100g',
      pricePer100g: defaultPricePer100g,
      currency: 'INR',
      freshness: 'ESTIMATED',
      priceLocationLevel: 'NATIONAL',
      location: 'National Estimate',
      source: 'STATISTICAL_ESTIMATE',
      confidenceScore: 50,
      lastUpdated: new Date(),
      economics,
    };
  }

  /**
   * Calculates derived economic metrics: cost per gram protein, cost per 25g protein, cost per 100 kcal.
   * Safe with 0 protein/calories.
   */
  public calculateEconomics(
    food: any,
    pricePerStandardBasis: number,
    unit: '100g' | '100ml' | 'unit'
  ) {
    const nutrition = food.nutrition;
    if (!nutrition) return undefined;

    const proteinPer100g = nutrition.proteinG || 0;
    const caloriesPer100g = nutrition.caloriesKcal || 0;

    let costPerGramProtein: number | undefined;
    let costPer25gProtein: number | undefined;
    let costPer100Kcal: number | undefined;

    if (proteinPer100g > 0 && unit === '100g') {
      costPerGramProtein = Number((pricePerStandardBasis / proteinPer100g).toFixed(2));
      costPer25gProtein = Number((costPerGramProtein * 25).toFixed(2));
    }

    if (caloriesPer100g > 0 && unit === '100g') {
      costPer100Kcal = Number(((pricePerStandardBasis / caloriesPer100g) * 100).toFixed(2));
    }

    return {
      proteinPer100g,
      costPerGramProtein,
      costPer25gProtein,
      costPer100Kcal,
    };
  }
}
