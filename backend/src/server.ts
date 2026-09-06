import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';

const startServer = async () => {
  if (process.env.NODE_ENV !== 'test') {
    await connectDatabase();
  }

  app.listen(env.PORT, () => {
    console.log(`🚀 GetNutrition Backend Server running on http://localhost:${env.PORT}`);
    console.log(`📡 Environment: ${env.NODE_ENV}`);
  });
};

startServer();
