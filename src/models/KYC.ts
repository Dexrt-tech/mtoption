import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IKYC extends Document {
  userId: Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  nameOnId: string;
  idType: 'passport' | 'drivers_license' | 'national_id';
  govIdFrontUrl: string;
  govIdBackUrl: string;
  proofOfAddressUrl: string;
  selfieUrl: string;
  rejectionReason?: string;
  reviewedAt?: Date;
  submittedAt: Date;
}

const KYCSchema = new Schema<IKYC>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    nameOnId: { type: String, required: true, trim: true },
    idType: { type: String, enum: ['passport', 'drivers_license', 'national_id'], required: true },
    govIdFrontUrl: { type: String, required: true },
    govIdBackUrl: { type: String, default: '' },
    proofOfAddressUrl: { type: String, required: true },
    selfieUrl: { type: String, required: true },
    rejectionReason: { type: String },
    reviewedAt: { type: Date },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.KYC || mongoose.model<IKYC>('KYC', KYCSchema);
