import rateLimit from 'express-rate-limit';

// Strict limiter for authentication endpoints (login, forgot/reset password):
// blocks brute-force / credential-stuffing and mass reset-email abuse.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Intente de nuevo en unos minutos.' },
});

// Looser limiter for the public quote-request form: still public/unauthenticated,
// but expected to be used more than a handful of times per IP.
export const publicFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Intente de nuevo mas tarde.' },
});
