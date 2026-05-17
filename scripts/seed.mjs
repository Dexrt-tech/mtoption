import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

try {
  const env = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
  for (const line of env.split('\n')) {
    const [k, ...rest] = line.split('=');
    if (k && rest.length) process.env[k.trim()] = rest.join('=').trim();
  }
} catch {}

const MONGODB_URI = process.env.MONGODB_URI;

// Inline schemas to avoid TypeScript issues in plain .mjs
const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  country: String,
  role: { type: String, default: 'user' },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  balance: { type: Number, default: 0 },
  totalDeposited: { type: Number, default: 0 },
  totalWithdrawn: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  referralCode: String,
}, { timestamps: true });

UserSchema.pre('validate', async function() {
  if (!this.referralCode) {
    this.referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  }
});

const PlanSchema = new mongoose.Schema({
  name: String,
  minAmount: Number,
  maxAmount: Number,
  roiPercent: Number,
  durationDays: Number,
  description: String,
  features: [String],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Plan = mongoose.models.Plan || mongoose.model('Plan', PlanSchema);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@nextrade.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@NexTrade2025!';

const DEFAULT_PLANS = [
  {
    name: 'Starter Plan',
    minAmount: 100,
    maxAmount: 999,
    roiPercent: 10,
    durationDays: 7,
    description: 'Perfect for beginners. Low entry, steady returns.',
    features: ['Daily earnings', 'Instant activation', '24/7 support'],
    isActive: true,
  },
  {
    name: 'Basic Plan',
    minAmount: 1000,
    maxAmount: 4999,
    roiPercent: 20,
    durationDays: 14,
    description: 'Build your portfolio with consistent weekly returns.',
    features: ['Higher ROI', 'Priority support', 'Auto-compounding'],
    isActive: true,
  },
  {
    name: 'Silver Plan',
    minAmount: 5000,
    maxAmount: 19999,
    roiPercent: 35,
    durationDays: 21,
    description: 'Mid-tier plan with excellent returns for serious investors.',
    features: ['Premium ROI', 'Dedicated account manager', 'Fast withdrawals'],
    isActive: true,
  },
  {
    name: 'Gold Plan',
    minAmount: 20000,
    maxAmount: 49999,
    roiPercent: 55,
    durationDays: 30,
    description: 'Premium investment tier for high returns over 30 days.',
    features: ['Top-tier ROI', 'VIP support', 'Same-day withdrawals', 'Market analysis reports'],
    isActive: true,
  },
  {
    name: 'Platinum Plan',
    minAmount: 50000,
    maxAmount: 500000,
    roiPercent: 80,
    durationDays: 60,
    description: 'Exclusive elite plan for maximum portfolio growth.',
    features: ['Elite ROI', 'Personal advisor', 'Instant withdrawals', 'Private market access', 'Monthly reports'],
    isActive: true,
  },
];

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  // Create admin
  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`Admin already exists: ${ADMIN_EMAIL}`);
  } else {
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await User.create({
      firstName: 'Admin',
      lastName: 'NexTrade',
      email: ADMIN_EMAIL,
      password: hashed,
      role: 'admin',
      isActive: true,
    });
    console.log(`✓ Admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  }

  // Seed plans
  const existingPlans = await Plan.countDocuments();
  if (existingPlans > 0) {
    console.log(`Plans already exist (${existingPlans} plans). Skipping.`);
  } else {
    await Plan.insertMany(DEFAULT_PLANS);
    console.log(`✓ ${DEFAULT_PLANS.length} investment plans seeded.`);
  }

  await mongoose.disconnect();
  console.log('\nSeed complete!');
  console.log(`\nAdmin login:\n  Email: ${ADMIN_EMAIL}\n  Password: ${ADMIN_PASSWORD}`);
  console.log('\nChange your admin password after first login!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
