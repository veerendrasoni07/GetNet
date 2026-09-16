import { PriceLocation, SupportedUnit } from '../../../../database/models/PriceObservation';

export interface PriceCandidate {
  productName: string;
  brand?: string;
  price: number;
  mrp?: number;
  currency: string;
  quantity: {
    value: number;
    unit: 'g' | 'kg' | 'ml' | 'L' | 'piece' | 'pack';
  };
  location: PriceLocation;
  availability: 'in_stock' | 'out_of_stock' | 'limited';
  observedAt: Date;
  expiresAt?: Date;
  sourceProvider: string;
  sourceMetadata?: Record<string, any>;
  confidenceScore: number;
}

export interface PriceProvider {
  readonly name: string;
  isAvailable(): boolean;
  getPrice(
    canonicalFoodName: string,
    location: { city: string; state?: string; country?: string; postalCode?: string }
  ): Promise<PriceCandidate | null>;
  healthCheck(): Promise<boolean>;
}
