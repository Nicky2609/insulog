import { Router } from 'express';
import QuoteRequest from '../models/QuoteRequest.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
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
router.post('/form', async (req, res, next) => {
  try {
    const { full_name, email, phone, company_name, service_type, description } = req.body;

    if (!full_name || !email || !phone || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const doc = await QuoteRequest.create({ full_name, email, phone, company_name, service_type, description });

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
    const filter = status ? { status } : {};
    const docs = await QuoteRequest.find(filter).sort({ created_at: -1 });
    res.json({ requests: docs.map(serialize) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/quotes/form/:id - update status / assign
router.put('/form/:id', async (req, res, next) => {
  try {
    const doc = await QuoteRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ error: 'Request not found' });
    res.json({ request: serialize(doc) });
  } catch (err) {
    next(err);
  }
});

export default router;