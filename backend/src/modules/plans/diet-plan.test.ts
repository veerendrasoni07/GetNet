import { generateCompleteDietPlan, substituteFoodItem } from './diet-plan.service';
import { UserDietProfile } from '../profile/profile.types';

describe('Diet Plan Service & Substitution Engine', () => {
  const sampleProfile: UserDietProfile = {
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
      dailyExtraBudget: 66.67,
    },
    preferences: {
      dietType: 'vegetarian',
      allergies: [],
      dislikedFoods: [],
    },
  };

  it('generates a complete end-to-end practical diet plan within ₹2,000/month extra budget', () => {
    const plan = generateCompleteDietPlan(sampleProfile, [
      { mealName: 'breakfast', rotiCount: 2, ricePortion: 'none', dalPortion: 'medium', sabziPortion: 'medium' },
      { mealName: 'lunch', rotiCount: 3, ricePortion: 'medium', dalPortion: 'medium', sabziPortion: 'medium' },
      { mealName: 'dinner', rotiCount: 3, ricePortion: 'none', dalPortion: 'medium', sabziPortion: 'medium' },
    ]);

    expect(plan.nutritionTarget.calories.target).toBeGreaterThan(2200);
    expect(plan.nutritionTarget.protein.target).toBe(120);
    expect(plan.optimizationResult.monthlyCostInr).toBeLessThanOrEqual(2000); // respects monthly budget
    expect(plan.dailySchedule.scheduledSlots.length).toBeGreaterThan(0);
  });

  it('provides viable substitutes with cost delta text when substituting a food item', () => {
    const subs = substituteFoodItem(sampleProfile, 'food_toned_milk_500ml', []);
    expect(subs.length).toBeGreaterThan(0);
    expect(subs[0].costDeltaText).toMatch(/^[+-]₹\d+(\.\d+)?\/day$/);
  });
});
