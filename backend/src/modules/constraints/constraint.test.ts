import { filterFoodsForUser } from './constraint.engine';
import { getAllFoods } from '../foods/food.repository';
import { UserDietProfile } from '../profile/profile.types';

describe('Constraint Engine', () => {
  const allFoods = getAllFoods();

  it('filters out non-veg and egg items for vegetarian hostel user with no equipment', () => {
    const profile: UserDietProfile = {
      body: { age: 20, sex: 'male', heightCm: 170, weightKg: 60, goal: 'muscle_gain', targetWeightKg: 68 },
      training: { liftsWeights: true, trainingDaysPerWeek: 5, workoutTime: '18:00', workoutDurationMinutes: 75, activityLevel: 'moderate' },
      lifestyle: { livingSituation: 'hostel', hasMess: true, messMeals: ['breakfast', 'lunch', 'dinner'], availableEquipment: ['none'] },
      schedule: { wakeUpTime: '07:00', collegeWorkStartTime: '09:00', collegeWorkEndTime: '16:00', workoutTime: '18:00', sleepTime: '00:00' },
      budget: { monthlyExtraBudget: 2000, messPaidSeparately: true, dailyExtraBudget: 66.67 },
      preferences: { dietType: 'vegetarian', allergies: [], dislikedFoods: [] },
    };

    const { allowedFoods, rejectedFoods } = filterFoodsForUser(allFoods, profile);

    const chicken = allowedFoods.find((f) => f.id.includes('chicken'));
    const egg = allowedFoods.find((f) => f.id.includes('egg'));
    const soy = allowedFoods.find((f) => f.id.includes('soy'));

    expect(chicken).toBeUndefined(); // non-veg rejected
    expect(egg).toBeUndefined();     // eggetarian rejected for veg
    expect(soy).toBeUndefined();     // soy chunks require cooking equipment, user has 'none'

    const chana = allowedFoods.find((f) => f.id.includes('chana'));
    const milk = allowedFoods.find((f) => f.id.includes('milk'));

    expect(chana).toBeDefined(); // no cooking, cheap, veg
    expect(milk).toBeDefined();
  });

  it('filters out lactose/dairy items when user specifies lactose allergy', () => {
    const profile: UserDietProfile = {
      body: { age: 20, sex: 'male', heightCm: 170, weightKg: 60, goal: 'muscle_gain', targetWeightKg: 68 },
      training: { liftsWeights: true, trainingDaysPerWeek: 5, workoutTime: '18:00', workoutDurationMinutes: 75, activityLevel: 'moderate' },
      lifestyle: { livingSituation: 'hostel', hasMess: true, messMeals: ['lunch', 'dinner'], availableEquipment: ['kettle'] },
      schedule: { wakeUpTime: '07:00', collegeWorkStartTime: '09:00', collegeWorkEndTime: '16:00', workoutTime: '18:00', sleepTime: '00:00' },
      budget: { monthlyExtraBudget: 2000, messPaidSeparately: true, dailyExtraBudget: 66.67 },
      preferences: { dietType: 'vegetarian', allergies: ['lactose'], dislikedFoods: [] },
    };

    const { allowedFoods } = filterFoodsForUser(allFoods, profile);

    const milk = allowedFoods.find((f) => f.id.includes('milk'));
    const paneer = allowedFoods.find((f) => f.id.includes('paneer'));

    expect(milk).toBeUndefined();
    expect(paneer).toBeUndefined();
  });
});
