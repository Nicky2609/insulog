import { Router } from 'express';
import mongoose from 'mongoose';
import QuoteRequest from '../models/QuoteRequest.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { publicFormLimiter } from '../middleware/rateLimit.js';
import { sendQuoteRequestEmail } from '../utils/mailer.js';

const router = Router();

function serialize(doc) {
  return {
    id: doc._id.toString(),
    full_name: doc.full_name,
    email: doc.email,
    phone: doc.phone,
    company_name: doc.company_name || null,
    service_type: doc.service_type || null,
    description: doc.description,
    status: doc.status,
    assigned_to: doc.assigned_to || null,
    created_at: doc.created_at,
  };
}

// POST /api/quotes/form - PUBLIC endpoint, no login required.
router.post('/form', publicFormLimiter, async (req, res, next) => {
  try {
    const { full_name, email, phone, company_name, service_type, description } = req.body;

    if (!full_name || !email || !phone || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const doc = await QuoteRequest.create({
      full_name: String(full_name).slice(0, 200),
      email: String(email).slice(0, 200),
      phone: String(phone).slice(0, 50),
      company_name: company_name ? String(company_name).slice(0, 200) : null,
      service_type: service_type ? String(service_type).slice(0, 100) : null,
      description: String(description).slice(0, 5000),
    });

    await sendQuoteRequestEmail(doc);

    res.status(201).json({ request: serialize(doc) });
  } catch (err) {
    next(err);
  }
});

// Everything below requires staff (admin or engineer).
router.use(requireAuth, requireRole('admin', 'engineer'));

// GET /api/quotes/form - list form submissions
router.get('/form', async (req, res, next) => {
  try {
    const { status } = req.query;
    if (status !== undefined && typeof status !== 'string') {
      return res.status(400).json({ error: 'status invalido' });
    }

    // Only a primitive string from the query can become part of the filter.
    const filter = status ? { status: String(status) } : {};
    const docs = await QuoteRequest.find(filter).sort({ created_at: -1 });
    res.json({ requests: docs.map(serialize) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/quotes/form/:id - update status / assign
router.put('/form/:id', async (req, res, next) => {
  try {
    // Whitelist: staff may only change status/assignment here, never the
    // submitter's own data (full_name, email, phone, description, ...).
    const payload = {};
    if (req.body.status !== undefined) {
      if (typeof req.body.status !== 'string') {
        return res.status(400).json({ error: 'status invalido' });
      }
      payload.status = req.body.status;
    }
    if (req.body.assigned_to !== undefined) {
      const assignedTo = req.body.assigned_to;
      if (assignedTo === null || assignedTo === '') {
        payload.assigned_to = null;
      } else if (typeof assignedTo === 'string' && mongoose.Types.ObjectId.isValid(assignedTo)) {
        payload.assigned_to = new mongoose.Types.ObjectId(assignedTo);
      } else {
        return res.status(400).json({ error: 'assigned_to invalido' });
      }
    }

    const doc = await QuoteRequest.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!doc) return res.status(404).json({ error: 'Request not found' });
    res.json({ request: serialize(doc) });
  } catch (err) {
    next(err);
  }
});

export default router;