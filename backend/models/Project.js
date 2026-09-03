import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    client_name: { type: String, default: null },
    location: { type: String, default: null },
    status: {
      type: String,
      enum: ['planning', 'in_progress', 'paused', 'finished'],
      default: 'planning',
    },
    start_date: { type: Date, default: null },
    end_date: { type: Date, default: null },
    description: { type: String, default: null },
    image_url: { type: String, default: null },
    // Mongo _id (string) of the User who created the project.
    created_by: { type: String, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export default mongoose.model('Project', projectSchema);