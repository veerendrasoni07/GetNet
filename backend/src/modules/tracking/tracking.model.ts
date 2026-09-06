import { Schema, model, Document } from 'mongoose';

export interface MealLogItem {
  foodId?: string;
  name: string;
  status: 'done' | 'skipped' | 'modified';
  loggedAt: Date;
}

export interface MealLogDocument extends Document {
  userId: string;
  date: string; // YYYY-MM-DD
  slotName: string;
  items: MealLogItem[];
  adherencePercentage: number;
}

const MealLogSchema = new Schema<MealLogDocument>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    slotName: { type: String, required: true },
    items: [
      {
        foodId: { type: String },
        name: { type: String, required: true },
        status: { type: String, enum: ['done', 'skipped', 'modified'], required: true },
        loggedAt: { type: Date, default: Date.now },
      },
    ],
    adherencePercentage: { type: Number, default: 100 },
  },
  { timestamps: true }
);

export const MealLogModel = model<MealLogDocument>('MealLog', MealLogSchema);

export interface WeightRecordDocument extends Document {
  userId: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
}

const WeightRecordSchema = new Schema<WeightRecordDocument>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    weightKg: { type: Number, required: true },
  },
  { timestamps: true }
);

export const WeightRecordModel = model<WeightRecordDocument>('WeightRecord', WeightRecordSchema);
