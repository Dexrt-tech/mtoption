import mongoose, { Schema, Document } from 'mongoose';

export interface IPlan extends Document {
  name: string;
  minAmount: number;
  maxAmount: number;
  roiPercent: number;
  bonusPercent: number;
  durationDays: number;
  description: string;
  features: string[];
  isActive: boolean;
  createdAt: Date;
}

const PlanSchema = new Schema<IPlan>(
  {
    name: { type: String, required: true },
    minAmount: { type: Number, required: true },
    maxAmount: { type: Number, required: true },
    roiPercent: { type: Number, required: true },
    bonusPercent: { type: Number, default: 0 },
    durationDays: { type: Number, required: true },
    description: { type: String, default: '' },
    features: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Plan || mongoose.model<IPlan>('Plan', PlanSchema);
