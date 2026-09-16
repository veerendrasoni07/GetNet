import request from 'supertest';
import app from '../app';

describe('Foods API Integration Tests', () => {
  it('GET /api/v1/foods returns food list with pagination', async () => {
    const res = await request(app).get('/api/v1/foods?limit=5');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it('GET /api/v1/foods/admin/quality-report returns pipeline audit metrics', async () => {
    const res = await request(app).get('/api/v1/foods/admin/quality-report');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.report).toBeDefined();
    expect(res.body.report.nutritionConfidence).toBeDefined();
    expect(res.body.report.nutritionProviders).toBeDefined();
  });

  it('GET /api/v1/foods/:id returns 404 for unknown food id', async () => {
    const res = await request(app).get('/api/v1/foods/non_existent_food_xyz');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
