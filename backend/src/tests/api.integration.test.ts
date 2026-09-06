import request from 'supertest';
import app from '../app';

describe('GetNutrition API Integration Tests', () => {
  it('GET /api/v1/health returns health status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /api/v1/profile/derive-schedule derives meal windows', async () => {
    const res = await request(app)
      .post('/api/v1/profile/derive-schedule')
      .send({
        wakeUpTime: '07:00',
        collegeWorkStartTime: '09:00',
        collegeWorkEndTime: '16:00',
        workoutTime: '18:00',
        sleepTime: '00:00',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.windows.length).toBeGreaterThan(0);
  });

  it('POST /api/v1/diet-plan/generate generates end-to-end plan', async () => {
    const payload = {
      profile: {
        body: {
          age: 20,
          sex: 'male',
          heightCm: 170,
          weightKg: 60,
          goal: 'muscle_gain',
          targetWeightKg: 68,
        },
        training: {
          liftsWeights: true,
          trainingDaysPerWeek: 5,
          workoutTime: '18:00',
          workoutDurationMinutes: 75,
          activityLevel: 'moderate',
        },
        lifestyle: {
          livingSituation: 'hostel',
          hasMess: true,
          messMeals: ['breakfast', 'lunch', 'dinner'],
          availableEquipment: ['none'],
        },
        schedule: {
          wakeUpTime: '07:00',
          collegeWorkStartTime: '09:00',
          collegeWorkEndTime: '16:00',
          workoutTime: '18:00',
          sleepTime: '00:00',
        },
        budget: {
          monthlyExtraBudget: 2000,
          messPaidSeparately: true,
        },
        preferences: {
          dietType: 'vegetarian',
          allergies: [],
          dislikedFoods: [],
        },
      },
      messSelections: [
        { mealName: 'breakfast', rotiCount: 2, ricePortion: 'none', dalPortion: 'medium', sabziPortion: 'medium' },
        { mealName: 'lunch', rotiCount: 3, ricePortion: 'medium', dalPortion: 'medium', sabziPortion: 'medium' },
        { mealName: 'dinner', rotiCount: 3, ricePortion: 'none', dalPortion: 'medium', sabziPortion: 'medium' },
      ],
    };

    const res = await request(app)
      .post('/api/v1/diet-plan/generate')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.nutritionTarget.protein.target).toBe(120);
    expect(res.body.data.optimizationResult.monthlyCostInr).toBeLessThanOrEqual(2000);
    expect(res.body.data.dailySchedule.scheduledSlots.length).toBeGreaterThan(0);
  });

  it('POST /api/v1/diet-plan/substitute returns replacement choices with cost delta', async () => {
    const payload = {
      profile: {
        body: { age: 20, sex: 'male', heightCm: 170, weightKg: 60, goal: 'muscle_gain', targetWeightKg: 68 },
        training: { liftsWeights: true, trainingDaysPerWeek: 5, workoutTime: '18:00', workoutDurationMinutes: 75, activityLevel: 'moderate' },
        lifestyle: { livingSituation: 'hostel', hasMess: true, messMeals: ['breakfast', 'lunch', 'dinner'], availableEquipment: ['none'] },
        schedule: { wakeUpTime: '07:00', collegeWorkStartTime: '09:00', collegeWorkEndTime: '16:00', workoutTime: '18:00', sleepTime: '00:00' },
        budget: { monthlyExtraBudget: 2000, messPaidSeparately: true },
        preferences: { dietType: 'vegetarian', allergies: [], dislikedFoods: [] },
      },
      targetFoodId: 'food_toned_milk_500ml',
      currentSelectedFoodIds: [],
    };

    const res = await request(app)
      .post('/api/v1/diet-plan/substitute')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.options.length).toBeGreaterThan(0);
    expect(res.body.data.options[0].costDeltaText).toBeDefined();
  });
});
