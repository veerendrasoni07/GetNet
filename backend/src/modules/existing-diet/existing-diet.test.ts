import { calculateExistingDiet, estimateMessMealNutrition } from './existing-diet.engine';
import { MessMealSelection } from './existing-diet.types';

describe('Existing Diet / Mess Mode Engine', () => {
  const lunchSelection: MessMealSelection = {
    mealName: 'lunch',
    rotiCount: 3,
    ricePortion: 'medium',
    dalPortion: 'medium',
    sabziPortion: 'medium',
  };

  it('uses conservative low protein estimate for muscle gain goal', () => {
    const est = estimateMessMealNutrition(lunchSelection, 'muscle_gain');
    expect(est.proteinRange.min).toBe(20); // 3*2.5 + 4 + 6 + 2.5 = 20g
    expect(est.reliableProtein).toBe(est.proteinRange.min);
  });

  it('uses conservative high calorie estimate for fat loss goal', () => {
    const est = estimateMessMealNutrition(lunchSelection, 'fat_loss');
    expect(est.caloriesRange.max).toBeGreaterThan(650);
    expect(est.reliableCalories).toBe(est.caloriesRange.max);
  });

  it('calculates total daily mess estimate correctly across lunch and dinner', () => {
    const fullDay = calculateExistingDiet(
      {
        meals: [
          lunchSelection,
          {
            mealName: 'dinner',
            rotiCount: 2,
            ricePortion: 'none',
            dalPortion: 'medium',
            sabziPortion: 'medium',
          },
        ],
      },
      'muscle_gain'
    );

    expect(fullDay.totalReliableProtein).toBeGreaterThan(30);
    expect(fullDay.totalReliableCalories).toBeGreaterThan(1000);
    expect(fullDay.mealEstimates).toHaveLength(2);
  });
});
