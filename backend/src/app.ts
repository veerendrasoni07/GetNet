import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import router from './routes';

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// API Endpoints
app.use('/api/v1', router);

// Root Endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to GetNutrition Physique-Focused Diet Planning API',
    documentation: '/api/v1/health',
  });
});

// Global Error Middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

export default app;

/** Express application instance with security headers, CORS policies, and request parsers. */
