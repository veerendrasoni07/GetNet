import { Router } from 'express';
import { generateDietPlanHandler, substituteFoodHandler } from './modules/plans/diet-plan.controller';
import { adaptiveCheckinHandler, logMealCompletionHandler, logWeightHandler } from './modules/tracking/tracking.controller';
import { deriveMealWindows } from './modules/profile/schedule.calculator';
import { scheduleProfileSchema } from './modules/profile/profile.schema';
import authRouter from './modules/auth/auth.routes';
import foodsRouter from './modules/foods/food.routes';
import { optionalAuthenticateToken } from './middleware/auth.middleware';

const router = Router();

// Health Check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'GetNutrition Physique Engine' });
});

// Foods & Nutrition Database
router.use('/foods', foodsRouter);

// Authentication
router.use('/auth', authRouter);

// Profile & Schedule Utilities
router.post('/profile/derive-schedule', (req, res) => {
  try {
    const validated = scheduleProfileSchema.parse(req.body);
    const windows = deriveMealWindows(validated);
    res.status(200).json({ success: true, windows });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Diet Plan & Substitution
router.post('/diet-plan/generate', optionalAuthenticateToken as any, generateDietPlanHandler);
router.post('/diet-plan/substitute', optionalAuthenticateToken as any, substituteFoodHandler);

// Adherence & Weight Tracking
router.post('/tracking/meal-log', optionalAuthenticateToken as any, logMealCompletionHandler);
router.post('/tracking/weight', optionalAuthenticateToken as any, logWeightHandler);
router.post('/tracking/adaptive-checkin', optionalAuthenticateToken as any, adaptiveCheckinHandler);

export default router;

/** Centralized API routing table registering all microservice endpoints under /api. */
