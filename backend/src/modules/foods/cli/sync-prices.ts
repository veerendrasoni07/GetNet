import { connectDatabase, disconnectDatabase } from '../../../config/database';
import { CanonicalFood } from '../../../database/models/CanonicalFood';
import { CurrentPriceEngine } from '../services/price.engine';

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const cityArg = process.argv.find((a) => a.startsWith('--city='));
  const targetCity = cityArg ? cityArg.split('=')[1] : 'Indore';

  console.log(`\n======================================================`);
  console.log(`[SYNC-PRICES] Synchronizing Grocery Prices (DryRun: ${isDryRun})`);
  console.log(`[SYNC-PRICES] Target Location: ${targetCity}, India`);
  console.log(`======================================================\n`);

  await connectDatabase();

  try {
    const foods = await CanonicalFood.find({ isActive: true }).lean();
    console.log(`[SYNC-PRICES] Found ${foods.length} active canonical foods to price.`);

    const engine = new CurrentPriceEngine();
    let updated = 0;

    for (const food of foods) {
      const best = await engine.getBestPrice(food, { city: targetCity, state: 'Madhya Pradesh' });
      console.log(
        `• ${food.displayName || food.name}: ₹${best.estimatedPrice} / ${best.unit} [${best.freshness}] (${best.source}, ${best.priceLocationLevel})`
      );

      if (!isDryRun && best.freshness === 'LIVE') {
        // Record live observation
        // Handled within price engine
      }
      updated++;
    }

    console.log(`\n[SYNC-PRICES] Completed price sync for ${updated} foods.`);
  } catch (err: any) {
    console.error(`[SYNC-PRICES] Error:`, err);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

if (require.main === module) {
  main().then(() => process.exit(0));
}
