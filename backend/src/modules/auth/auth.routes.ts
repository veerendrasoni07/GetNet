import { Router } from 'express';
import { googleAuthHandler, getMeHandler, updateOnboardingStatusHandler } from './auth.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const authRouter = Router();

authRouter.post('/google', googleAuthHandler);
authRouter.get('/me', authenticateToken as any, getMeHandler as any);
authRouter.patch('/onboarding-status', authenticateToken as any, updateOnboardingStatusHandler as any);

export default authRouter;
