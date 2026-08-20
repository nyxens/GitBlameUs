// controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, Donor, Hospital, Patient } from '../models/index.js';

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'super-secret-lifevault-access-key-2026';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_REFRESH_SECRET || 'super-secret-lifevault-refresh-key-2026';
const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';
const isProd = process.env.NODE_ENV === 'production';

const baseCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'strict' : 'lax',
};

function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id, email: user.email, role: user.role },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES }
  );
}

function signRefreshToken(user) {
  return jwt.sign({ sub: user._id }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES,
  });
}

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('accessToken', accessToken, {
    ...baseCookieOptions,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    ...baseCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth/refresh',
  });
}

// --- Signup ---
export async function signup(req, res) {
  try {
    const { name, email, password, phone, bloodGroup, hospitalName, licenseId, city, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const assignedRole = role || (hospitalName || licenseId ? 'HOSPITAL' : 'DONOR');

    const user = await User.create({
      name: name || hospitalName || 'LifeVault User',
      email,
      password: passwordHash,
      phone: phone || '+1-555-0100',
      bloodGroup: bloodGroup || 'O+',
      hospitalName,
      licenseId,
      city: city || 'New York',
      role: assignedRole,
      isVerified: true,
      status: 'ACTIVE',
    });

    // Auto-create domain record based on role
    if (assignedRole === 'DONOR') {
      try {
        await Donor.create({
          userId: user._id,
          donorId: `#LV-DONOR-${Math.floor(1000 + Math.random() * 9000)}`,
          name: user.name,
          phone: user.phone,
          email: user.email,
          bloodGroup: user.bloodGroup,
          city: user.city,
          isEligible: true,
          eligibilityStatus: 'ELIGIBLE',
        });
      } catch (_err) {
        // Non-fatal error
      }
    } else if (assignedRole === 'HOSPITAL' || assignedRole === 'DOCTOR') {
      try {
        await Hospital.create({
          userId: user._id,
          name: hospitalName || user.name,
          licenseId: licenseId || `HOSP-LIC-${Math.floor(1000 + Math.random() * 9000)}`,
          city: user.city,
          networkNode: 'NODE-REGIONAL-01',
          isVerified: true,
        });
      } catch (_err) {
        // Non-fatal error
      }
    } else if (assignedRole === 'PATIENT') {
      try {
        await Patient.create({
          userId: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          bloodGroup: user.bloodGroup,
          city: user.city,
        });
      } catch (_err) {
        // Non-fatal error
      }
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({
      success: true,
      token: accessToken,
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// --- Login ---
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      token: accessToken,
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

// --- Silent refresh ---
export async function refresh(req, res) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, error: 'No refresh token' });
    }

    let payload;
    try {
      payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    } catch {
      return res.status(401).json({ success: false, error: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User no longer exists' });
    }

    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);
    setAuthCookies(res, newAccessToken, newRefreshToken);

    return res.status(200).json({ success: true, token: newAccessToken });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

// --- Logout ---
export async function logout(req, res) {
  res.clearCookie('accessToken', baseCookieOptions);
  res.clearCookie('refreshToken', { ...baseCookieOptions, path: '/api/auth/refresh' });
  return res.status(200).json({ success: true });
}
