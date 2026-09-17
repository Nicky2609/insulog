import { Router } from 'express';
import Project from '../models/Project.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { createUploader, uploadToCloudinary } from '../utils/fileStorage.js';

const router = Router();
const uploadImage = createUploader();

// Fields a client is allowed to set on a project. Anything else in req.body
// (e.g. an attempt to set created_by) is dropped.
const WRITABLE_FIELDS = ['name', 'client_name', 'location', 'status', 'start_date', 'end_date', 'description'];

function pickWritableFields(body) {
  const payload = {};
  for (const field of WRITABLE_FIELDS) {
    if (body[field] !== undefined) payload[field] = body[field];
  }
  return payload;
}

router.use(requireAuth, requireRole('admin', 'engineer'));

function serializeProject(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    client_name: doc.client_name || null,
    location: doc.location || null,
    status: doc.status,
    start_date: doc.start_date,
    end_date: doc.end_date,
    description: doc.description || null,
    image_url: doc.image_url || null,
    created_by: doc.created_by || null,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

// GET /api/projects
router.get('/', async (req, res, next) => {
  try {
    const docs = await Project.find().sort({ created_at: -1 });
    res.json({ projects: docs.map(serializeProject) });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects
router.post('/', async (req, res, next) => {
  try {
    const doc = await Project.create({ ...pickWritableFields(req.body), created_by: req.user.id });
    res.status(201).json({ project: serializeProject(doc) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/projects/:id
router.put('/:id', async (req, res, next) => {
  try {
    const doc = await Project.findByIdAndUpdate(req.params.id, pickWritableFields(req.body), { new: true });
    if (!doc) return res.status(404).json({ error: 'Project not found' });
    res.json({ project: serializeProject(doc) });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/image - upload or replace the photo of an obra
router.post('/:id/image', uploadImage.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file was uploaded' });
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer, 'projects');

    const doc = await Project.findByIdAndUpdate(req.params.id, { image_url: imageUrl }, { new: true });
    if (!doc) return res.status(404).json({ error: 'Project not found' });
    res.json({ project: serializeProject(doc) });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/projects/:id (admin only)
router.delete('/:id', requireRole('admin'), async (req, res, next) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
