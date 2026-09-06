import { z } from 'zod';

export const nutritionProfileSchema = z.object({
  age: z.number().int().min(13).max(100),

  sex: z.enum(['male', 'female']),

  heightCm: z.number().min(100).max(250),

  weightKg: z.number().min(25).max(300),

  targetWeightKg: z.number().min(25).max(300),

  activityLevel: z.enum([
    'sedentary',
    'light',
    'moderate',
    'high',
    'very_high',
  ]),

  goal: z.enum([
    'fat_loss',
    'maintenance',
    'muscle_gain',
  ]),

  dietType: z.enum([
    'omnivore',
    'vegetarian',
    'vegan',
    'eggetarian',
  ]),

  dailyBudget: z.number().min(0),

  mealsPerDay: z.number().int().min(2).max(6),

  cookingTimeMinutes: z.number().int().min(5).max(300),

  allergies: z.array(z.string()).default([]),

  dislikedFoods: z.array(z.string()).default([]),

  preferredFoods: z.array(z.string()).default([]),
});