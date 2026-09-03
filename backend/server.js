import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { connectMongo } from './config/mongoClient.js';
import authRoutes from './routes/auth.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import projectsRoutes from './routes/projects.routes.js';
import quotesRoutes from './routes/quotes.routes.js';
import usersRoutes from './routes/users.routes.js';

dotenv.config();

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',');

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'insulog-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/users', usersRoutes);

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
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
