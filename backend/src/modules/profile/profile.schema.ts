import { z } from 'zod';

export const bodyProfileSchema = z.object({
  age: z.number().min(12).max(100),
  sex: z.enum(['male', 'female']),
  heightCm: z.number().min(100).max(250),
  weightKg: z.number().min(30).max(250),
  goal: z.enum(['fat_loss', 'muscle_gain', 'recomposition', 'maintenance']),
  targetWeightKg: z.number().min(30).max(250),
  bodyFatPercentage: z.preprocess(
    (val) => (val === null ? undefined : val),
    z.number().min(3).max(60).optional()
  ),
});

export const trainingProfileSchema = z.object({
  liftsWeights: z.boolean(),
  trainingDaysPerWeek: z.number().min(0).max(7),
  workoutTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  workoutDurationMinutes: z.number().min(0).max(240),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'high', 'very_high']),
});

export const lifestyleProfileSchema = z.object({
  livingSituation: z.enum(['home', 'hostel', 'pg', 'alone']),
  hasMess: z.boolean(),
  messMeals: z.array(z.enum(['breakfast', 'lunch', 'dinner', 'snack'])),
  availableEquipment: z.array(
    z.enum(['refrigerator', 'kettle', 'induction', 'microwave', 'mixer', 'none'])
  ),
});

export const scheduleProfileSchema = z.object({
  wakeUpTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  collegeWorkStartTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  collegeWorkEndTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  workoutTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  sleepTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
});

export const budgetProfileSchema = z.object({
  monthlyExtraBudget: z.number().min(0),
  messPaidSeparately: z.boolean().default(true),
  dailyExtraBudget: z.number().optional(),
});

export const dietPreferenceProfileSchema = z.object({
  dietType: z.enum(['vegetarian', 'eggetarian', 'non_vegetarian', 'vegan']),
  allergies: z.array(z.string()).default([]),
  dislikedFoods: z.array(z.string()).default([]),
});

export const userDietProfileSchema = z.object({
  body: bodyProfileSchema,
  training: trainingProfileSchema,
  lifestyle: lifestyleProfileSchema,
  schedule: scheduleProfileSchema,
  budget: budgetProfileSchema,
  preferences: dietPreferenceProfileSchema,
});

export type UserDietProfileInput = z.infer<typeof userDietProfileSchema>;
