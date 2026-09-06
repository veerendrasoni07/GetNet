import { Router } from 'express';
import { generateDietPlanHandler, substituteFoodHandler } from './modules/plans/diet-plan.controller';
import { adaptiveCheckinHandler, logMealCompletionHandler, logWeightHandler } from './modules/tracking/tracking.controller';
import { deriveMealWindows } from './modules/profile/schedule.calculator';
import { scheduleProfileSchema } from './modules/profile/profile.schema';

const router = Router();

// Health Check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'GetNutrition Physique Engine' });
});

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
router.post('/diet-plan/generate', generateDietPlanHandler);
router.post('/diet-plan/substitute', substituteFoodHandler);

// Adherence & Weight Tracking
router.post('/tracking/meal-log', logMealCompletionHandler);
router.post('/tracking/weight', logWeightHandler);
router.post('/tracking/adaptive-checkin', adaptiveCheckinHandler);

export default router;
