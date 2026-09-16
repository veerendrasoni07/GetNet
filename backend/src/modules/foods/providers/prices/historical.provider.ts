import { Types } from 'mongoose';
import { PriceObservation, PriceObservationDocument } from '../../../../database/models/PriceObservation';
import { PriceCandidate, PriceProvider } from './price-provider.interface';

/**
 * Historical Price Provider.
 * Queries MongoDB for recent stored price observations matching the food and location.
 */
export class HistoricalPriceProvider implements PriceProvider {
  public readonly name = 'HISTORICAL_DB';

  public isAvailable(): boolean {
    return true;
  }

  public async getPrice(
    canonicalFoodIdOrName: string,
    location: { city: string; state?: string; country?: string; postalCode?: string }
  ): Promise<PriceCandidate | null> {
    try {
      const isObjectId = Types.ObjectId.isValid(canonicalFoodIdOrName);
      const query: any = {};

      if (isObjectId) {
        query.canonicalFoodId = new Types.ObjectId(canonicalFoodIdOrName);
      }

      // First check same city
      if (location.city) {
        query['location.city'] = new RegExp(`^${location.city}$`, 'i');
      }

      const observation = await PriceObservation.findOne(query)
        .sort({ observedAt: -1 })
        .lean();

      if (!observation) {
        // Fall back to any observation for the food across cities
        delete query['location.city'];
        const fallbackObs = await PriceObservation.findOne(query)
          .sort({ observedAt: -1 })
          .lean();

        if (!fallbackObs) return null;
        return this.mapToCandidate(fallbackObs);
      }

      return this.mapToCandidate(observation);
    } catch {
      return null;
    }
  }

  private mapToCandidate(obs: any): PriceCandidate {
    return {
      productName: obs.seller ? `${obs.seller} price` : 'Stored observation',
      price: obs.price.sellingPrice,
      mrp: obs.price.mrp,
      currency: obs.price.currency || 'INR',
      quantity: obs.quantity,
      location: obs.location,
      availability: obs.availability || 'in_stock',
      observedAt: obs.observedAt,
      expiresAt: obs.expiresAt,
      sourceProvider: obs.provider,
      sourceMetadata: obs.sourceMetadata,
      confidenceScore: Math.max(50, obs.confidenceScore - 10), // slight decay for age
    };
  }

  public async healthCheck(): Promise<boolean> {
    return true;
  }
}
