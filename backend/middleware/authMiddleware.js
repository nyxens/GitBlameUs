import jwt from 'jsonwebtoken';

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

export function optionalAuthMiddleware(req, _res, next) {
  let token = req.cookies?.accessToken;

  if (!token) {
    const authHeader = req.headers?.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
      req.user = decoded; // { sub, email, role, iat, exp }
    } catch (_err) {
      // Ignore invalid or expired token for optional auth
    }
  }

  next();
}
