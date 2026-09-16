import { connectDatabase, disconnectDatabase } from '../../../config/database';
import { NutritionIngestionService } from '../services/nutrition-ingestion.service';

const DEFAULT_SYNC_TARGETS = [
  'toor dal',
  'moong dal',
  'chana dal',
  'roasted chana',
  'wheat atta',
  'white rice',
  'poha',
  'soy chunks',
  'paneer',
  'curd',
  'milk',
  'egg',
  'chicken breast',
  'oats',
  'banana',
  'potato',
  'onion',
  'tomato',
  'spinach',
];

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const customItems = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
  const targets = customItems.length > 0 ? customItems : DEFAULT_SYNC_TARGETS;

  console.log(`\n======================================================`);
  console.log(`[SYNC-NUTRITION] Running Nutrition Sync (DryRun: ${isDryRun})`);
  console.log(`[SYNC-NUTRITION] Targets (${targets.length}): ${targets.join(', ')}`);
  console.log(`======================================================\n`);

  await connectDatabase();

  try {
    const service = new NutritionIngestionService();
    const summary = await service.ingestFoodList(targets, { isDryRun });

    console.log(`\n---------------- Ingestion Summary ----------------`);
    console.log(`Total Requested:    ${summary.requested}`);
    console.log(`Successful:         ${summary.successful}`);
    console.log(`Skipped Duplicates: ${summary.duplicates}`);
    console.log(`Rejected:           ${summary.rejected}`);
    console.log(`Failed:             ${summary.failed}`);
    console.log(`Warnings Generated: ${summary.warningsCount}`);
    console.log(`---------------------------------------------------\n`);

    for (const r of summary.records) {
      console.log(`• [${r.action}] ${r.name} (${r.provider})`);
      if (r.warnings.length > 0) {
        console.log(`    ⚠️  Warnings: ${r.warnings.join(' | ')}`);
      }
      if (r.errors.length > 0) {
        console.log(`    ❌ Errors: ${r.errors.join(' | ')}`);
      }
    }
  } catch (err: any) {
    console.error(`[SYNC-NUTRITION] Error:`, err);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

if (require.main === module) {
  main().then(() => process.exit(0));
}
