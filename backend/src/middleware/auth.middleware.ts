import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

/**
 * Middleware validating Bearer JWT authentication tokens.
 * Supports optional authentication if header is missing, or strict rejection.
 */
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; email: string };
    req.user = decoded;
    next();
  } catch (err: any) {
    return res.status(403).json({ success: false, error: 'Invalid or expired token' });
  }
};

/**
 * Soft authentication middleware that extracts user if token exists, but doesn't block unauthenticated requests.
 */
export const optionalAuthenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; email: string };
      req.user = decoded;
    } catch {
      // Ignore invalid token for optional auth
    }
  }

  // Also check x-user-id header if present
  if (!req.user && req.headers['x-user-id']) {
    req.user = {
      userId: req.headers['x-user-id'] as string,
      email: '',
    };
  }

  next();
};
