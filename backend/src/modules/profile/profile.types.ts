export type Sex = 'male' | 'female';

export type Goal = 'fat_loss' | 'muscle_gain' | 'recomposition' | 'maintenance';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'high' | 'very_high';

export type LivingSituation = 'home' | 'hostel' | 'pg' | 'alone';

export type MessMeal = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type Equipment =
  | 'refrigerator'
  | 'kettle'
  | 'induction'
  | 'microwave'
  | 'mixer'
  | 'none';

export type DietType = 'vegetarian' | 'eggetarian' | 'non_vegetarian' | 'vegan';

export interface BodyProfile {
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  goal: Goal;
  targetWeightKg: number;
  bodyFatPercentage?: number;
}

export interface TrainingProfile {
  liftsWeights: boolean;
  trainingDaysPerWeek: number; // 1-7
  workoutTime: string; // e.g. "18:00"
  workoutDurationMinutes: number; // e.g. 75
  activityLevel: ActivityLevel;
}

export interface LifestyleProfile {
  livingSituation: LivingSituation;
  hasMess: boolean;
  messMeals: MessMeal[];
  availableEquipment: Equipment[];
}

export interface MealWindow {
  name: string;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
}

export interface ScheduleProfile {
  wakeUpTime: string;           // e.g. "07:00"
  collegeWorkStartTime: string; // e.g. "09:00"
  collegeWorkEndTime: string;   // e.g. "16:00"
  workoutTime: string;          // e.g. "18:00"
  sleepTime: string;            // e.g. "00:00"
  derivedWindows?: MealWindow[];
}

export interface BudgetProfile {
  monthlyExtraBudget: number; // e.g. 2000 INR
  messPaidSeparately: boolean;
  dailyExtraBudget?: number;   // calculated: monthlyExtraBudget / 30
}

export interface DietPreferenceProfile {
  dietType: DietType;
  allergies: string[];
  dislikedFoods: string[];
}

export interface UserDietProfile {
  id?: string;
  userId?: string;
  body: BodyProfile;
  training: TrainingProfile;
  lifestyle: LifestyleProfile;
  schedule: ScheduleProfile;
  budget: BudgetProfile;
  preferences: DietPreferenceProfile;
  createdAt?: Date;
  updatedAt?: Date;
}
