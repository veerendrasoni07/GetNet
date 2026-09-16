import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().default('mongodb://localhost:27017/getnutrition'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters long'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  USDA_FDC_API_KEY: z.string().default(''),
  INSTAMART_API_KEY: z.string().default(''),
  INSTAMART_API_BASE_URL: z.string().default(''),
  BLINKIT_API_KEY: z.string().default(''),
  BLINKIT_API_BASE_URL: z.string().default(''),
  PRICE_RECENT_HOURS: z.coerce.number().default(24),
  PRICE_AGING_DAYS: z.coerce.number().default(7),
  PRICE_STALE_DAYS: z.coerce.number().default(30),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
