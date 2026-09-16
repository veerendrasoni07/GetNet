export interface SeedPriceSpec {
  foodName: string;
  brand?: string;
  provider: string; // 'GOVERNMENT_RETAIL_MONITOR' | 'MANUAL_VERIFIED' | 'LOCAL_SURVEY'
  city: string;
  state: string;
  sellingPrice: number;
  mrp?: number;
  quantityValue: number;
  unit: 'g' | 'kg' | 'ml' | 'L' | 'piece' | 'pack';
  confidenceScore: number;
}

export const INITIAL_PRICE_OBSERVATIONS: SeedPriceSpec[] = [
  // --- INDORE PRICES ---
  { foodName: 'wheat atta', brand: 'Chakki Fresh', provider: 'GOVERNMENT_RETAIL_MONITOR', city: 'Indore', state: 'Madhya Pradesh', sellingPrice: 35, quantityValue: 1, unit: 'kg', confidenceScore: 90 },
  { foodName: 'white rice raw', brand: 'Kolam / Sona Masoori', provider: 'GOVERNMENT_RETAIL_MONITOR', city: 'Indore', state: 'Madhya Pradesh', sellingPrice: 45, quantityValue: 1, unit: 'kg', confidenceScore: 90 },
  { foodName: 'toor dal raw', brand: 'Desi Toor Dal', provider: 'GOVERNMENT_RETAIL_MONITOR', city: 'Indore', state: 'Madhya Pradesh', sellingPrice: 155, quantityValue: 1, unit: 'kg', confidenceScore: 90 },
  { foodName: 'moong dal raw', brand: 'Yellow Moong', provider: 'GOVERNMENT_RETAIL_MONITOR', city: 'Indore', state: 'Madhya Pradesh', sellingPrice: 110, quantityValue: 1, unit: 'kg', confidenceScore: 90 },
  { foodName: 'chana dal raw', brand: 'Bengal Gram Split', provider: 'GOVERNMENT_RETAIL_MONITOR', city: 'Indore', state: 'Madhya Pradesh', sellingPrice: 85, quantityValue: 1, unit: 'kg', confidenceScore: 90 },
  { foodName: 'soy chunks dry', brand: 'Nutrela', provider: 'MANUAL_VERIFIED', city: 'Indore', state: 'Madhya Pradesh', sellingPrice: 45, quantityValue: 200, unit: 'g', confidenceScore: 95 },
  { foodName: 'roasted chana', brand: 'Local Roaster', provider: 'MANUAL_VERIFIED', city: 'Indore', state: 'Madhya Pradesh', sellingPrice: 80, quantityValue: 500, unit: 'g', confidenceScore: 90 },
  { foodName: 'paneer raw', brand: 'Sanchi / Amul', provider: 'MANUAL_VERIFIED', city: 'Indore', state: 'Madhya Pradesh', sellingPrice: 80, quantityValue: 200, unit: 'g', confidenceScore: 95 },
  { foodName: 'curd whole milk', brand: 'Sanchi Dahi', provider: 'MANUAL_VERIFIED', city: 'Indore', state: 'Madhya Pradesh', sellingPrice: 32, quantityValue: 400, unit: 'g', confidenceScore: 95 },
  { foodName: 'toned cow milk', brand: 'Sanchi / Amul Taaza', provider: 'MANUAL_VERIFIED', city: 'Indore', state: 'Madhya Pradesh', sellingPrice: 27, quantityValue: 500, unit: 'ml', confidenceScore: 95 },
  { foodName: 'egg whole raw', brand: 'Poultry Fresh', provider: 'MANUAL_VERIFIED', city: 'Indore', state: 'Madhya Pradesh', sellingPrice: 7, quantityValue: 1, unit: 'piece', confidenceScore: 90 },
  { foodName: 'chicken breast raw', brand: 'Fresh Cut Butchery', provider: 'MANUAL_VERIFIED', city: 'Indore', state: 'Madhya Pradesh', sellingPrice: 260, quantityValue: 1, unit: 'kg', confidenceScore: 90 },
  { foodName: 'rolled oats raw', brand: 'Kelloggs', provider: 'MANUAL_VERIFIED', city: 'Indore', state: 'Madhya Pradesh', sellingPrice: 175, quantityValue: 1, unit: 'kg', confidenceScore: 90 },
  { foodName: 'banana raw', brand: 'Mandi Fresh', provider: 'LOCAL_SURVEY', city: 'Indore', state: 'Madhya Pradesh', sellingPrice: 5, quantityValue: 1, unit: 'piece', confidenceScore: 85 },
  { foodName: 'potato raw', brand: 'Indore Mandi', provider: 'GOVERNMENT_RETAIL_MONITOR', city: 'Indore', state: 'Madhya Pradesh', sellingPrice: 22, quantityValue: 1, unit: 'kg', confidenceScore: 90 },
  { foodName: 'onion raw', brand: 'Indore Mandi', provider: 'GOVERNMENT_RETAIL_MONITOR', city: 'Indore', state: 'Madhya Pradesh', sellingPrice: 28, quantityValue: 1, unit: 'kg', confidenceScore: 90 },
  { foodName: 'tomato raw', brand: 'Indore Mandi', provider: 'GOVERNMENT_RETAIL_MONITOR', city: 'Indore', state: 'Madhya Pradesh', sellingPrice: 30, quantityValue: 1, unit: 'kg', confidenceScore: 90 },
  { foodName: 'peanut butter classic creamy', brand: 'Pintola', provider: 'MANUAL_VERIFIED', city: 'Indore', state: 'Madhya Pradesh', sellingPrice: 375, quantityValue: 1, unit: 'kg', confidenceScore: 90 },
  { foodName: 'whey protein isolate powder', brand: 'MuscleBlaze Raw', provider: 'MANUAL_VERIFIED', city: 'Indore', state: 'Madhya Pradesh', sellingPrice: 2100, quantityValue: 1, unit: 'kg', confidenceScore: 90 },

  // --- NATIONAL BASELINE PRICES ---
  { foodName: 'wheat atta', brand: 'Aashirvaad / Pillsbury', provider: 'GOVERNMENT_RETAIL_MONITOR', city: 'National Baseline', state: 'India', sellingPrice: 38, quantityValue: 1, unit: 'kg', confidenceScore: 85 },
  { foodName: 'white rice raw', brand: 'Standard White Rice', provider: 'GOVERNMENT_RETAIL_MONITOR', city: 'National Baseline', state: 'India', sellingPrice: 48, quantityValue: 1, unit: 'kg', confidenceScore: 85 },
  { foodName: 'toor dal raw', brand: 'Standard Toor Dal', provider: 'GOVERNMENT_RETAIL_MONITOR', city: 'National Baseline', state: 'India', sellingPrice: 160, quantityValue: 1, unit: 'kg', confidenceScore: 85 },
  { foodName: 'moong dal raw', brand: 'Standard Moong Dal', provider: 'GOVERNMENT_RETAIL_MONITOR', city: 'National Baseline', state: 'India', sellingPrice: 115, quantityValue: 1, unit: 'kg', confidenceScore: 85 },
  { foodName: 'chana dal raw', brand: 'Standard Chana Dal', provider: 'GOVERNMENT_RETAIL_MONITOR', city: 'National Baseline', state: 'India', sellingPrice: 88, quantityValue: 1, unit: 'kg', confidenceScore: 85 },
  { foodName: 'soy chunks dry', brand: 'Nutrela / Fortune', provider: 'MANUAL_VERIFIED', city: 'National Baseline', state: 'India', sellingPrice: 48, quantityValue: 200, unit: 'g', confidenceScore: 85 },
  { foodName: 'paneer raw', brand: 'Amul Fresh Paneer', provider: 'MANUAL_VERIFIED', city: 'National Baseline', state: 'India', sellingPrice: 85, quantityValue: 200, unit: 'g', confidenceScore: 90 },
  { foodName: 'toned cow milk', brand: 'Amul Taaza / Mother Dairy', provider: 'MANUAL_VERIFIED', city: 'National Baseline', state: 'India', sellingPrice: 28, quantityValue: 500, unit: 'ml', confidenceScore: 95 },
  { foodName: 'egg whole raw', brand: 'Poultry Egg', provider: 'MANUAL_VERIFIED', city: 'National Baseline', state: 'India', sellingPrice: 7, quantityValue: 1, unit: 'piece', confidenceScore: 85 },
  { foodName: 'chicken breast raw', brand: 'Fresh Chicken Breast', provider: 'MANUAL_VERIFIED', city: 'National Baseline', state: 'India', sellingPrice: 280, quantityValue: 1, unit: 'kg', confidenceScore: 85 },
  { foodName: 'rolled oats raw', brand: 'Quaker / Kelloggs', provider: 'MANUAL_VERIFIED', city: 'National Baseline', state: 'India', sellingPrice: 180, quantityValue: 1, unit: 'kg', confidenceScore: 85 },
];
