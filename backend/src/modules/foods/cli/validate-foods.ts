import { connectDatabase, disconnectDatabase } from '../../../config/database';
import { CanonicalFood } from '../../../database/models/CanonicalFood';
import { PriceObservation } from '../../../database/models/PriceObservation';
import { FoodValidator } from '../validation/food.validator';

async function main() {
  console.log(`\n======================================================`);
  console.log(`[VALIDATE-FOODS] Running Database Integrity Checks`);
  console.log(`======================================================\n`);

  await connectDatabase();

  try {
    const foods = await CanonicalFood.find({}).lean();
    console.log(`Auditing ${foods.length} Canonical Food records...\n`);

    let errorCount = 0;
    let warningCount = 0;
    const namesSet = new Set<string>();

    for (const food of foods) {
      // 1. Check duplicate normalized names
      const normName = FoodValidator.normalizeFoodName(food.name);
      if (namesSet.has(normName)) {
        console.error(`❌ Duplicate canonical name detected: '${food.name}' (ID: ${food._id})`);
        errorCount++;
      }
      namesSet.add(normName);

      // 2. Nutrition validation
      const validation = FoodValidator.validateNutrition(food.nutrition);
      if (!validation.isValid) {
        console.error(`❌ Nutrition sanity failed for '${food.name}': ${validation.errors.join(', ')}`);
        errorCount += validation.errors.length;
      }
      if (validation.warnings.length > 0) {
        console.warn(`⚠️  Nutrition warning for '${food.name}': ${validation.warnings.join(', ')}`);
        warningCount += validation.warnings.length;
      }

      // 3. Source provenance check
      if (!food.source || !food.source.provider) {
        console.error(`❌ Missing source provenance for '${food.name}'`);
        errorCount++;
      }
    }

    // 4. Orphan price observations check
    const totalObservations = await PriceObservation.countDocuments();
    const orphanCount = await PriceObservation.countDocuments({
      canonicalFoodId: { $nin: foods.map((f) => f._id) },
    });

    if (orphanCount > 0) {
      console.error(`❌ Found ${orphanCount} orphaned price observations without canonical food!`);
      errorCount += orphanCount;
    }

    console.log(`\n================ Validation Summary ================`);
    console.log(`Total Foods Checked:             ${foods.length}`);
    console.log(`Total Price Observations:        ${totalObservations}`);
    console.log(`Integrity Errors:                ${errorCount}`);
    console.log(`Warnings (Atwater/Deviations):   ${warningCount}`);
    console.log(`====================================================\n`);

    if (errorCount > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error(`[VALIDATE-FOODS] Error:`, err);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

if (require.main === module) {
  main().then(() => process.exit(0));
}
