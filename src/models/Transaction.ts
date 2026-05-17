import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'deposit' | 'withdrawal' | 'earning' | 'bonus';
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  paymentMethod?: string;
  walletAddress?: string;
  txHash?: string;
  transactionHash?: string;
  screenshot?: string;
  network?: string;
  note?: string;
  method?: string;
  accountDetails?: Record<string, unknown>;
  processedAt?: Date;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['deposit', 'withdrawal', 'earning', 'bonus'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
    paymentMethod: { type: String },
    walletAddress: { type: String },
    txHash: { type: String },
    transactionHash: { type: String },
    screenshot: { type: String },
    network: { type: String },
    note: { type: String },
    method: { type: String },
    accountDetails: { type: Schema.Types.Mixed },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
