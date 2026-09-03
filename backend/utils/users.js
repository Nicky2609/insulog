import User from '../models/User.js';
import { serializeUser } from './auth.js';

// Given an array of Mongo user ids, returns a Map(id -> serialized user).
export async function getUsersByIds(ids) {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) return new Map();

  const docs = await User.find({ _id: { $in: uniqueIds } });
  return new Map(docs.map((doc) => [doc._id.toString(), serializeUser(doc)]));
}

export async function getUserById(id) {
  if (!id) return null;
  const doc = await User.findById(id);
  return doc ? serializeUser(doc) : null;
}
