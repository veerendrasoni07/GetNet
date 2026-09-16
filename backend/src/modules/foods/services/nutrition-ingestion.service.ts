import { CanonicalFood, CanonicalFoodDocument } from '../../../database/models/CanonicalFood';
import { DataIngestionRun } from '../../../database/models/DataIngestionRun';
import { FoodValidator } from '../validation/food.validator';
import { ApprovedIFCTProvider } from '../providers/nutrition/ifct.provider';
import { USDAProvider } from '../providers/nutrition/usda.provider';
import { PackagedFoodProvider } from '../providers/nutrition/packaged.provider';
import {
  NormalizedNutritionRecord,
  NutritionProvider,
} from '../providers/nutrition/nutrition-provider.interface';

export interface IngestionOptions {
  isDryRun?: boolean;
  forceUpdate?: boolean;
}

export interface IngestionSummary {
  requested: number;
  successful: number;
  rejected: number;
  duplicates: number;
  failed: number;
  warningsCount: number;
  records: Array<{
    name: string;
    action: 'INSERTED' | 'UPDATED' | 'SKIPPED_DUPLICATE' | 'REJECTED' | 'DRY_RUN_PLAN';
    provider: string;
    warnings: string[];
    errors: string[];
  }>;
}

export class NutritionIngestionService {
  private ifctProvider = new ApprovedIFCTProvider();
  private usdaProvider = new USDAProvider();
  private packagedProvider = new PackagedFoodProvider();

  /**
   * Discovers and retrieves authoritative nutrition across the 3 tiers.
   * Priority: IFCT -> USDA -> Packaged Food
   */
  public async fetchNutritionForFood(query: string): Promise<NormalizedNutritionRecord | null> {
    // 1. Check Tier 1: Approved IFCT
    console.log(`[INGESTION] Checking Tier 1 (IFCT) for '${query}'`);
    const ifctCandidates = await this.ifctProvider.searchFood(query);
    if (ifctCandidates.length > 0 && ifctCandidates[0].score && ifctCandidates[0].score >= 70) {
      const best = ifctCandidates[0];
      const details = await this.ifctProvider.getFoodDetails(best.externalId);
      if (details) {
        console.log(`[INGESTION] Matched Tier 1 (IFCT): '${details.displayName}'`);
        return details;
      }
    }

    // 2. Check Tier 2: USDA FDC
    console.log(`[INGESTION] Checking Tier 2 (USDA FDC) for '${query}'`);
    const usdaCandidates = await this.usdaProvider.searchFood(query);
    if (usdaCandidates.length > 0 && usdaCandidates[0].score && usdaCandidates[0].score >= 60) {
      const best = usdaCandidates[0];
      const details = await this.usdaProvider.getFoodDetails(best.externalId);
      if (details) {
        console.log(`[INGESTION] Matched Tier 2 (USDA): '${details.displayName}'`);
        return details;
      }
    }

    // 3. Check Tier 3: Packaged Foods
    console.log(`[INGESTION] Checking Tier 3 (Packaged) for '${query}'`);
    const pkgCandidates = await this.packagedProvider.searchFood(query);
    if (pkgCandidates.length > 0 && pkgCandidates[0].score && pkgCandidates[0].score >= 70) {
      const best = pkgCandidates[0];
      const details = await this.packagedProvider.getFoodDetails(best.externalId);
      if (details) {
        console.log(`[INGESTION] Matched Tier 3 (Packaged): '${details.displayName}'`);
        return details;
      }
    }

    console.warn(`[INGESTION] No authoritative match found for '${query}' across providers.`);
    return null;
  }

  /**
   * Ingests a list of food queries or prepared records.
   * Enforces validation, Atwater consistency check, deduplication, and audit logging.
   */
  public async ingestFoodList(
    foodQueriesOrRecords: Array<string | NormalizedNutritionRecord>,
    options: IngestionOptions = {}
  ): Promise<IngestionSummary> {
    const isDryRun = options.isDryRun ?? false;
    const startedAt = new Date();

    const summary: IngestionSummary = {
      requested: foodQueriesOrRecords.length,
      successful: 0,
      rejected: 0,
      duplicates: 0,
      failed: 0,
      warningsCount: 0,
      records: [],
    };

    const errorsForAudit: Array<{ item?: string; reason: string; details?: any }> = [];

    const isDbConnected = Boolean(CanonicalFood.db && CanonicalFood.db.readyState === 1);

    // Load existing foods for duplicate checking if DB is accessible
    let existingFoods: Array<{ name: string; displayName: string; aliases: string[] }> = [];
    if (isDbConnected) {
      try {
        existingFoods = await CanonicalFood.find({}, 'name displayName aliases').lean();
      } catch {
        existingFoods = [];
      }
    }

    for (const item of foodQueriesOrRecords) {
      try {
        let record: NormalizedNutritionRecord | null = null;
        if (typeof item === 'string') {
          record = await this.fetchNutritionForFood(item);
          if (!record) {
            summary.failed++;
            summary.records.push({
              name: item,
              action: 'REJECTED',
              provider: 'NONE',
              warnings: [],
              errors: [`No source found for query '${item}'`],
            });
            errorsForAudit.push({ item, reason: 'No source found across providers' });
            continue;
          }
        } else {
          record = item;
        }

        // 1. Validate Macronutrient sanity & Atwater calculation
        const validation = FoodValidator.validateNutrition(record.nutrition);
        if (!validation.isValid) {
          summary.rejected++;
          summary.records.push({
            name: record.name,
            action: 'REJECTED',
            provider: record.source.provider,
            warnings: validation.warnings,
            errors: validation.errors,
          });
          errorsForAudit.push({
            item: record.name,
            reason: `Validation failed: ${validation.errors.join(', ')}`,
            details: record.nutrition,
          });
          continue;
        }

        if (validation.warnings.length > 0) {
          summary.warningsCount += validation.warnings.length;
        }

        // 2. Duplicate Detection
        const isDuplicate = existingFoods.some((ex) =>
          FoodValidator.isPotentialDuplicate(record!.name, record!.aliases, ex)
        );

        if (isDuplicate && !options.forceUpdate) {
          summary.duplicates++;
          summary.records.push({
            name: record.name,
            action: 'SKIPPED_DUPLICATE',
            provider: record.source.provider,
            warnings: validation.warnings,
            errors: [],
          });
          continue;
        }

        // 3. Dry-run or Commit to MongoDB
        if (isDryRun) {
          summary.successful++;
          summary.records.push({
            name: record.name,
            action: 'DRY_RUN_PLAN',
            provider: record.source.provider,
            warnings: validation.warnings,
            errors: [],
          });
        } else {
          // Upsert based on normalized name
          await CanonicalFood.findOneAndUpdate(
            { name: record.name },
            {
              $set: {
                displayName: record.displayName,
                aliases: record.aliases,
                category: record.category,
                foodType: record.foodType,
                dietaryTags: record.dietaryTags,
                nutrition: record.nutrition,
                servings: record.servings,
                cookingRequired: record.cookingRequired,
                requiredEquipment: record.requiredEquipment,
                fridgeRequired: record.fridgeRequired,
                portability: record.portability,
                hostelSuitability: record.hostelSuitability,
                allowedMealCategories: record.allowedMealCategories,
                source: record.source,
                dataQuality: {
                  verified: true,
                  confidenceScore: record.source.confidence === 'HIGH' ? 95 : 80,
                  warnings: validation.warnings,
                  atwaterDeviationPercent: validation.atwaterDeviationPercent,
                },
                isActive: true,
              },
            },
            { upsert: true, new: true }
          );

          existingFoods.push({
            name: record.name,
            displayName: record.displayName,
            aliases: record.aliases,
          });

          summary.successful++;
          summary.records.push({
            name: record.name,
            action: 'INSERTED',
            provider: record.source.provider,
            warnings: validation.warnings,
            errors: [],
          });
        }
      } catch (err: any) {
        summary.failed++;
        const itemName = typeof item === 'string' ? item : item.name;
        summary.records.push({
          name: itemName,
          action: 'REJECTED',
          provider: 'ERROR',
          warnings: [],
          errors: [err.message],
        });
        errorsForAudit.push({ item: itemName, reason: err.message });
      }
    }

    // Record audit run in MongoDB if connected
    if (isDbConnected) {
      try {
        await DataIngestionRun.create({
          provider: 'MULTI_TIER_NUTRITION',
          runType: 'NUTRITION',
          startedAt,
          completedAt: new Date(),
          isDryRun,
          requested: summary.requested,
          successful: summary.successful,
          rejected: summary.rejected,
          duplicates: summary.duplicates,
          failed: summary.failed,
          errorLog: errorsForAudit,
          summary: `Ingested ${summary.successful}/${summary.requested} foods (DryRun: ${isDryRun}). Warnings: ${summary.warningsCount}`,
        });
      } catch {
        // Non-blocking in isolated unit tests
      }
    }

    return summary;
  }
}
