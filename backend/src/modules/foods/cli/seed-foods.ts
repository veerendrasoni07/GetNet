import { connectDatabase, disconnectDatabase } from '../../../config/database';
import { CanonicalFood } from '../../../database/models/CanonicalFood';
import { PriceObservation } from '../../../database/models/PriceObservation';
import { INITIAL_VERIFIED_INDIAN_FOODS } from '../data/initial-foods';
import { INITIAL_PRICE_OBSERVATIONS } from '../data/initial-prices';
import { UnitNormalizer } from '../normalization/unit.normalizer';
import { NutritionIngestionService } from '../services/nutrition-ingestion.service';

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  console.log(`\n======================================================`);
  console.log(`[SEED-FOODS] Starting Seed Ingestion (DryRun: ${isDryRun})`);
  console.log(`======================================================\n`);

  await connectDatabase();

  try {
    // 1. Ingest Canonical Foods
    const ingestionService = new NutritionIngestionService();
    console.log(`[SEED-FOODS] Seeding ${INITIAL_VERIFIED_INDIAN_FOODS.length} verified canonical foods...`);
    const nutritionSummary = await ingestionService.ingestFoodList(
      INITIAL_VERIFIED_INDIAN_FOODS,
      { isDryRun, forceUpdate: true }
    );

    console.log(`\n[SEED-FOODS] Nutrition Ingestion Results:`);
    console.log(`  - Total Requested: ${nutritionSummary.requested}`);
    console.log(`  - Successful:      ${nutritionSummary.successful}`);
    console.log(`  - Rejected:        ${nutritionSummary.rejected}`);
    console.log(`  - Duplicates:      ${nutritionSummary.duplicates}`);
    console.log(`  - Warnings:        ${nutritionSummary.warningsCount}`);

    // 2. Ingest Initial Price Observations
    console.log(`\n[SEED-FOODS] Seeding ${INITIAL_PRICE_OBSERVATIONS.length} initial price observations...`);
    let pricesInserted = 0;

    for (const p of INITIAL_PRICE_OBSERVATIONS) {
      const food = await CanonicalFood.findOne({
        $or: [{ name: p.foodName }, { displayName: p.foodName }, { aliases: p.foodName }],
      });

      if (!food) {
        console.warn(`[SEED-PRICES] Food '${p.foodName}' not found in canonical DB. Skipping observation.`);
        continue;
      }

      const norm = UnitNormalizer.normalizePrice(p.sellingPrice, p.quantityValue, p.unit);

      if (!isDryRun) {
        await PriceObservation.create({
          canonicalFoodId: food._id,
          provider: p.provider,
          seller: p.brand,
          location: {
            country: 'India',
            state: p.state,
            city: p.city,
          },
          price: {
            sellingPrice: p.sellingPrice,
            mrp: p.mrp,
            currency: 'INR',
          },
          quantity: {
            value: p.quantityValue,
            unit: p.unit,
          },
          normalized: norm.normalized,
          availability: 'in_stock',
          observedAt: new Date(),
          confidenceScore: p.confidenceScore,
        });
      }
      pricesInserted++;
    }

    console.log(`[SEED-FOODS] Price Observations ${isDryRun ? 'Planned' : 'Inserted'}: ${pricesInserted}/${INITIAL_PRICE_OBSERVATIONS.length}`);
    console.log(`\n======================================================`);
    console.log(`[SEED-FOODS] Seeding complete.`);
    console.log(`======================================================\n`);
  } catch (err: any) {
    console.error(`[SEED-FOODS] Fatal Error:`, err);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

if (require.main === module) {
  main().then(() => process.exit(0));
}
