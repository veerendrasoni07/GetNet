import { env } from '../../../../config/env';
import { PriceCandidate, PriceProvider } from './price-provider.interface';

/**
 * Instamart Price Provider Adapter.
 * Integrates strictly with official/authorized partner API credentials.
 * NEVER scrapes private mobile APIs, bypasses bot checks, or invents live marketplace prices.
 * If credentials are missing, defaults to AVAILABLE = false.
 */
export class InstamartPriceProvider implements PriceProvider {
  public readonly name = 'INSTAMART';

  public isAvailable(): boolean {
    return Boolean(env.INSTAMART_API_KEY && env.INSTAMART_API_BASE_URL);
  }

  public async getPrice(
    canonicalFoodName: string,
    location: { city: string; state?: string; country?: string; postalCode?: string }
  ): Promise<PriceCandidate | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const endpoint = `${env.INSTAMART_API_BASE_URL}/v1/products/search`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.INSTAMART_API_KEY}`,
        },
        body: JSON.stringify({ query: canonicalFoodName, city: location.city }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`[Instamart] API returned ${res.status}: ${res.statusText}`);
        return null;
      }

      const data = (await res.json()) as any;
      if (!data?.product) return null;

      return {
        productName: data.product.name,
        brand: data.product.brand,
        price: data.product.price,
        mrp: data.product.mrp,
        currency: 'INR',
        quantity: {
          value: data.product.quantityValue,
          unit: data.product.quantityUnit,
        },
        location: {
          country: location.country || 'India',
          state: location.state || '',
          city: location.city,
          postalCode: location.postalCode,
        },
        availability: data.product.inStock ? 'in_stock' : 'out_of_stock',
        observedAt: new Date(),
        sourceProvider: 'INSTAMART',
        confidenceScore: 90,
      };
    } catch (err: any) {
      console.warn(`[Instamart] Request failed: ${err.message}. Gracefully falling back.`);
      return null;
    }
  }

  public async healthCheck(): Promise<boolean> {
    return this.isAvailable();
  }
}
