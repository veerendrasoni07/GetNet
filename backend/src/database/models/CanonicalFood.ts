import { Schema, model, Document, Types } from 'mongoose';

export type FoodCategory =
  | 'GRAINS'
  | 'PULSES'
  | 'DAIRY'
  | 'MEAT'
  | 'POULTRY'
  | 'EGGS'
  | 'VEGETABLES'
  | 'FRUITS'
  | 'FATS_OILS'
  | 'NUTS_SEEDS'
  | 'SUPPLEMENTS'
  | 'DISHES'
  | 'PACKAGED_GOODS'
  | 'OTHER';

export type FoodType = 'RAW' | 'COOKED' | 'RECIPE' | 'PACKAGED';

export type NutritionConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ServingDefinition {
  name: string;
  grams: number;
  householdMeasure?: string;
}

export interface MacroNutrients {
  basisGrams: number;
  caloriesKcal: number;
  proteinG: number;
  carbohydratesG: number;
  fatG: number;
  fiberG: number;
  sugarG?: number;
  saturatedFatG?: number;
  sodiumMg?: number;
  calciumMg?: number;
  ironMg?: number;
  potassiumMg?: number;
}

export interface FoodSource {
  provider: string; // 'IFCT' | 'USDA' | 'PACKAGED' | 'MANUAL' | 'RECIPE_CALCULATOR'
  externalId?: string;
  version?: string;
  retrievedAt: Date;
  sourceUrl?: string;
  confidence: NutritionConfidence;
}

export interface FoodDataQuality {
  verified: boolean;
  confidenceScore: number; // 0 - 100
  warnings: string[];
  atwaterDeviationPercent?: number;
}

export interface RecipeIngredient {
  canonicalFoodId?: Types.ObjectId;
  name: string;
  grams: number;
}

export interface RecipeDefinition {
  ingredients: RecipeIngredient[];
  cookedYieldGrams: number;
  servings: number;
}

export interface ICanonicalFood {
  name: string;
  displayName: string;
  aliases: string[];
  category: FoodCategory;
  foodType: FoodType;
  dietaryTags: string[];
  nutrition: MacroNutrients;
  servings: ServingDefinition[];
  cookingRequired: boolean;
  requiredEquipment: string[];
  fridgeRequired: boolean;
  portability: 'high' | 'medium' | 'low';
  hostelSuitability: 'excellent' | 'good' | 'poor';
  allowedMealCategories: string[];
  minServingsPerDay?: number;
  maxServingsPerDay?: number;
  source: FoodSource;
  dataQuality: FoodDataQuality;
  recipe?: RecipeDefinition;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CanonicalFoodDocument extends ICanonicalFood, Document {}

const ServingDefinitionSchema = new Schema<ServingDefinition>(
  {
    name: { type: String, required: true },
    grams: { type: Number, required: true },
    householdMeasure: { type: String },
  },
  { _id: false }
);

const MacroNutrientsSchema = new Schema<MacroNutrients>(
  {
    basisGrams: { type: Number, required: true, default: 100 },
    caloriesKcal: { type: Number, required: true, min: 0 },
    proteinG: { type: Number, required: true, min: 0 },
    carbohydratesG: { type: Number, required: true, min: 0 },
    fatG: { type: Number, required: true, min: 0 },
    fiberG: { type: Number, required: true, min: 0, default: 0 },
    sugarG: { type: Number, min: 0 },
    saturatedFatG: { type: Number, min: 0 },
    sodiumMg: { type: Number, min: 0 },
    calciumMg: { type: Number, min: 0 },
    ironMg: { type: Number, min: 0 },
    potassiumMg: { type: Number, min: 0 },
  },
  { _id: false }
);

const FoodSourceSchema = new Schema<FoodSource>(
  {
    provider: { type: String, required: true },
    externalId: { type: String },
    version: { type: String },
    retrievedAt: { type: Date, required: true, default: Date.now },
    sourceUrl: { type: String },
    confidence: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      default: 'HIGH',
    },
  },
  { _id: false }
);

const FoodDataQualitySchema = new Schema<FoodDataQuality>(
  {
    verified: { type: Boolean, default: true },
    confidenceScore: { type: Number, default: 100, min: 0, max: 100 },
    warnings: [{ type: String }],
    atwaterDeviationPercent: { type: Number },
  },
  { _id: false }
);

const CanonicalFoodSchema = new Schema<CanonicalFoodDocument>(
  {
    name: { type: String, required: true, trim: true, unique: true, index: true },
    displayName: { type: String, required: true, trim: true },
    aliases: [{ type: String, lowercase: true, trim: true, index: true }],
    category: {
      type: String,
      enum: [
        'GRAINS',
        'PULSES',
        'DAIRY',
        'MEAT',
        'POULTRY',
        'EGGS',
        'VEGETABLES',
        'FRUITS',
        'FATS_OILS',
        'NUTS_SEEDS',
        'SUPPLEMENTS',
        'DISHES',
        'PACKAGED_GOODS',
        'OTHER',
      ],
      required: true,
      index: true,
    },
    foodType: {
      type: String,
      enum: ['RAW', 'COOKED', 'RECIPE', 'PACKAGED'],
      required: true,
      default: 'RAW',
      index: true,
    },
    dietaryTags: [{ type: String, lowercase: true, trim: true, index: true }],
    nutrition: { type: MacroNutrientsSchema, required: true },
    servings: [ServingDefinitionSchema],
    cookingRequired: { type: Boolean, default: false },
    requiredEquipment: [{ type: String }],
    fridgeRequired: { type: Boolean, default: false },
    portability: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    hostelSuitability: {
      type: String,
      enum: ['excellent', 'good', 'poor'],
      default: 'good',
    },
    allowedMealCategories: [{ type: String }],
    minServingsPerDay: { type: Number, default: 0.5 },
    maxServingsPerDay: { type: Number, default: 3 },
    source: { type: FoodSourceSchema, required: true },
    dataQuality: { type: FoodDataQualitySchema, default: () => ({ verified: true, confidenceScore: 100, warnings: [] }) },
    recipe: {
      ingredients: [
        {
          canonicalFoodId: { type: Schema.Types.ObjectId, ref: 'CanonicalFood' },
          name: { type: String, required: true },
          grams: { type: Number, required: true },
        },
      ],
      cookedYieldGrams: { type: Number },
      servings: { type: Number },
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Text index for search
CanonicalFoodSchema.index({ name: 'text', displayName: 'text', aliases: 'text' });

export const CanonicalFood = model<CanonicalFoodDocument>('CanonicalFood', CanonicalFoodSchema);
export default CanonicalFood;
