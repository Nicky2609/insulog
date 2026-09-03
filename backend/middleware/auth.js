import User from '../models/User.js';
import { verifyToken, serializeUser } from '../utils/auth.js';

// Reads the JWT from the Authorization header, validates it, loads the
// user fresh from MongoDB and attaches it to req.user.
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Missing authentication token' });
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account disabled' });
    }

    req.user = serializeUser(user);
    next();
  } catch (err) {
    next(err);
  }
}

// Usage: requireRole('admin', 'engineer')
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission for this action' });
    }
    next();
  };
}
