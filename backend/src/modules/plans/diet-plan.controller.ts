import { Request, Response } from 'express';
import { userDietProfileSchema } from '../profile/profile.schema';
import { generateCompleteDietPlan, substituteFoodItem } from './diet-plan.service';

export async function generateDietPlanHandler(req: Request, res: Response): Promise<void> {
  try {
    const { profile, messSelections } = req.body;

    const validatedProfile = userDietProfileSchema.parse(profile);

    const fullProfile = {
      ...validatedProfile,
      budget: {
        ...validatedProfile.budget,
        dailyExtraBudget: Number((validatedProfile.budget.monthlyExtraBudget / 30).toFixed(2)),
      },
    };

    const plan = generateCompleteDietPlan(fullProfile, messSelections || []);

    res.status(200).json({
      success: true,
      message: 'Physique-focused diet plan generated successfully',
      data: plan,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Invalid diet profile input',
    });
  }
}

export async function substituteFoodHandler(req: Request, res: Response): Promise<void> {
  try {
    const { profile, targetFoodId, currentSelectedFoodIds } = req.body;

    const validatedProfile = userDietProfileSchema.parse(profile);

    const fullProfile = {
      ...validatedProfile,
      budget: {
        ...validatedProfile.budget,
        dailyExtraBudget: Number((validatedProfile.budget.monthlyExtraBudget / 30).toFixed(2)),
      },
    };

    if (!targetFoodId) {
      res.status(400).json({ success: false, error: 'targetFoodId is required' });
      return;
    }

    const options = substituteFoodItem(
      fullProfile,
      targetFoodId,
      currentSelectedFoodIds || []
    );

    res.status(200).json({
      success: true,
      message: 'Food replacement choices generated',
      data: {
        targetFoodId,
        options,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to generate food substitution options',
    });
  }
}

/** Diet plan controller enforces schema validation and standardizes API response formats. */
