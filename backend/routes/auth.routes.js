import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import { serializeUser, signToken } from '../utils/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { sendPasswordResetEmail } from '../utils/mailer.js';

const router = Router();
const MIN_PASSWORD_LENGTH = 8;

// POST /api/auth/login - PUBLIC. Staff accounts only (admin/engineer);
// there is no self-registration since quoting no longer requires an
// account, only the public quote form does.
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }
    if (!user.is_active) {
      return res.status(403).json({ error: 'Esta cuenta esta desactivada' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const token = signToken(user);
    res.json({ token, user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me - used by the frontend to restore a session on page load.
router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/forgot-password - PUBLIC.
// Always responds with the same generic message, whether or not the email
// exists, so this endpoint can't be used to find out which emails have
// an account (a common security precaution for this kind of form).
router.post('/forgot-password', authLimiter, async (req, res, next) => {
  const startedAt = Date.now();
  // Both branches (email exists / doesn't) are padded to the same minimum
  // duration before responding, so response timing can't be used to
  // enumerate which emails have an account.
  const MIN_RESPONSE_MS = 400;
  const respondGeneric = async () => {
    const elapsed = Date.now() - startedAt;
    if (elapsed < MIN_RESPONSE_MS) {
      await new Promise((resolve) => setTimeout(resolve, MIN_RESPONSE_MS - elapsed));
    }
    res.json({
      message: 'Si el correo existe en nuestro sistema, se envio un enlace para restablecer la contraseña.',
    });
  };

  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Falta el correo' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.is_active) {
      return respondGeneric();
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.reset_token = token;
    user.reset_token_expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    try {
      await sendPasswordResetEmail(user, token);
    } catch (emailErr) {
      console.error('No fue posible enviar el correo de recuperacion:', emailErr.message);
      // The token was already saved, so someone with backend/DB access could
      // still complete the reset; but we don't reveal the email failure to
      // the caller, to keep the same generic response either way.
    }

    return respondGeneric();
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/reset-password - PUBLIC. Takes the token from the emailed
// link plus a new password, and also clears must_change_password: setting
// a fresh password this way satisfies that requirement too.
router.post('/reset-password', authLimiter, async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Falta el token o la contraseña' });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres` });
    }

    const user = await User.findOne({ reset_token: token, reset_token_expires: { $gt: new Date() } });
    if (!user) {
      return res.status(400).json({ error: 'El enlace no es valido o ya expiro' });
    }

    user.password_hash = await bcrypt.hash(password, 10);
    user.must_change_password = false;
    user.reset_token = null;
    user.reset_token_expires = null;
    await user.save();

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/change-password - authenticated. Used right after login
// when must_change_password is true (a temporary password an admin set),
// but works any time the user is logged in.
router.post('/change-password', requireAuth, async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres` });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    user.password_hash = await bcrypt.hash(password, 10);
    user.must_change_password = false;
    await user.save();

    res.json({ user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
});

export default router;