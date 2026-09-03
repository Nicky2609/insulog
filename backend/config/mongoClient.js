import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export async function connectMongo() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('Missing MONGODB_URI in .env');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
}
