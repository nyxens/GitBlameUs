import jwt from 'jsonwebtoken';
import { User, Staff, Admin } from '../models/index.js';

const getAccessTokenSecret = () =>
  process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'super-secret-lifevault-access-key-2026';

const getRefreshTokenSecret = () =>
  process.env.REFRESH_TOKEN_SECRET || process.env.JWT_REFRESH_SECRET || 'super-secret-lifevault-refresh-key-2026';

export async function authMiddleware(req, res, next) {
  // 1. Try accessToken cookie first, then Authorization Bearer header
  let token = req.cookies?.accessToken;

  if (!token) {
    const authHeader = req.headers?.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }
  }

  // 2. If token is present, attempt verification
  if (token) {
    try {
      const decoded = jwt.verify(token, getAccessTokenSecret());
      req.user = decoded; // { sub, email, role, iat, exp }
      return next();
    } catch (_err) {
      // If token expired or invalid, fall through to silent refresh
    }
  }

  // 3. Fallback: Silent refresh using refreshToken cookie or header
  const refreshToken = req.cookies?.refreshToken || req.headers?.['x-refresh-token'];
  if (refreshToken) {
    try {
      const refreshDecoded = jwt.verify(refreshToken, getRefreshTokenSecret());
      const userId = refreshDecoded.sub;

      const admin = await Admin.findById(userId);
      if (admin) {
        const role = 'ADMIN';
        const userObj = { sub: admin._id.toString(), id: admin._id.toString(), email: admin.email, role };
        const newAccessToken = jwt.sign(userObj, getAccessTokenSecret(), { expiresIn: '15m' });

        res.cookie('accessToken', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          path: '/',
          maxAge: 15 * 60 * 1000,
        });
        res.setHeader('x-access-token', newAccessToken);
        req.user = userObj;
        return next();
      }

      const user = await User.findById(userId);
      if (user) {
        const staff = await Staff.findOne({ u_id: user._id });
        const role = staff ? staff.role : (user.role || 'USER');
        const userObj = { sub: user._id.toString(), id: user._id.toString(), email: user.email, role };
        const newAccessToken = jwt.sign(userObj, getAccessTokenSecret(), { expiresIn: '15m' });

        res.cookie('accessToken', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          path: '/',
          maxAge: 15 * 60 * 1000,
        });
        res.setHeader('x-access-token', newAccessToken);
        req.user = userObj;
        return next();
      }
    } catch (_refreshErr) {
      // Refresh token invalid or expired
    }
  }

  return res.status(401).json({
    success: false,
    error: 'Unauthorized. Access token is missing, expired, or invalid.',
  });
}

export async function optionalAuthMiddleware(req, res, next) {
  let token = req.cookies?.accessToken;

  if (!token) {
    const authHeader = req.headers?.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, getAccessTokenSecret());
      req.user = decoded; // { sub, email, role, iat, exp }
      return next();
    } catch (_err) {
      // Fall through to try refreshToken
    }
  }

  const refreshToken = req.cookies?.refreshToken || req.headers?.['x-refresh-token'];
  if (refreshToken) {
    try {
      const refreshDecoded = jwt.verify(refreshToken, getRefreshTokenSecret());
      const userId = refreshDecoded.sub;
      const user = await User.findById(userId);
      if (user) {
        const staff = await Staff.findOne({ u_id: user._id });
        const role = staff ? staff.role : (user.role || 'USER');
        req.user = { sub: user._id.toString(), id: user._id.toString(), email: user.email, role };
      }
    } catch (_refreshErr) {
      // Ignore
    }
  }

  next();
}
