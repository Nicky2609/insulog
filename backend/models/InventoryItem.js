import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, default: null },
    unit: { type: String, default: 'UND' },
    quantity: { type: Number, default: 0 },
    min_stock: { type: Number, default: 0 },
    unit_price: { type: Number, default: 0 },
    warehouse_location: { type: String, default: null },
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    notes: { type: String, default: null },
    image_url: { type: String, default: null },
    // Mongo _id (string) of the User who last touched this item.
    updated_by: { type: String, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export default mongoose.model('InventoryItem', inventoryItemSchema);
