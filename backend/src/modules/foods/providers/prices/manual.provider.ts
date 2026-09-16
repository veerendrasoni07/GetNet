import { PriceCandidate, PriceProvider } from './price-provider.interface';
import { FoodValidator } from '../../validation/food.validator';

export interface VerifiedStaplePrice {
  name: string;
  aliases: string[];
  brand?: string;
  price: number;
  quantityValue: number;
  unit: 'g' | 'kg' | 'ml' | 'L' | 'piece' | 'pack';
  confidenceScore: number;
}

/**
 * Manual / Admin Verified Price Provider.
 * Provides curated, ground-truth retail prices for common fitness staples and packaged items.
 */
export class ManualPriceProvider implements PriceProvider {
  public readonly name = 'MANUAL_VERIFIED';

  private static readonly STAPLE_PRICES: VerifiedStaplePrice[] = [
    {
      name: 'soy chunks dry',
      aliases: ['soy chunks', 'soya chunks', 'nutrela'],
      brand: 'Nutrela',
      price: 45,
      quantityValue: 200,
      unit: 'g',
      confidenceScore: 90,
    },
    {
      name: 'roasted chana',
      aliases: ['roasted chana', 'bhuna chana', 'futana'],
      brand: 'Local Grocery',
      price: 80,
      quantityValue: 500,
      unit: 'g',
      confidenceScore: 85,
    },
    {
      name: 'paneer raw',
      aliases: ['paneer', 'fresh paneer', 'cottage cheese'],
      brand: 'Amul / Dairy Fresh',
      price: 85,
      quantityValue: 200,
      unit: 'g',
      confidenceScore: 90,
    },
    {
      name: 'curd whole milk',
      aliases: ['curd', 'dahi', 'plain dahi'],
      brand: 'Mother Dairy / Amul Masti',
      price: 35,
      quantityValue: 400,
      unit: 'g',
      confidenceScore: 90,
    },
    {
      name: 'toned cow milk',
      aliases: ['toned milk', 'cow milk', 'milk packet'],
      brand: 'Amul Taaza',
      price: 28,
      quantityValue: 500,
      unit: 'ml',
      confidenceScore: 95,
    },
    {
      name: 'egg whole raw',
      aliases: ['egg', 'eggs', 'boiled eggs'],
      brand: 'Farm Fresh',
      price: 7,
      quantityValue: 1,
      unit: 'piece',
      confidenceScore: 90,
    },
    {
      name: 'rolled oats raw',
      aliases: ['oats', 'rolled oats'],
      brand: 'Kelloggs / Quaker',
      price: 180,
      quantityValue: 1,
      unit: 'kg',
      confidenceScore: 90,
    },
    {
      name: 'peanut butter classic creamy',
      aliases: ['peanut butter', 'creamy peanut butter'],
      brand: 'Pintola / Disano',
      price: 380,
      quantityValue: 1,
      unit: 'kg',
      confidenceScore: 90,
    },
    {
      name: 'chicken breast raw',
      aliases: ['chicken breast', 'raw chicken breast'],
      brand: 'Fresh Meat Butchery',
      price: 280,
      quantityValue: 1,
      unit: 'kg',
      confidenceScore: 85,
    },
    {
      name: 'whey protein isolate powder',
      aliases: ['whey protein', 'whey isolate'],
      brand: 'MuscleBlaze / Optimum Nutrition',
      price: 2100,
      quantityValue: 1,
      unit: 'kg',
      confidenceScore: 90,
    },
    {
      name: 'banana raw',
      aliases: ['banana', 'bananas', 'kela'],
      brand: 'Local Fruit Vendor',
      price: 5,
      quantityValue: 1,
      unit: 'piece',
      confidenceScore: 85,
    },
  ];

  public isAvailable(): boolean {
    return true;
  }

  public async getPrice(
    canonicalFoodName: string,
    location: { city: string; state?: string; country?: string; postalCode?: string }
  ): Promise<PriceCandidate | null> {
    const norm = FoodValidator.normalizeFoodName(canonicalFoodName);

    for (const item of ManualPriceProvider.STAPLE_PRICES) {
      const matchName = FoodValidator.normalizeFoodName(item.name);
      const matchAliases = item.aliases.map((a) => FoodValidator.normalizeFoodName(a));

      if (matchName.includes(norm) || matchAliases.some((a) => a.includes(norm) || norm.includes(a))) {
        return {
          productName: `${item.name} (${item.brand || 'Verified'})`,
          brand: item.brand,
          price: item.price,
          currency: 'INR',
          quantity: {
            value: item.quantityValue,
            unit: item.unit,
          },
          location: {
            country: location.country || 'India',
            state: location.state || '',
            city: location.city || 'Indore',
            postalCode: location.postalCode,
          },
          availability: 'in_stock',
          observedAt: new Date(),
          sourceProvider: 'MANUAL_VERIFIED',
          confidenceScore: item.confidenceScore,
        };
      }
    }

    return null;
  }

  public async healthCheck(): Promise<boolean> {
    return true;
  }
}
