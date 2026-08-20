// controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, Admin, Staff, Hospital, Donor } from '../models/index.js';

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
    { sub: user._id, email: user.email, role: user.role || 'USER' },
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
    const { username, email, password, DOB, pincode, bloodgroup, gender, name, phone } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ success: false, error: 'Username, email, and password are required' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'Email or Username already in use' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      username,
      email,
      password: passwordHash,
      DOB: DOB ? new Date(DOB) : new Date('2000-01-01'),
      pincode: pincode || '10001',
      bloodgroup: bloodgroup || 'O+',
      gender: gender || 'OTHER',
      name: name || username,
      phone: phone || '+1-555-0100',
      status: 'ACTIVE',
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bloodgroup: user.bloodgroup,
        pincode: user.pincode,
        status: user.status,
      },
      accessToken,
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

    // Check Admin collection first
    const admin = await Admin.findOne({ email }).select('+password');
    if (admin) {
      const isMatch = await admin.comparePassword(password);
      if (isMatch) {
        const accessToken = jwt.sign({ sub: admin._id, email: admin.email, role: 'ADMIN' }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
        const refreshToken = jwt.sign({ sub: admin._id }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES });
        setAuthCookies(res, accessToken, refreshToken);
        return res.status(200).json({
          success: true,
          role: 'ADMIN',
          user: { id: admin._id, username: admin.username, email: admin.email, role: 'ADMIN' },
          accessToken,
        });
      }
    }

    // Check User collection
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if user is also staff
    const staff = await Staff.findOne({ u_id: user._id });

    const role = staff ? staff.role : 'USER';
    const accessToken = signAccessToken({ ...user.toObject(), role });
    const refreshToken = signRefreshToken(user);
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      role,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bloodgroup: user.bloodgroup,
        pincode: user.pincode,
        role,
        staffDetails: staff || null,
      },
      accessToken,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// --- Refresh Token ---
export async function refresh(req, res) {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, error: 'No refresh token provided' });
    }

    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User no longer exists' });
    }

    const staff = await Staff.findOne({ u_id: user._id });
    const role = staff ? staff.role : 'USER';
    const newAccessToken = signAccessToken({ ...user.toObject(), role });
    res.cookie('accessToken', newAccessToken, { ...baseCookieOptions, maxAge: 15 * 60 * 1000 });

    return res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (_err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired refresh token' });
  }
}

// --- Logout ---
export async function logout(_req, res) {
  res.clearCookie('accessToken', baseCookieOptions);
  res.clearCookie('refreshToken', { ...baseCookieOptions, path: '/api/auth/refresh' });
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}

// --- Current User Profile ---
export async function me(req, res) {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const admin = await Admin.findById(userId);
    if (admin) {
      return res.status(200).json({ success: true, role: 'ADMIN', user: admin });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const staff = await Staff.findOne({ u_id: user._id });
    return res.status(200).json({
      success: true,
      role: staff ? staff.role : 'USER',
      user,
      staff: staff || null,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export class AuthController {
  static signup = signup;
  static login = login;
  static refresh = refresh;
  static logout = logout;
  static me = me;
}
