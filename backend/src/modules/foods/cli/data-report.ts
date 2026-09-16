import { connectDatabase, disconnectDatabase } from '../../../config/database';
import { CanonicalFood } from '../../../database/models/CanonicalFood';
import { PriceObservation } from '../../../database/models/PriceObservation';
import { CurrentPriceEngine } from '../services/price.engine';

async function main() {
  await connectDatabase();

  try {
    const totalFoods = await CanonicalFood.countDocuments();
    const highConf = await CanonicalFood.countDocuments({ 'source.confidence': 'HIGH' });
    const medConf = await CanonicalFood.countDocuments({ 'source.confidence': 'MEDIUM' });
    const lowConf = await CanonicalFood.countDocuments({ 'source.confidence': 'LOW' });

    const usdaCount = await CanonicalFood.countDocuments({ 'source.provider': 'USDA' });
    const ifctCount = await CanonicalFood.countDocuments({ 'source.provider': 'IFCT' });
    const pkgCount = await CanonicalFood.countDocuments({ 'source.provider': 'PACKAGED' });

    // Evaluate prices for default city
    const foods = await CanonicalFood.find({ isActive: true }).lean();
    const engine = new CurrentPriceEngine();

    let liveCount = 0;
    let recentCount = 0;
    let agingCount = 0;
    let staleCount = 0;
    let missingCount = 0;

    let govtPriceCount = 0;
    let manualPriceCount = 0;
    let instamartPriceCount = 0;
    let blinkitPriceCount = 0;
    let historicalPriceCount = 0;

    for (const food of foods) {
      const best = await engine.getBestPrice(food, { city: 'Indore', state: 'Madhya Pradesh' });
      switch (best.freshness) {
        case 'LIVE':
          liveCount++;
          break;
        case 'RECENT':
          recentCount++;
          break;
        case 'AGING':
          agingCount++;
          break;
        case 'STALE':
          staleCount++;
          break;
        case 'ESTIMATED':
          missingCount++;
          break;
      }

      switch (best.source) {
        case 'GOVERNMENT_RETAIL_MONITOR':
          govtPriceCount++;
          break;
        case 'MANUAL_VERIFIED':
          manualPriceCount++;
          break;
        case 'INSTAMART':
          instamartPriceCount++;
          break;
        case 'BLINKIT':
          blinkitPriceCount++;
          break;
        case 'HISTORICAL_DB':
          historicalPriceCount++;
          break;
      }
    }

    const reviewFoods = await CanonicalFood.find({
      'dataQuality.warnings.0': { $exists: true },
    }).lean();

    console.log(`\n======================================================`);
    console.log(`             DATA QUALITY AUDIT REPORT                `);
    console.log(`======================================================\n`);
    console.log(`Total canonical foods: ${totalFoods}`);
    console.log(`\nNutrition:`);
    console.log(`  HIGH confidence:   ${highConf}`);
    console.log(`  MEDIUM:            ${medConf}`);
    console.log(`  LOW:               ${lowConf}`);
    console.log(`\nPrices (for target Indore market):`);
    console.log(`  LIVE:              ${liveCount}`);
    console.log(`  RECENT:            ${recentCount}`);
    console.log(`  AGING:             ${agingCount}`);
    console.log(`  STALE:             ${staleCount}`);
    console.log(`  ESTIMATED/MISSING: ${missingCount}`);
    console.log(`\nNutrition Providers:`);
    console.log(`  Approved IFCT:     ${ifctCount}`);
    console.log(`  USDA:              ${usdaCount}`);
    console.log(`  Packaged Goods:    ${pkgCount}`);
    console.log(`\nPrice Sources:`);
    console.log(`  Instamart (Auth):  ${instamartPriceCount}`);
    console.log(`  Blinkit (Auth):    ${blinkitPriceCount}`);
    console.log(`  Government DCA:    ${govtPriceCount}`);
    console.log(`  Manual Verified:   ${manualPriceCount}`);
    console.log(`  Historical DB:     ${historicalPriceCount}`);
    console.log(`\nQuality Flags:`);
    console.log(`  Foods requiring manual review: ${reviewFoods.length}`);
    if (reviewFoods.length > 0) {
      for (const f of reviewFoods) {
        console.log(`   - ${f.displayName || f.name}: ${f.dataQuality?.warnings.join('; ')}`);
      }
    }
    console.log(`\n======================================================\n`);
  } catch (err: any) {
    console.error(`[DATA-REPORT] Error:`, err);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

if (require.main === module) {
  main().then(() => process.exit(0));
}
