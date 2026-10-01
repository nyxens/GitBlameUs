import jwt from 'jsonwebtoken';
import { Staff } from '../models/index.js';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'super-secret-lifevault-access-key-2026';

export function authMiddleware(req, res, next) {
  // Try cookie first, then Authorization header
  let token = req.cookies?.accessToken;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized. Access token required.' });
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = decoded; // { sub, email, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired access token.' });
  }
}

/** Only platform admins (role ADMIN in the access token) may continue. */
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Admin access required.' });
  }
  next();
}

/**
 * Sets req.scope: admins see everything ({ all: true }); staff only see the single
 * hospital / blood bank they belong to ({ all: false, id, type }). Others are rejected.
 */
export async function resolveScope(req, res, next) {
  try {
    if (req.user?.role === 'ADMIN') {
      req.scope = { all: true };
      return next();
    }
    const staff = await Staff.findOne({ u_id: req.user?.sub }).lean();
    if (!staff) {
      return res.status(403).json({ success: false, error: 'Only admins and hospital/blood bank staff can access this.' });
    }
    req.scope = { all: false, id: staff.hos_or_bank_id, type: staff.hos_or_bank_type };
    next();
  } catch (err) {
    next(err);
  }
}
