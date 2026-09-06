import { calculateNutritionTarget } from './nutrition.engine';
import { BodyProfile, TrainingProfile } from '../profile/profile.types';

describe('Nutrition Engine', () => {
  it('calculates accurate target ranges for muscle gain weight lifter', () => {
    const body: BodyProfile = {
      age: 20,
      sex: 'male',
      heightCm: 170,
      weightKg: 60,
      goal: 'muscle_gain',
      targetWeightKg: 68,
    };

    const training: TrainingProfile = {
      liftsWeights: true,
      trainingDaysPerWeek: 5,
      workoutTime: '18:00',
      workoutDurationMinutes: 75,
      activityLevel: 'moderate',
    };

    const target = calculateNutritionTarget(body, training);

    expect(target.bmr).toBeGreaterThan(1400);
    expect(target.tdee).toBeGreaterThan(target.bmr);
    expect(target.calories.target).toBeGreaterThan(target.tdee); // Surplus for muscle gain
    expect(target.protein.target).toBe(120); // 60kg * 2.0g/kg
    expect(target.waterMl).toBeGreaterThan(2100);
  });

  it('calculates higher protein for fat loss lifter to protect muscle', () => {
    const body: BodyProfile = {
      age: 22,
      sex: 'male',
      heightCm: 175,
      weightKg: 80,
      goal: 'fat_loss',
      targetWeightKg: 72,
    };

    const training: TrainingProfile = {
      liftsWeights: true,
      trainingDaysPerWeek: 4,
      workoutTime: '17:00',
      workoutDurationMinutes: 60,
      activityLevel: 'light',
    };

    const target = calculateNutritionTarget(body, training);

    expect(target.calories.target).toBeLessThan(target.tdee); // Deficit for fat loss
    expect(target.protein.target).toBe(176); // 80kg * 2.2g/kg
  });
});