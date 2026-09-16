import { UnitNormalizer } from '../normalization/unit.normalizer';
import { FoodValidator } from '../validation/food.validator';
import { ApprovedIFCTProvider } from '../providers/nutrition/ifct.provider';
import { USDAProvider } from '../providers/nutrition/usda.provider';
import { PackagedFoodProvider } from '../providers/nutrition/packaged.provider';
import { GovernmentPriceProvider } from '../providers/prices/government.provider';
import { ManualPriceProvider } from '../providers/prices/manual.provider';
import { CurrentPriceEngine } from '../services/price.engine';
import { NutritionIngestionService } from '../services/nutrition-ingestion.service';
import { projectCanonicalToFoodItem } from '../food.repository';

describe('Food, Nutrition & Price Ingestion Pipeline Tests', () => {
  // -------------------------------------------------------------
  // 1. UNIT & PRICE NORMALIZATION
  // -------------------------------------------------------------
  describe('UnitNormalizer', () => {
    it('normalizes ₹160 / 1kg correctly to ₹16 / 100g', () => {
      const res = UnitNormalizer.normalizePrice(160, 1, 'kg');
      expect(res.normalized.pricePerKg).toBe(160);
      expect(res.normalized.pricePer100g).toBe(16);
      expect(res.effectiveUnit).toBe('100g');
      expect(res.pricePerStandardBasis).toBe(16);
    });

    it('normalizes ₹92 / 500g correctly to ₹18.40 / 100g', () => {
      const res = UnitNormalizer.normalizePrice(92, 500, 'g');
      expect(res.normalized.pricePer100g).toBe(18.4);
      expect(res.normalized.pricePerKg).toBe(184);
      expect(res.effectiveUnit).toBe('100g');
    });

    it('normalizes ₹30 / 200ml correctly to ₹15 / 100ml and ₹150 / 1L', () => {
      const res = UnitNormalizer.normalizePrice(30, 200, 'ml');
      expect(res.normalized.pricePerLiter).toBe(150);
      expect(res.effectiveUnit).toBe('100ml');
      expect(res.pricePerStandardBasis).toBe(15);
    });

    it('refuses to convert volume to weight without density', () => {
      const converted = UnitNormalizer.convertVolumeToWeight(500);
      expect(converted).toBeNull();
    });

    it('converts volume to weight when density is supplied', () => {
      // Whole milk density ~1.03 g/ml
      const converted = UnitNormalizer.convertVolumeToWeight(500, 1.03);
      expect(converted).toBe(515);
    });

    it('throws error for invalid quantities or negative prices', () => {
      expect(() => UnitNormalizer.normalizePrice(-10, 100, 'g')).toThrow();
      expect(() => UnitNormalizer.normalizePrice(10, 0, 'g')).toThrow();
    });
  });

  // -------------------------------------------------------------
  // 2. NUTRITION VALIDATION & ATWATER SANITY
  // -------------------------------------------------------------
  describe('FoodValidator', () => {
    it('validates authentic nutrition records and computes Atwater calories', () => {
      // 100g raw moong dal: 24.5g P, 56.7g C, 1.2g F => ~335.6 kcal
      const result = FoodValidator.validateNutrition({
        basisGrams: 100,
        caloriesKcal: 326,
        proteinG: 24.5,
        carbohydratesG: 56.7,
        fatG: 1.2,
        fiberG: 8.2,
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.calculatedAtwaterCalories).toBeCloseTo(335.6, 1);
      expect(result.atwaterDeviationPercent).toBeLessThan(15);
    });

    it('rejects invalid records with negative nutrients or impossible macros', () => {
      const negativeCal = FoodValidator.validateNutrition({
        basisGrams: 100,
        caloriesKcal: -50,
        proteinG: 20,
        carbohydratesG: 10,
        fatG: 5,
        fiberG: 0,
      });
      expect(negativeCal.isValid).toBe(false);
      expect(negativeCal.errors).toContain('Calories cannot be negative.');

      const excessiveProtein = FoodValidator.validateNutrition({
        basisGrams: 100,
        caloriesKcal: 450,
        proteinG: 120, // > 100g on 100g basis
        carbohydratesG: 0,
        fatG: 0,
        fiberG: 0,
      });
      expect(excessiveProtein.isValid).toBe(false);
      expect(excessiveProtein.errors.some((e) => e.includes('cannot exceed 100g'))).toBe(true);
    });

    it('flags warnings on large Atwater deviations without invalidating record', () => {
      // Reported calories 200 vs calculated (10*4 + 10*4 + 1*9 = 89)
      const res = FoodValidator.validateNutrition({
        basisGrams: 100,
        caloriesKcal: 200,
        proteinG: 10,
        carbohydratesG: 10,
        fatG: 1,
        fiberG: 2,
      });
      expect(res.isValid).toBe(true);
      expect(res.warnings.some((w) => w.includes('Atwater caloric estimate'))).toBe(true);
    });

    it('detects potential duplicate foods correctly', () => {
      const existing = {
        name: 'toor dal raw',
        displayName: 'Toor Dal (Split Pigeon Pea, Raw)',
        aliases: ['arhar dal', 'tuvar dal'],
      };

      expect(FoodValidator.isPotentialDuplicate('Toor Dal Raw', [], existing)).toBe(true);
      expect(FoodValidator.isPotentialDuplicate('Arhar Dal', [], existing)).toBe(true);
      expect(FoodValidator.isPotentialDuplicate('moong dal raw', [], existing)).toBe(false);
    });
  });

  // -------------------------------------------------------------
  // 3. NUTRITION PROVIDERS (IFCT, USDA, PACKAGED)
  // -------------------------------------------------------------
  describe('Nutrition Providers', () => {
    it('Tier 1: ApprovedIFCTProvider returns authentic Indian food composition with HIGH confidence', async () => {
      const ifct = new ApprovedIFCTProvider();
      const results = await ifct.searchFood('toor dal');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].provider).toBe('IFCT');
      expect(results[0].dataType).toBe('IFCT_Verified');

      const details = await ifct.getFoodDetails(results[0].externalId);
      expect(details).not.toBeNull();
      expect(details!.source.provider).toBe('IFCT');
      expect(details!.source.version).toBe('2017');
      expect(details!.source.confidence).toBe('HIGH');
      expect(details!.nutrition.proteinG).toBeGreaterThan(20);
    });

    it('Tier 2: USDAProvider prioritizes SR Legacy/Foundation and matches state', async () => {
      const usda = new USDAProvider();
      const results = await usda.searchFood('oats raw', { foodType: 'RAW' });
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].provider).toBe('USDA');

      const details = await usda.getFoodDetails('171688');
      expect(details).not.toBeNull();
      expect(details!.nutrition.caloriesKcal).toBe(389);
      expect(details!.nutrition.proteinG).toBe(16.9);
      expect(details!.foodType).toBe('RAW');
    });

    it('Tier 3: PackagedFoodProvider resolves packaged staples (Whey, Peanut Butter)', async () => {
      const pkg = new PackagedFoodProvider();
      const results = await pkg.searchFood('whey protein');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].provider).toBe('PACKAGED');

      const details = await pkg.getFoodDetails(results[0].externalId);
      expect(details).not.toBeNull();
      expect(details!.category).toBe('SUPPLEMENTS');
      expect(details!.nutrition.proteinG).toBe(78);
    });
  });

  // -------------------------------------------------------------
  // 4. PRICE PROVIDERS & LOCATION HIERARCHY
  // -------------------------------------------------------------
  describe('Price Providers & Hierarchy', () => {
    it('GovernmentPriceProvider retrieves Indore commodity benchmark and falls back to National', async () => {
      const gov = new GovernmentPriceProvider();

      // Indore price
      const indorePrice = await gov.getPrice('wheat atta', { city: 'Indore', state: 'Madhya Pradesh' });
      expect(indorePrice).not.toBeNull();
      expect(indorePrice!.price).toBe(35); // ₹35/kg in Indore
      expect(indorePrice!.location.city).toBe('Indore');

      // Unlisted city falls back to National Baseline
      const nationalPrice = await gov.getPrice('wheat atta', { city: 'Guwahati', state: 'Assam' });
      expect(nationalPrice).not.toBeNull();
      expect(nationalPrice!.location.city).toBe('National Baseline');
      expect(nationalPrice!.price).toBe(37);
    });

    it('ManualPriceProvider retrieves verified fitness prices', async () => {
      const manual = new ManualPriceProvider();
      const res = await manual.getPrice('soy chunks dry', { city: 'Indore' });
      expect(res).not.toBeNull();
      expect(res!.price).toBe(45); // 200g @ ₹45
      expect(res!.quantity.value).toBe(200);
      expect(res!.quantity.unit).toBe('g');
    });
  });

  // -------------------------------------------------------------
  // 5. CURRENT PRICE ENGINE & FRESHNESS
  // -------------------------------------------------------------
  describe('CurrentPriceEngine', () => {
    const engine = new CurrentPriceEngine();

    it('determines freshness states correctly according to thresholds', () => {
      const now = new Date();
      expect(engine.calculateFreshness(now)).toBe('RECENT');

      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      expect(engine.calculateFreshness(twoDaysAgo)).toBe('AGING');

      const twentyDaysAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
      expect(engine.calculateFreshness(twentyDaysAgo)).toBe('STALE');

      const fortyDaysAgo = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);
      expect(engine.calculateFreshness(fortyDaysAgo)).toBe('ESTIMATED');
    });

    it('computes realistic price ranges and dynamic economics (cost per 25g protein)', async () => {
      const foodMock = {
        name: 'soy chunks dry',
        displayName: 'Textured Soy Protein',
        nutrition: {
          basisGrams: 100,
          caloriesKcal: 345,
          proteinG: 52.0,
          carbohydratesG: 33.0,
          fatG: 0.5,
          fiberG: 13.0,
        },
      };

      const result = await engine.getBestPrice(foodMock as any, { city: 'Indore' });
      expect(result.estimatedPrice).toBeGreaterThan(0);
      expect(result.range.min).toBeLessThan(result.estimatedPrice);
      expect(result.range.max).toBeGreaterThan(result.estimatedPrice);
      expect(result.currency).toBe('INR');
      expect(result.economics).toBeDefined();

      // At ₹22.50 per 100g with 52g protein:
      // costPerGram = 22.50 / 52 = ~0.43
      // costPer25g = ~10.82
      expect(result.economics!.proteinPer100g).toBe(52);
      expect(result.economics!.costPerGramProtein).toBeCloseTo(0.43, 1);
      expect(result.economics!.costPer25gProtein).toBeLessThan(15);
    });

    it('handles zero or missing protein without crashing economics calculation', () => {
      const zeroProteinFood = {
        name: 'mustard oil',
        nutrition: {
          basisGrams: 100,
          caloriesKcal: 884,
          proteinG: 0,
          carbohydratesG: 0,
          fatG: 100,
          fiberG: 0,
        },
      };

      const economics = engine.calculateEconomics(zeroProteinFood, 14.0, '100g');
      expect(economics?.proteinPer100g).toBe(0);
      expect(economics?.costPerGramProtein).toBeUndefined();
      expect(economics?.costPer25gProtein).toBeUndefined();
      expect(economics?.costPer100Kcal).toBeDefined();
    });
  });

  // -------------------------------------------------------------
  // 6. RAW VS COOKED DISTINCTION
  // -------------------------------------------------------------
  describe('Cooked vs Raw distinction', () => {
    it('strictly separates 100g raw rice from 100g cooked rice', () => {
      const rawRice = {
        name: 'white rice raw',
        nutrition: { basisGrams: 100, caloriesKcal: 353, proteinG: 6.8, carbohydratesG: 78.2, fatG: 0.5, fiberG: 2.8 },
      };
      const cookedRice = {
        name: 'white rice cooked',
        nutrition: { basisGrams: 100, caloriesKcal: 130, proteinG: 2.7, carbohydratesG: 28.2, fatG: 0.3, fiberG: 0.4 },
      };

      expect(rawRice.nutrition.caloriesKcal).toBeGreaterThan(cookedRice.nutrition.caloriesKcal * 2);
      expect(rawRice.nutrition.proteinG).toBeGreaterThan(cookedRice.nutrition.proteinG * 2);
    });
  });

  // -------------------------------------------------------------
  // 7. RECOMMENDATION REPOSITORY PROJECTION
  // -------------------------------------------------------------
  describe('projectCanonicalToFoodItem', () => {
    it('projects a CanonicalFood document into the exact FoodItem shape expected by optimizer', () => {
      const canonical = {
        _id: '65f1234567890abcdef12345',
        name: 'paneer raw',
        displayName: 'Fresh Paneer',
        dietaryTags: ['vegetarian', 'gluten_free'],
        nutrition: {
          basisGrams: 100,
          caloriesKcal: 265,
          proteinG: 18.0,
          carbohydratesG: 3.4,
          fatG: 20.8,
          fiberG: 0,
        },
        servings: [{ name: '100g block', grams: 100 }],
        cookingRequired: false,
        requiredEquipment: [],
        fridgeRequired: true,
        portability: 'medium',
        hostelSuitability: 'good',
        allowedMealCategories: ['snack', 'dinner'],
        minServingsPerDay: 1,
        maxServingsPerDay: 2,
      };

      const foodItem = projectCanonicalToFoodItem(canonical, 40);
      expect(foodItem.id).toBe('65f1234567890abcdef12345');
      expect(foodItem.name).toBe('Fresh Paneer');
      expect(foodItem.servingSizeGramsOrMl).toBe(100);
      expect(foodItem.calories).toBe(265);
      expect(foodItem.protein).toBe(18);
      expect(foodItem.estimatedCostInr).toBe(40);
      expect(foodItem.dietType).toBe('vegetarian');
      expect(foodItem.costPer10gProtein).toBeDefined();
      expect(foodItem.costPer100Calories).toBeDefined();
      expect(foodItem.proteinPer100Calories).toBeDefined();
    });
  });

  // -------------------------------------------------------------
  // 8. INGESTION SERVICE & DRY-RUN
  // -------------------------------------------------------------
  describe('NutritionIngestionService', () => {
    it('supports dry-run mode without writing to MongoDB', async () => {
      const service = new NutritionIngestionService();
      const summary = await service.ingestFoodList(['toor dal', 'soy chunks'], {
        isDryRun: true,
      });

      expect(summary.requested).toBe(2);
      expect(summary.successful).toBe(2);
      expect(summary.records.every((r) => r.action === 'DRY_RUN_PLAN')).toBe(true);
    });
  });
});
