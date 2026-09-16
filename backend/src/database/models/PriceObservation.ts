import { Schema, model, Document, Types } from 'mongoose';

export type AvailabilityStatus = 'in_stock' | 'out_of_stock' | 'limited';

export interface PriceLocation {
  country: string;
  state: string;
  city: string;
  postalCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface PriceDetails {
  sellingPrice: number;
  mrp?: number;
  currency: string;
}

export interface NormalizedPrices {
  pricePer100g?: number;
  pricePerKg?: number;
  pricePerLiter?: number;
  pricePerUnit?: number;
}

export interface IPriceObservation {
  canonicalFoodId: Types.ObjectId;
  productId?: Types.ObjectId;
  provider: string; // 'INSTAMART' | 'BLINKIT' | 'GOVERNMENT' | 'MANUAL' | 'HISTORICAL'
  seller?: string;
  location: PriceLocation;
  price: PriceDetails;
  quantity: {
    value: number;
    unit: 'g' | 'kg' | 'ml' | 'L' | 'piece' | 'pack';
  };
  normalized: NormalizedPrices;
  availability: AvailabilityStatus;
  observedAt: Date;
  expiresAt?: Date;
  sourceMetadata?: Record<string, any>;
  confidenceScore: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PriceObservationDocument extends IPriceObservation, Document {}

const PriceLocationSchema = new Schema<PriceLocation>(
  {
    country: { type: String, required: true, default: 'India', trim: true },
    state: { type: String, required: true, trim: true, index: true },
    city: { type: String, required: true, trim: true, index: true },
    postalCode: { type: String, trim: true, index: true },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
  },
  { _id: false }
);

const PriceDetailsSchema = new Schema<PriceDetails>(
  {
    sellingPrice: { type: Number, required: true, min: 0 },
    mrp: { type: Number, min: 0 },
    currency: { type: String, required: true, default: 'INR' },
  },
  { _id: false }
);

const NormalizedPricesSchema = new Schema<NormalizedPrices>(
  {
    pricePer100g: { type: Number, min: 0 },
    pricePerKg: { type: Number, min: 0 },
    pricePerLiter: { type: Number, min: 0 },
    pricePerUnit: { type: Number, min: 0 },
  },
  { _id: false }
);

const PriceObservationSchema = new Schema<PriceObservationDocument>(
  {
    canonicalFoodId: {
      type: Schema.Types.ObjectId,
      ref: 'CanonicalFood',
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'FoodProduct',
      sparse: true,
      index: true,
    },
    provider: {
      type: String,
      required: true,
      index: true,
    },
    seller: { type: String, trim: true },
    location: { type: PriceLocationSchema, required: true },
    price: { type: PriceDetailsSchema, required: true },
    quantity: {
      value: { type: Number, required: true, min: 0 },
      unit: {
        type: String,
        enum: ['g', 'kg', 'ml', 'L', 'piece', 'pack'],
        required: true,
      },
    },
    normalized: { type: NormalizedPricesSchema, required: true },
    availability: {
      type: String,
      enum: ['in_stock', 'out_of_stock', 'limited'],
      default: 'in_stock',
    },
    observedAt: { type: Date, required: true, default: Date.now, index: true },
    expiresAt: { type: Date },
    sourceMetadata: { type: Schema.Types.Mixed },
    confidenceScore: { type: Number, required: true, min: 0, max: 100, default: 80 },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast location-based and recency-based price queries
PriceObservationSchema.index({ canonicalFoodId: 1, 'location.city': 1, observedAt: -1 });
PriceObservationSchema.index({ canonicalFoodId: 1, 'location.state': 1, observedAt: -1 });
PriceObservationSchema.index({ canonicalFoodId: 1, observedAt: -1 });

export const PriceObservation = model<PriceObservationDocument>('PriceObservation', PriceObservationSchema);
export default PriceObservation;
