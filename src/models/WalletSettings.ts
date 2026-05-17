import mongoose, { Schema, Document } from 'mongoose';

export interface IWalletSettings extends Document {
  btc: string;
  eth: string;
  usdtBep20: string;
  usdtTrc20: string;
  updatedAt: Date;
}

const WalletSettingsSchema = new Schema<IWalletSettings>(
  {
    btc:       { type: String, default: '' },
    eth:       { type: String, default: '' },
    usdtBep20: { type: String, default: '' },
    usdtTrc20: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.WalletSettings ||
  mongoose.model<IWalletSettings>('WalletSettings', WalletSettingsSchema);
