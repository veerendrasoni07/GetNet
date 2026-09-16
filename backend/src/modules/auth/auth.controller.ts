import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { googleAuthSchema } from './auth.schema';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

/**
 * Handle Google Sign-In and registration.
 */
export const googleAuthHandler = async (req: Request, res: Response) => {
  try {
    const parseResult = googleAuthSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parseResult.error.format(),
      });
    }

    const authResult = await AuthService.authenticateWithGoogle(parseResult.data);

    return res.status(200).json({
      success: true,
      token: authResult.token,
      user: authResult.user,
    });
  } catch (err: any) {
    console.error('❌ Google auth error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Authentication failed',
    });
  }
};

/**
 * Get current authenticated user profile and onboarding state.
 */
export const getMeHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const user = await AuthService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch user',
    });
  }
};

/**
 * Update onboarding completion flag for authenticated user.
 */
export const updateOnboardingStatusHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const completed = req.body.hasCompletedOnboarding !== false;
    const updated = await AuthService.setOnboardingCompleted(userId, completed);

    return res.status(200).json({
      success: true,
      hasCompletedOnboarding: Boolean(updated?.get('hasCompletedOnboarding')),
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to update onboarding status',
    });
  }
};
