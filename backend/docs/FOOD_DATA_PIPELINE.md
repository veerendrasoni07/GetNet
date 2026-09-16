# Food, Nutrition & Grocery Price Data Ingestion Pipeline

## 1. Overview & Core Principles

GetNutrition implements a production-grade, trustworthy food and grocery price pipeline specifically built around one fundamental rule:

> **Nutrition data and grocery price data MUST be separated.**
> Nutrition science changes rarely; grocery prices fluctuate constantly based on store, brand, volume discounts, locality, and city.

Canonical foods never store a single global `price` attribute. Instead, pricing is modeled as discrete, append-only **Price Observations** tagged with geographic precision and freshness states.

```
CanonicalFood
  ├── NutritionRecord (Normalized to 100g)
  ├── ServingDefinitions
  ├── Product Variants (FoodProduct)
  └── PriceObservations (Location-Aware, Append-Only)
```

---

## 2. Multi-Tier Provider Architecture

### 2.1 Nutrition Source Priority
| Tier | Provider | Description | Provenance ID |
| :--- | :--- | :--- | :--- |
| **Tier 1** | **Approved IFCT (ICMR-NIN)** | Curated, authentic Indian Food Composition Tables (2017) for raw Indian pulses, grains, dairy, vegetables, and oils. | `IFCT2017-Bxxx`, etc. |
| **Tier 2** | **USDA FoodData Central (FDC)** | Official REST API (`/fdc/v1/foods/search` and `/fdc/v1/food/{fdcId}`). Employs multi-attribute scoring (Foundation $\to$ SR Legacy $\to$ FNDDS $\to$ Branded) with state matching and ambiguous candidate rejection. | FDC ID (e.g. `171688`) |
| **Tier 3** | **Packaged Products Adapter** | Standardized schema for packaged goods (e.g., Whey Protein Isolate, unsweetened Peanut Butter). | `PKG-xxx` |

### 2.2 Price Source Priority
1. **Authorized Instamart Integration** (Only if official partner credentials are configured).
2. **Authorized Blinkit Integration** (Only if official partner credentials are configured).
3. **Government Retail Price Data** (Department of Consumer Affairs Retail Price Monitoring Division benchmarks for essential staples).
4. **Recent Verified Observations** (Stored in MongoDB).
5. **Manual / Admin Verified Prices** (Curated local market survey for student and fitness staples).
6. **Estimated Price Ranges** (Statistical baseline fallback).

> [!IMPORTANT]
> **No Undocumented Scraping / Reverse-Engineering**:
> In compliance with strict security and legal guidelines, marketplace adapters default to `AVAILABLE = false` unless authorized API keys and base URLs are supplied in `.env`. The pipeline never reverse engineers private mobile APIs or bypasses bot protections.

---

## 3. Schemas & Data Models

### 3.1 CanonicalFood (`src/database/models/CanonicalFood.ts`)
Represents the scientific definition of a food.
* `name`: Normalized unique key (e.g., `toor dal raw`).
* `displayName`: Human-readable name (e.g., `Toor Dal (Pigeon Pea, Split, Raw)`).
* `aliases`: Search aliases (e.g. `['arhar dal', 'tuvar dal']`).
* `category`: `GRAINS`, `PULSES`, `DAIRY`, `MEAT`, `POULTRY`, `EGGS`, `VEGETABLES`, `FRUITS`, `FATS_OILS`, `NUTS_SEEDS`, `SUPPLEMENTS`, `DISHES`, `PACKAGED_GOODS`.
* `foodType`: `RAW`, `COOKED`, `RECIPE`, `PACKAGED`.
* `nutrition`: Normalized to **100g basis** (`caloriesKcal`, `proteinG`, `carbohydratesG`, `fatG`, `fiberG`, minerals).
* `servings`: Array of practical serving sizes (`name`, `grams`, `householdMeasure`).
* `source`: `provider`, `externalId`, `version`, `retrievedAt`, `confidence`.
* `dataQuality`: `verified`, `confidenceScore`, `warnings`, `atwaterDeviationPercent`.

### 3.2 FoodProduct (`src/database/models/FoodProduct.ts`)
Represents branded, packaged SKUs tied to a canonical food.
* `canonicalFoodId`: Reference to `CanonicalFood`.
* `name`: Brand product name (e.g., `Amul Fresh Paneer 200g`).
* `brand`: Brand identifier (e.g., `Amul`).
* `package`: `{ quantity: 200, unit: 'g', totalGrams: 200 }`.
* `nutritionOverride`: Optional deviation from generic composition.

### 3.3 PriceObservation (`src/database/models/PriceObservation.ts`)
Append-only log of verified grocery prices.
* `canonicalFoodId`: Reference to `CanonicalFood`.
* `provider`: Source identifier (`GOVERNMENT_RETAIL_MONITOR`, `MANUAL_VERIFIED`, `INSTAMART`, etc.).
* `location`: `{ country: 'India', state: 'Madhya Pradesh', city: 'Indore', postalCode: '452001' }`.
* `price`: `{ sellingPrice: 85, mrp: 90, currency: 'INR' }`.
* `quantity`: `{ value: 200, unit: 'g' }`.
* `normalized`: `{ pricePer100g: 42.50, pricePerKg: 425 }`.
* `availability`: `'in_stock' | 'out_of_stock' | 'limited'`.
* `observedAt`: Timestamp of observation.

### 3.4 DataIngestionRun (`src/database/models/DataIngestionRun.ts`)
Auditing and observability table tracking sync batches, rejection reasons, error logs, and duplicate skip counts.

---

## 4. Normalization, Validation & Sanity Rules

### 4.1 Unit Normalization
Implemented in `src/modules/foods/normalization/unit.normalizer.ts`:
* Standardizes quantities to **100g** (mass) or **100ml** (liquids).
* Price conversions:
  * $\text{₹}160 / 1\text{kg} \implies \text{₹}16.00 / 100\text{g}$
  * $\text{₹}92 / 500\text{g} \implies \text{₹}18.40 / 100\text{g}$
  * $\text{₹}30 / 200\text{ml} \implies \text{₹}15.00 / 100\text{ml}$
* **Density Barrier**: Volume ($ml$) is never converted to mass ($g$) without explicit known density (e.g., milk $\approx 1.03\text{ g/ml}$).

### 4.2 Nutrition Validation & Atwater Consistency Check
Implemented in `src/modules/foods/validation/food.validator.ts`:
1. **Non-negativity**: All macros and calories must be $\ge 0$.
2. **Physical Bounds**: On a 100g basis, individual macronutrients cannot exceed $100\text{g}$; total calories cannot exceed $920\text{ kcal}$.
3. **Atwater Calorie Sanity**:
   $$E_{\text{atwater}} = 4 \times \text{protein} + 4 \times \text{carbs} + 9 \times \text{fat}$$
   Deviations $> 25\%$ flag warnings for manual inspection without overwriting authoritative values.

---

## 5. Location-Aware Price Engine & Freshness

Implemented in `src/modules/foods/services/price.engine.ts`.

### 5.1 Freshness Classification
* **`LIVE`**: Retrieved real-time from active provider.
* **`RECENT`**: Observed within `PRICE_RECENT_HOURS` (Default: $24\text{ hours}$).
* **`AGING`**: Observed within `PRICE_AGING_DAYS` (Default: $7\text{ days}$).
* **`STALE`**: Older than 7 days, up to `PRICE_STALE_DAYS` ($30\text{ days}$).
* **`ESTIMATED`**: Statistical fallback.

### 5.2 Geographic Fallback Hierarchy
$$\text{LOCAL (Postal Code)} \longrightarrow \text{CITY (e.g. Indore)} \longrightarrow \text{STATE (e.g. Madhya Pradesh)} \longrightarrow \text{NATIONAL (Baseline)}$$
The precision level is explicitly exposed in the API as `priceLocationLevel`.

### 5.3 Economic Derived Metrics
Calculated dynamically on the fly:
* `costPerGramProtein` $= \text{pricePer100g} / \text{proteinPer100g}$
* `costPer25gProtein` $= \text{costPerGramProtein} \times 25$
* `costPer100Kcal` $= (\text{pricePer100g} / \text{caloriesPer100g}) \times 100$

---

## 6. CLI Commands & Workflow

All commands are idempotent and support `--dry-run`.

```powershell
# 1. Seed initial verified Indian foods and location price observations
npm run data:seed-foods

# 2. Run nutrition discovery sync
npm run data:sync-nutrition

# 3. Dry-run nutrition sync
npm run data:sync-nutrition -- --dry-run

# 4. Synchronize grocery prices for a target city
npm run data:sync-prices -- --city=Indore

# 5. Run database integrity and sanity validation
npm run data:validate

# 6. Generate Data Quality Audit Report
npm run data:report
```

---

## 7. API Endpoints

Mounted under `/api/v1/foods`:

* **`GET /api/v1/foods`**:
  * Query parameters: `search`, `category`, `foodType`, `dietType`, `city`, `page`, `limit`.
  * Returns paginated foods with normalized nutrition, location-aware pricing, and economics.
* **`GET /api/v1/foods/:id`**:
  * Returns complete food details, nutrition provenance, lifestyle flags, and price ranges.
* **`GET /api/v1/foods/:id/price`**:
  * Query parameters: `city`, `state`, `postalCode`.
  * Returns specific price breakdown, freshness, and confidence.
* **`GET /api/v1/foods/admin/quality-report`**:
  * Returns data quality metrics, provider distributions, and items requiring review.

---

## 8. Integration with Recommendation & Diet Plan Engine

The diet plan optimizer (`src/modules/optimizer/diet.optimizer.ts`) and schedule generator (`src/modules/plans/diet-plan.service.ts`) consume `FoodItem` models through `src/modules/foods/food.repository.ts`:
* `projectCanonicalToFoodItem()` bridges Mongoose `CanonicalFood` and `BestPriceResult` into the `FoodItem` structure.
* `getAllFoodsAsync(location)` dynamically queries the active database while retaining an in-memory fallback for testing and offline resilience.
* Zero breaking changes or regressions to existing recommendation logic.
