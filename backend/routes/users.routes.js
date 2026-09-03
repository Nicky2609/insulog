import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { serializeUser } from '../utils/auth.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));

// GET /api/users - list every user
router.get('/', async (req, res, next) => {
  try {
    const docs = await User.find().sort({ created_at: -1 });
    res.json({ users: docs.map(serializeUser) });
  } catch (err) {
    next(err);
  }
});

// POST /api/users - admin creates a staff account (admin or engineer)
router.post('/', async (req, res, next) => {
  try {
    const { email, password, full_name, role } = req.body;

    if (!email || !password || !full_name || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!['admin', 'engineer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.toLowerCase(),
      password_hash,
      full_name,
      role,
      // The admin just set a temporary password for this person, so force
      // them to pick their own the moment they log in.
      must_change_password: true,
    });

    res.status(201).json({ user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/:id/role - change a user's role
router.put('/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'engineer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const doc = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!doc) return res.status(404).json({ error: 'User not found' });
    res.json({ user: serializeUser(doc) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/:id/status - activate/deactivate an account
router.put('/:id/status', async (req, res, next) => {
  try {
    const { is_active } = req.body;
    const doc = await User.findByIdAndUpdate(req.params.id, { is_active }, { new: true });
    if (!doc) return res.status(404).json({ error: 'User not found' });
    res.json({ user: serializeUser(doc) });
  } catch (err) {
    next(err);
  }
});

export default router;