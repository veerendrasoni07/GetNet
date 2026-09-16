import { Router } from 'express';
import {
  getFoodByIdHandler,
  getFoodPriceHandler,
  getQualityReportHandler,
  listFoodsHandler,
} from './food.controller';

const router = Router();

// Public food discovery & location pricing
router.get('/', listFoodsHandler);
router.get('/admin/quality-report', getQualityReportHandler);
router.get('/:id', getFoodByIdHandler);
router.get('/:id/price', getFoodPriceHandler);

export default router;
