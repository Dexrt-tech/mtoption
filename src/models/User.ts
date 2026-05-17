import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpiry?: Date;
  isActive: boolean;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalEarnings: number;
  referralCode: string;
  referredBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    country: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpiry: { type: Date },
    isActive: { type: Boolean, default: true },
    balance: { type: Number, default: 0 },
    totalDeposited: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    referralCode: { type: String, unique: true },
    referredBy: { type: String },
  },
  { timestamps: true }
);

UserSchema.pre('validate', async function () {
  if (!(this as IUser).referralCode) {
    (this as IUser).referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  }
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
