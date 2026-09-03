import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password_hash: { type: String, required: true },
    full_name: { type: String, required: true, trim: true },
    phone: { type: String, default: null },
    company_name: { type: String, default: null },
    role: {
      type: String,
      enum: ['admin', 'engineer'],
      default: 'engineer',
    },
    is_active: { type: Boolean, default: true },
    // Forces the "change your password" screen right after login. Set to
    // true whenever an admin creates the account with a temporary password.
    must_change_password: { type: Boolean, default: false },
    // "Forgot password" flow: a single-use token and its expiry.
    reset_token: { type: String, default: null },
    reset_token_expires: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export default mongoose.model('User', userSchema);