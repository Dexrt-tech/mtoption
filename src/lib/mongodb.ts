import mongoose from 'mongoose';
import { Resolver } from 'dns/promises';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// The system DNS on Windows does not support SRV queries reliably from the
// Next.js server process. We resolve SRV+TXT ourselves via a Resolver instance
// (which has its own DNS config) and build a direct mongodb:// URI so Mongoose
// never needs to do an SRV lookup.
async function buildDirectUri(srvUri: string): Promise<string> {
  const m = srvUri.match(
    /^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?]+)(\/[^?]*)?(\?.*)?$/
  );
  if (!m) return srvUri;

  const [, user, pass, host, dbPath = '/nextrade', queryStr = ''] = m;

  const resolver = new Resolver();
  resolver.setServers(['8.8.8.8', '1.1.1.1', '208.67.222.222']);

  const [srvRecords, txtRecords] = await Promise.all([
    resolver.resolveSrv(`_mongodb._tcp.${host}`),
    resolver.resolveTxt(host).catch(() => [] as string[][]),
  ]);

  const hosts = srvRecords.map(r => `${r.name}:${r.port}`).join(',');
  const txtOptions = txtRecords.flat().join('&');
  const extraQuery = queryStr.replace(/^\?/, '');
  const fullQuery = [txtOptions, extraQuery].filter(Boolean).join('&');

  return `mongodb://${user}:${encodeURIComponent(decodeURIComponent(pass))}@${hosts}${dbPath}?ssl=true&${fullQuery}`;
}

async function tryConnect(): Promise<typeof mongoose> {
  const uri = MONGODB_URI.startsWith('mongodb+srv://')
    ? await buildDirectUri(MONGODB_URI)
    : MONGODB_URI;

  // Short connectTimeoutMS so failing shards are abandoned quickly and the
  // driver can complete server selection via whichever shard IS reachable.
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const conn = await mongoose.connect(uri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 20000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        tls: true,
        tlsAllowInvalidCertificates: false,
      });
      console.log(`[mongodb] Connected to Atlas (attempt ${attempt})`);
      return conn;
    } catch (err: any) {
      console.error(`[mongodb] Attempt ${attempt}/4: ${err.message}`);
      if (attempt < 4) {
        await new Promise(r => setTimeout(r, 3000));
        // Force a fresh connection so the driver re-evaluates which shards are up
        await mongoose.disconnect().catch(() => {});
      } else {
        throw err;
      }
    }
  }
  throw new Error('unreachable');
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = tryConnect().catch((err) => {
      cached.promise = null;
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
