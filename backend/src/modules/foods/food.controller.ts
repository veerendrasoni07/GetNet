import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { CanonicalFood } from '../../database/models/CanonicalFood';
import { PriceObservation } from '../../database/models/PriceObservation';
import { INITIAL_VERIFIED_INDIAN_FOODS } from './data/initial-foods';
import { INITIAL_PRICE_OBSERVATIONS } from './data/initial-prices';
import { CurrentPriceEngine } from './services/price.engine';

const priceEngine = new CurrentPriceEngine();

function isConnectedToDatabase(): boolean {
  return Boolean(CanonicalFood.db && CanonicalFood.db.readyState === 1);
}

export async function listFoodsHandler(req: Request, res: Response): Promise<void> {
  try {
    const { search, category, foodType, dietType, city = 'Indore', state, page = '1', limit = '20' } = req.query;
    const isDbConnected = isConnectedToDatabase();

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    let total = 0;
    let rawFoods: any[] = [];

    if (isDbConnected) {
      const query: any = { isActive: true };

      if (category) {
        query.category = String(category).toUpperCase();
      }
      if (foodType) {
        query.foodType = String(foodType).toUpperCase();
      }
      if (dietType) {
        query.dietaryTags = String(dietType).toLowerCase();
      }
      if (search) {
        const searchStr = String(search).trim();
        query.$or = [
          { name: new RegExp(searchStr, 'i') },
          { displayName: new RegExp(searchStr, 'i') },
          { aliases: new RegExp(searchStr, 'i') },
        ];
      }

      [total, rawFoods] = await Promise.all([
        CanonicalFood.countDocuments(query),
        CanonicalFood.find(query).skip(skip).limit(limitNum).lean(),
      ]);
    } else {
      // In-memory offline fallback for testing & cold-start
      let filtered = [...INITIAL_VERIFIED_INDIAN_FOODS];

      if (category) {
        filtered = filtered.filter((f) => f.category === String(category).toUpperCase());
      }
      if (foodType) {
        filtered = filtered.filter((f) => f.foodType === String(foodType).toUpperCase());
      }
      if (dietType) {
        filtered = filtered.filter((f) => f.dietaryTags.includes(String(dietType).toLowerCase()));
      }
      if (search) {
        const s = String(search).toLowerCase().trim();
        filtered = filtered.filter(
          (f) =>
            f.name.toLowerCase().includes(s) ||
            f.displayName.toLowerCase().includes(s) ||
            f.aliases.some((a) => a.toLowerCase().includes(s))
        );
      }

      total = filtered.length;
      rawFoods = filtered.slice(skip, skip + limitNum).map((f) => ({
        ...f,
        _id: `mem_${f.name.replace(/\s+/g, '_')}`,
      }));
    }

    // Enrich each food with location-aware price
    const enriched = await Promise.all(
      rawFoods.map(async (food) => {
        const priceResult = await priceEngine.getBestPrice(food, {
          city: String(city),
          state: state ? String(state) : undefined,
        });

        return {
          id: food._id,
          name: food.displayName || food.name,
          category: food.category,
          foodType: food.foodType,
          dietaryTags: food.dietaryTags,
          nutrition: food.nutrition,
          servings: food.servings,
          price: {
            estimated: priceResult.estimatedPrice,
            range: priceResult.range,
            currency: priceResult.currency,
            basis: priceResult.unit,
            source: priceResult.source,
            location: priceResult.location,
            freshness: priceResult.freshness,
            level: priceResult.priceLocationLevel,
            lastUpdated: priceResult.lastUpdated,
          },
          economics: priceResult.economics,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: enriched,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getFoodByIdHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { city = 'Indore', state, postalCode } = req.query;
    const isDbConnected = isConnectedToDatabase();

    let food: any = null;

    if (isDbConnected) {
      if (Types.ObjectId.isValid(id)) {
        food = await CanonicalFood.findById(id).lean();
      } else {
        food = await CanonicalFood.findOne({ name: id.toLowerCase() }).lean();
      }
    } else {
      const cleanId = id.toLowerCase().replace(/^mem_/, '').replace(/_/g, ' ');
      food = INITIAL_VERIFIED_INDIAN_FOODS.find(
        (f) =>
          f.name.toLowerCase() === cleanId ||
          f.displayName.toLowerCase() === cleanId ||
          f.aliases.some((a) => a.toLowerCase() === cleanId)
      );
      if (food) {
        food = {
          ...food,
          _id: `mem_${food.name.replace(/\s+/g, '_')}`,
        };
      }
    }

    if (!food) {
      res.status(404).json({ success: false, error: `Food '${id}' not found` });
      return;
    }

    const priceResult = await priceEngine.getBestPrice(food, {
      city: String(city),
      state: state ? String(state) : undefined,
      postalCode: postalCode ? String(postalCode) : undefined,
    });

    res.status(200).json({
      success: true,
      data: {
        id: food._id,
        name: food.displayName || food.name,
        aliases: food.aliases,
        category: food.category,
        foodType: food.foodType,
        dietaryTags: food.dietaryTags,
        nutrition: food.nutrition,
        nutritionQuality: {
          source: food.source?.provider,
          externalId: food.source?.externalId,
          version: food.source?.version,
          confidence: food.source?.confidence || 'HIGH',
          verified: food.dataQuality?.verified ?? true,
          warnings: food.dataQuality?.warnings || [],
        },
        servings: food.servings,
        price: {
          estimated: priceResult.estimatedPrice,
          range: priceResult.range,
          currency: priceResult.currency,
          basis: priceResult.unit,
          source: priceResult.source,
          location: priceResult.location,
          freshness: priceResult.freshness,
          level: priceResult.priceLocationLevel,
          confidenceScore: priceResult.confidenceScore,
          lastUpdated: priceResult.lastUpdated,
        },
        economics: priceResult.economics,
        lifestyle: {
          cookingRequired: food.cookingRequired,
          requiredEquipment: food.requiredEquipment,
          fridgeRequired: food.fridgeRequired,
          portability: food.portability,
          hostelSuitability: food.hostelSuitability,
          allowedMealCategories: food.allowedMealCategories,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getFoodPriceHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { city = 'Indore', state, postalCode } = req.query;
    const isDbConnected = isConnectedToDatabase();

    let food: any = null;

    if (isDbConnected) {
      if (Types.ObjectId.isValid(id)) {
        food = await CanonicalFood.findById(id).lean();
      } else {
        food = await CanonicalFood.findOne({ name: id.toLowerCase() }).lean();
      }
    } else {
      const cleanId = id.toLowerCase().replace(/^mem_/, '').replace(/_/g, ' ');
      food = INITIAL_VERIFIED_INDIAN_FOODS.find(
        (f) =>
          f.name.toLowerCase() === cleanId ||
          f.displayName.toLowerCase() === cleanId ||
          f.aliases.some((a) => a.toLowerCase() === cleanId)
      );
      if (food) {
        food = {
          ...food,
          _id: `mem_${food.name.replace(/\s+/g, '_')}`,
        };
      }
    }

    if (!food) {
      res.status(404).json({ success: false, error: `Food '${id}' not found` });
      return;
    }

    const priceResult = await priceEngine.getBestPrice(food, {
      city: String(city),
      state: state ? String(state) : undefined,
      postalCode: postalCode ? String(postalCode) : undefined,
    });

    res.status(200).json({
      success: true,
      data: priceResult,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getQualityReportHandler(req: Request, res: Response): Promise<void> {
  try {
    const isDbConnected = isConnectedToDatabase();

    if (isDbConnected) {
      const totalFoods = await CanonicalFood.countDocuments();
      const highConfNutrition = await CanonicalFood.countDocuments({ 'source.confidence': 'HIGH' });
      const medConfNutrition = await CanonicalFood.countDocuments({ 'source.confidence': 'MEDIUM' });
      const lowConfNutrition = await CanonicalFood.countDocuments({ 'source.confidence': 'LOW' });

      const ifctCount = await CanonicalFood.countDocuments({ 'source.provider': 'IFCT' });
      const usdaCount = await CanonicalFood.countDocuments({ 'source.provider': 'USDA' });
      const pkgCount = await CanonicalFood.countDocuments({ 'source.provider': 'PACKAGED' });

      const totalObservations = await PriceObservation.countDocuments();
      const govObs = await PriceObservation.countDocuments({ provider: 'GOVERNMENT_RETAIL_MONITOR' });
      const manualObs = await PriceObservation.countDocuments({ provider: 'MANUAL_VERIFIED' });

      const foodsWithWarnings = await CanonicalFood.find(
        { 'dataQuality.warnings.0': { $exists: true } },
        'name displayName dataQuality.warnings'
      ).lean();

      res.status(200).json({
        success: true,
        report: {
          totalCanonicalFoods: totalFoods,
          nutritionConfidence: {
            HIGH: highConfNutrition,
            MEDIUM: medConfNutrition,
            LOW: lowConfNutrition,
          },
          nutritionProviders: {
            IFCT: ifctCount,
            USDA: usdaCount,
            PACKAGED: pkgCount,
          },
          priceObservations: {
            total: totalObservations,
            government: govObs,
            manual: manualObs,
          },
          foodsRequiringReview: foodsWithWarnings.map((f) => ({
            name: f.displayName || f.name,
            warnings: f.dataQuality?.warnings,
          })),
        },
      });
    } else {
      // In-memory summary
      const totalFoods = INITIAL_VERIFIED_INDIAN_FOODS.length;
      const ifctCount = INITIAL_VERIFIED_INDIAN_FOODS.filter((f) => f.source.provider === 'IFCT').length;
      const usdaCount = INITIAL_VERIFIED_INDIAN_FOODS.filter((f) => f.source.provider === 'USDA').length;
      const pkgCount = INITIAL_VERIFIED_INDIAN_FOODS.filter((f) => f.source.provider === 'PACKAGED').length;

      res.status(200).json({
        success: true,
        report: {
          totalCanonicalFoods: totalFoods,
          nutritionConfidence: {
            HIGH: totalFoods,
            MEDIUM: 0,
            LOW: 0,
          },
          nutritionProviders: {
            IFCT: ifctCount,
            USDA: usdaCount,
            PACKAGED: pkgCount,
          },
          priceObservations: {
            total: INITIAL_PRICE_OBSERVATIONS.length,
            government: INITIAL_PRICE_OBSERVATIONS.filter((p) => p.provider === 'GOVERNMENT_RETAIL_MONITOR').length,
            manual: INITIAL_PRICE_OBSERVATIONS.filter((p) => p.provider === 'MANUAL_VERIFIED').length,
          },
          foodsRequiringReview: [],
        },
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
