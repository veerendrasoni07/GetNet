import { BodyProfile, TrainingProfile } from '../profile/profile.types';

export interface NutritionTargetRange {
  target: number;
  min: number;
  max: number;
}

export interface DetailedNutritionTarget {
  bmr: number;
  tdee: number;
  calories: NutritionTargetRange;
  protein: NutritionTargetRange;
  carbohydrates: NutritionTargetRange;
  fat: NutritionTargetRange;
  fiber: {
    target: number;
  };
  waterMl: number;
}