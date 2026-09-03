import jwt from 'jsonwebtoken';

// Never send password_hash to the frontend.
export function serializeUser(doc) {
  return {
    id: doc._id.toString(),
    email: doc.email,
    full_name: doc.full_name,
    phone: doc.phone || null,
    company_name: doc.company_name || null,
    role: doc.role,
    is_active: doc.is_active,
    must_change_password: !!doc.must_change_password,
    created_at: doc.created_at,
  };
}

export function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}