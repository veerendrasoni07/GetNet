import { Schema, model, Document, Types } from 'mongoose';
import { MacroNutrients } from './CanonicalFood';

export interface PackageSpec {
  quantity: number;
  unit: 'g' | 'kg' | 'ml' | 'L' | 'piece' | 'pack';
  totalGrams?: number;
  totalMl?: number;
}

export interface IFoodProduct {
  canonicalFoodId: Types.ObjectId;
  name: string;
  brand: string;
  barcode?: string;
  package: PackageSpec;
  nutritionOverride?: Partial<MacroNutrients>;
  source: {
    provider: string;
    externalId?: string;
    retrievedAt: Date;
  };
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FoodProductDocument extends IFoodProduct, Document {}

const FoodProductSchema = new Schema<FoodProductDocument>(
  {
    canonicalFoodId: {
      type: Schema.Types.ObjectId,
      ref: 'CanonicalFood',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true, index: true },
    barcode: { type: String, sparse: true, trim: true, index: true },
    package: {
      quantity: { type: Number, required: true },
      unit: {
        type: String,
        enum: ['g', 'kg', 'ml', 'L', 'piece', 'pack'],
        required: true,
      },
      totalGrams: { type: Number },
      totalMl: { type: Number },
    },
    nutritionOverride: {
      type: Schema.Types.Mixed,
    },
    source: {
      provider: { type: String, required: true, default: 'MANUAL' },
      externalId: { type: String },
      retrievedAt: { type: Date, default: Date.now },
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

FoodProductSchema.index({ canonicalFoodId: 1, brand: 1 });

export const FoodProduct = model<FoodProductDocument>('FoodProduct', FoodProductSchema);
export default FoodProduct;
