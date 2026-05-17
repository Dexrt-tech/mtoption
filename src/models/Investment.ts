import mongoose, { Schema, Document } from 'mongoose';

export interface IInvestment extends Document {
  userId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  planName: string;
  amount: number;
  roiPercent: number;
  durationDays: number;
  earnings: number;
  status: 'active' | 'completed' | 'cancelled';
  startDate: Date;
  endDate: Date;
  lastCredited: Date;
  createdAt: Date;
}

const InvestmentSchema = new Schema<IInvestment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
    planName: { type: String, required: true },
    amount: { type: Number, required: true },
    roiPercent: { type: Number, required: true },
    durationDays: { type: Number, required: true },
    earnings: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    lastCredited: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Investment || mongoose.model<IInvestment>('Investment', InvestmentSchema);
