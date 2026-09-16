import { Schema, model, Document } from 'mongoose';

export type IngestionRunType = 'NUTRITION' | 'PRICE' | 'SEED';

export interface IngestionError {
  item?: string;
  reason: string;
  details?: any;
}

export interface IDataIngestionRun {
  provider: string;
  runType: IngestionRunType;
  startedAt: Date;
  completedAt?: Date;
  isDryRun: boolean;
  requested: number;
  successful: number;
  rejected: number;
  duplicates: number;
  failed: number;
  errorLog: IngestionError[];
  summary?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DataIngestionRunDocument extends IDataIngestionRun, Document {}

const IngestionErrorSchema = new Schema<IngestionError>(
  {
    item: { type: String },
    reason: { type: String, required: true },
    details: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const DataIngestionRunSchema = new Schema<DataIngestionRunDocument>(
  {
    provider: { type: String, required: true, index: true },
    runType: {
      type: String,
      enum: ['NUTRITION', 'PRICE', 'SEED'],
      required: true,
      index: true,
    },
    startedAt: { type: Date, required: true, default: Date.now },
    completedAt: { type: Date },
    isDryRun: { type: Boolean, default: false },
    requested: { type: Number, default: 0 },
    successful: { type: Number, default: 0 },
    rejected: { type: Number, default: 0 },
    duplicates: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    errorLog: [IngestionErrorSchema],
    summary: { type: String },
  },
  {
    timestamps: true,
  }
);

export const DataIngestionRun = model<DataIngestionRunDocument>('DataIngestionRun', DataIngestionRunSchema);
export default DataIngestionRun;
