import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Load .env.local
try {
  const env = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
  for (const line of env.split('\n')) {
    const [k, ...rest] = line.split('=');
    if (k && rest.length) process.env[k.trim()] = rest.join('=').trim();
  }
} catch {}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('MONGODB_URI not set in .env.local'); process.exit(1); }

const UserSchema = new mongoose.Schema({
  firstName: String, lastName: String,
  email: { type: String, unique: true },
  password: String, phone: String, country: String,
  role: { type: String, default: 'user' },
  isVerified: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  balance: { type: Number, default: 5000 },
  totalDeposited: { type: Number, default: 5000 },
  totalWithdrawn: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 320 },
  referralCode: String,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const EMAIL = 'demo@nextrade.com';
const PASSWORD = 'Demo@1234';

async function run() {
  await mongoose.connect(MONGODB_URI);
  const existing = await User.findOne({ email: EMAIL });
  if (existing) {
    console.log('Demo user already exists — resetting password.');
    existing.password = await bcrypt.hash(PASSWORD, 12);
    existing.balance = 5000;
    await existing.save();
  } else {
    const hashed = await bcrypt.hash(PASSWORD, 12);
    await User.create({
      firstName: 'Demo', lastName: 'User', email: EMAIL, password: hashed,
      phone: '+1 555-0100', country: 'United States',
      balance: 5000, totalDeposited: 5000, totalWithdrawn: 0, totalEarnings: 320,
      referralCode: 'DEMO2025',
    });
  }
  await mongoose.disconnect();
  console.log('\n✓ Demo user ready!\n');
  console.log('  Email   :', EMAIL);
  console.log('  Password:', PASSWORD);
  console.log('\nBalance pre-loaded: $5,000.00\n');
}

run().catch(e => { console.error(e); process.exit(1); });
