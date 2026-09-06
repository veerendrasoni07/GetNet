import { Schema, model, Document } from 'mongoose';
import { UserDietProfile } from './profile.types';

export interface UserDietProfileDocument extends Omit<UserDietProfile, 'id'>, Document {}

const UserDietProfileSchema = new Schema<UserDietProfileDocument>(
  {
    userId: { type: String, required: true, index: true },
    body: {
      age: { type: Number, required: true },
      sex: { type: String, enum: ['male', 'female'], required: true },
      heightCm: { type: Number, required: true },
      weightKg: { type: Number, required: true },
      goal: {
        type: String,
        enum: ['fat_loss', 'muscle_gain', 'recomposition', 'maintenance'],
        required: true,
      },
      targetWeightKg: { type: Number, required: true },
      bodyFatPercentage: { type: Number },
    },
    training: {
      liftsWeights: { type: Boolean, required: true },
      trainingDaysPerWeek: { type: Number, required: true },
      workoutTime: { type: String, required: true },
      workoutDurationMinutes: { type: Number, required: true },
      activityLevel: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'high', 'very_high'],
        required: true,
      },
    },
    lifestyle: {
      livingSituation: {
        type: String,
        enum: ['home', 'hostel', 'pg', 'alone'],
        required: true,
      },
      hasMess: { type: Boolean, required: true },
      messMeals: [{ type: String }],
      availableEquipment: [{ type: String }],
    },
    schedule: {
      wakeUpTime: { type: String, required: true },
      collegeWorkStartTime: { type: String, required: true },
      collegeWorkEndTime: { type: String, required: true },
      workoutTime: { type: String, required: true },
      sleepTime: { type: String, required: true },
      derivedWindows: [
        {
          name: { type: String },
          startTime: { type: String },
          endTime: { type: String },
        },
      ],
    },
    budget: {
      monthlyExtraBudget: { type: Number, required: true },
      messPaidSeparately: { type: Boolean, default: true },
      dailyExtraBudget: { type: Number, required: true },
    },
    preferences: {
      dietType: {
        type: String,
        enum: ['vegetarian', 'eggetarian', 'non_vegetarian', 'vegan'],
        required: true,
      },
      allergies: [{ type: String }],
      dislikedFoods: [{ type: String }],
    },
  },
  {
    timestamps: true,
  }
);

export const UserDietProfileModel = model<UserDietProfileDocument>(
  'UserDietProfile',
  UserDietProfileSchema
);
