import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Node's own DNS resolver (c-ares) can fail with ECONNREFUSED on the SRV
// lookup that mongodb+srv:// needs, on machines where the OS-configured DNS
// server is an IPv6 link-local address (fe80::...) - the OS's own resolver
// (nslookup, etc.) handles that fine, but c-ares does not. Pointing Node at
// public resolvers directly sidesteps that, without requiring any change to
// the machine's network settings.
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // If this fails for some reason, connect() below will surface the real error.
}

export async function connectMongo() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('Missing MONGODB_URI in .env');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
}
