import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

import { connectMongo } from './config/mongoClient.js';
import authRoutes from './routes/auth.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import projectsRoutes from './routes/projects.routes.js';
import quotesRoutes from './routes/quotes.routes.js';
import usersRoutes from './routes/users.routes.js';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',');

// The API is stateless (Bearer tokens, no cookies), so credentials:true is
// unnecessary and only widens the CORS attack surface.
app.use(cors({ origin: allowedOrigins }));
app.use(helmet());
app.use(express.json({ limit: '5mb' }));
// Strips any request key starting with "$" or containing "." so query/body
// params can never be turned into Mongo operators (NoSQL injection).
app.use(mongoSanitize());
app.use(morgan('dev'));

// Generic API-wide limiter (defense in depth); the sensitive auth/public
// endpoints below get their own, stricter limiters.
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'insulog-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/users', usersRoutes);

// Centralized error handler. In production, unexpected (5xx) errors return a
// generic message instead of the raw err.message, which can otherwise leak
// internal details (schema/field names, driver errors, etc.) to the client.
// The message is still logged server-side either way.
app.use((err, req, res, next) => {
  console.error(err);
  const isMulterOrUploadError = err.name === 'MulterError' || /solo se permiten/i.test(err.message || '');
  const status = err.status || (isMulterOrUploadError ? 400 : 500);
  const message = !isProduction || status < 500 ? err.message || 'Internal server error' : 'Internal server error';
  res.status(status).json({ error: message });
});

const port = process.env.PORT || 4000;

connectMongo()
  .then(() => {
    app.listen(port, () => {
      console.log(`Insulog backend listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
