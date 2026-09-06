import { Request, Response } from 'express';
import { evaluateAdaptiveProgress } from '../adaptation/adaptive-diet.engine';
import { calculateWeightTrend } from './weight-trend.engine';

export async function logMealCompletionHandler(req: Request, res: Response): Promise<void> {
  try {
    const { userId, date, slotName, items } = req.body;

    if (!userId || !date || !slotName || !Array.isArray(items)) {
      res.status(400).json({ success: false, error: 'userId, date, slotName, and items array are required' });
      return;
    }

    const doneCount = items.filter((i: any) => i.status === 'done').length;
    const adherencePercentage = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 100;

    res.status(200).json({
      success: true,
      message: 'Meal completion logged successfully',
      data: {
        userId,
        date,
        slotName,
        adherencePercentage,
        items,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function logWeightHandler(req: Request, res: Response): Promise<void> {
  try {
    const { userId, date, weightKg } = req.body;

    if (!userId || !date || typeof weightKg !== 'number') {
      res.status(400).json({ success: false, error: 'userId, date, and weightKg are required' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Weight record saved successfully',
      data: {
        userId,
        date,
        weightKg,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function adaptiveCheckinHandler(req: Request, res: Response): Promise<void> {
  try {
    const { goal, previousWeekEntries, currentWeekEntries, adherencePercentage, frequentlySkippedSlot, currentCalories } = req.body;

    if (!goal || !Array.isArray(previousWeekEntries) || !Array.isArray(currentWeekEntries)) {
      res.status(400).json({ success: false, error: 'goal, previousWeekEntries, and currentWeekEntries are required' });
      return;
    }

    const weightTrend = calculateWeightTrend(previousWeekEntries, currentWeekEntries);

    const evaluation = evaluateAdaptiveProgress({
      goal,
      weightTrend,
      adherencePercentage: typeof adherencePercentage === 'number' ? adherencePercentage : 85,
      frequentlySkippedSlot,
      currentCalories: currentCalories || 2500,
    });

    res.status(200).json({
      success: true,
      data: {
        weightTrend,
        evaluation,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
