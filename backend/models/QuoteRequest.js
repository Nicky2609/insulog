import mongoose from 'mongoose';

const quoteRequestSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    company_name: { type: String, default: null },
    service_type: { type: String, default: null },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['new', 'contacted', 'closed'],
      default: 'new',
    },
    // Mongo _id (string) of the staff member assigned to follow up.
    assigned_to: { type: String, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

export default mongoose.model('QuoteRequest', quoteRequestSchema);
