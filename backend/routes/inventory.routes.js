import { Router } from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import InventoryItem from '../models/InventoryItem.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { buildInventoryWorkbook, parseInventoryWorkbook } from '../utils/excel.js';
import { createUploader, uploadToCloudinary } from '../utils/fileStorage.js';

const router = Router();
const uploadExcel = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isXlsx =
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.originalname.toLowerCase().endsWith('.xlsx');
    cb(isXlsx ? null : new Error('Solo se permiten archivos .xlsx'), isXlsx);
  },
});
const uploadImage = createUploader();

// Fields a client is allowed to set on an inventory item. Anything else in
// req.body (e.g. an attempt to set updated_by/created_at) is dropped.
const WRITABLE_FIELDS = [
  'code',
  'name',
  'category',
  'unit',
  'quantity',
  'min_stock',
  'unit_price',
  'warehouse_location',
  'project_id',
  'notes',
];

function pickWritableFields(body) {
  const payload = {};
  for (const field of WRITABLE_FIELDS) {
    if (body[field] !== undefined) payload[field] = body[field];
  }
  return payload;
}

// All inventory routes require an authenticated admin or engineer.
router.use(requireAuth, requireRole('admin', 'engineer'));

// Turns a Mongoose document (with project_id possibly populated) into the
// flat shape the frontend expects: project_id (string, for the edit form)
// plus projects: { id, name } (for display).
function serializeItem(doc) {
  const projectDoc =
    doc.project_id && typeof doc.project_id === 'object' && 'name' in doc.project_id ? doc.project_id : null;

  return {
    id: doc._id.toString(),
    code: doc.code,
    name: doc.name,
    category: doc.category || null,
    unit: doc.unit,
    quantity: doc.quantity,
    min_stock: doc.min_stock,
    unit_price: doc.unit_price,
    warehouse_location: doc.warehouse_location || null,
    project_id: projectDoc ? projectDoc._id.toString() : doc.project_id ? doc.project_id.toString() : null,
    projects: projectDoc ? { id: projectDoc._id.toString(), name: projectDoc.name } : null,
    notes: doc.notes || null,
    image_url: doc.image_url || null,
    updated_by: doc.updated_by || null,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

// GET /api/inventory - list items, optional search + project filter
router.get('/', async (req, res, next) => {
  try {
    const { search, project_id } = req.query;
    const filter = {};

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: regex }, { code: regex }];
    }
    if (project_id) {
      if (!mongoose.Types.ObjectId.isValid(project_id)) {
        return res.status(400).json({ error: 'project_id invalido' });
      }
      filter.project_id = project_id;
    }

    const docs = await InventoryItem.find(filter).sort({ name: 1 }).populate('project_id', 'name');
    res.json({ items: docs.map(serializeItem) });
  } catch (err) {
    next(err);
  }
});

// POST /api/inventory - create a single item
router.post('/', async (req, res, next) => {
  try {
    const payload = { ...pickWritableFields(req.body), updated_by: req.user.id };
    if (!payload.project_id) payload.project_id = null;
    else if (!mongoose.Types.ObjectId.isValid(payload.project_id)) {
      return res.status(400).json({ error: 'project_id invalido' });
    }

    const doc = await InventoryItem.create(payload);
    await doc.populate('project_id', 'name');
    res.status(201).json({ item: serializeItem(doc) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Ya existe un item con ese codigo' });
    next(err);
  }
});

// PUT /api/inventory/:id - update a single item
router.put('/:id', async (req, res, next) => {
  try {
    const payload = { ...pickWritableFields(req.body), updated_by: req.user.id };
    if (payload.project_id === '') payload.project_id = null;
    else if (payload.project_id && !mongoose.Types.ObjectId.isValid(payload.project_id)) {
      return res.status(400).json({ error: 'project_id invalido' });
    }

    const doc = await InventoryItem.findByIdAndUpdate(req.params.id, payload, { new: true }).populate(
      'project_id',
      'name'
    );
    if (!doc) return res.status(404).json({ error: 'Item not found' });
    res.json({ item: serializeItem(doc) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Ya existe un item con ese codigo' });
    next(err);
  }
});

// POST /api/inventory/:id/image - upload or replace the photo of an item
router.post('/:id/image', uploadImage.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file was uploaded' });
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer, 'inventory');

    const doc = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      { image_url: imageUrl, updated_by: req.user.id },
      { new: true }
    ).populate('project_id', 'name');

    if (!doc) return res.status(404).json({ error: 'Item not found' });
    res.json({ item: serializeItem(doc) });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/inventory/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await InventoryItem.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// GET /api/inventory/export/excel - download the whole inventory as .xlsx
router.get('/export/excel', async (req, res, next) => {
  try {
    const docs = await InventoryItem.find().sort({ name: 1 }).populate('project_id', 'name');
    const items = docs.map(serializeItem);

    const workbook = await buildInventoryWorkbook(items);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="inventario-insulog.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
});

// POST /api/inventory/import/excel - upload a .xlsx file to bulk create/update items
router.post('/import/excel', uploadExcel.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file was uploaded' });
    }

    const { rows, skipped } = await parseInventoryWorkbook(req.file.buffer);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'No valid rows found in the file', skipped });
    }

    // Preserve existing images: if a row does not include an Imagen (URL)
    // value, keep whatever image the item already had instead of clearing it.
    const codes = rows.map((row) => row.code);
    const existingItems = await InventoryItem.find({ code: { $in: codes } }).select('code image_url');
    const existingImageByCode = new Map(existingItems.map((item) => [item.code, item.image_url]));

    const savedItems = [];
    for (const row of rows) {
      const payload = {
        ...row,
        image_url: row.image_url || existingImageByCode.get(row.code) || null,
        updated_by: req.user.id,
      };
      const doc = await InventoryItem.findOneAndUpdate({ code: row.code }, payload, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      });
      savedItems.push(doc);
    }

    res.json({
      imported: savedItems.length,
      skipped,
      items: savedItems.map(serializeItem),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
