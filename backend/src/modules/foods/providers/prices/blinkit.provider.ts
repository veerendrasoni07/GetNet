import { env } from '../../../../config/env';
import { PriceCandidate, PriceProvider } from './price-provider.interface';

/**
 * Blinkit Price Provider Adapter.
 * Integrates strictly with official/authorized partner API credentials.
 * NEVER reverse engineers mobile endpoints or makes undocumented calls.
 * If credentials are not configured, marked AVAILABLE = false and falls back.
 */
export class BlinkitPriceProvider implements PriceProvider {
  public readonly name = 'BLINKIT';

  public isAvailable(): boolean {
    return Boolean(env.BLINKIT_API_KEY && env.BLINKIT_API_BASE_URL);
  }

  public async getPrice(
    canonicalFoodName: string,
    location: { city: string; state?: string; country?: string; postalCode?: string }
  ): Promise<PriceCandidate | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const endpoint = `${env.BLINKIT_API_BASE_URL}/v1/catalog/lookup`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.BLINKIT_API_KEY}`,
        },
        body: JSON.stringify({ query: canonicalFoodName, city: location.city }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`[Blinkit] API returned ${res.status}: ${res.statusText}`);
        return null;
      }

      const data = (await res.json()) as any;
      if (!data?.item) return null;

      return {
        productName: data.item.name,
        brand: data.item.brand,
        price: data.item.sellingPrice,
        mrp: data.item.mrp,
        currency: 'INR',
        quantity: {
          value: data.item.quantity,
          unit: data.item.unit,
        },
        location: {
          country: location.country || 'India',
          state: location.state || '',
          city: location.city,
          postalCode: location.postalCode,
        },
        availability: 'in_stock',
        observedAt: new Date(),
        sourceProvider: 'BLINKIT',
        confidenceScore: 90,
      };
    } catch (err: any) {
      console.warn(`[Blinkit] Request failed: ${err.message}. Gracefully falling back.`);
      return null;
    }
  }

  public async healthCheck(): Promise<boolean> {
    return this.isAvailable();
  }
}
