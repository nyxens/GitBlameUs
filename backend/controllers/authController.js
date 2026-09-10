// controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
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

function getTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const otpStorage = new Map();

function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id || user.id, email: user.email, role: user.role || 'USER' },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES }
  );
}

function signRefreshToken(user) {
  return jwt.sign({ sub: user._id || user.id }, REFRESH_TOKEN_SECRET, {
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
    path: '/',
  });
}

// --- Signup (Request OTP) ---
export async function signup(req, res) {
  try {
    const { username, email, password, DOB, pincode, bloodgroup, bloodGroup, gender, name, phone, hospitalName, licenseId, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const computedUsername = username || email.split('@')[0];

    const existingUser = await User.findOne({ $or: [{ email }, { username: computedUsername }] });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'Email or Username already in use' });
    }

    // Generate a 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store temporarily in-memory with a 5-minute expiration
    otpStorage.set(email, {
      signupData: {
        ...req.body,
        username: computedUsername,
        bloodgroup: bloodgroup || bloodGroup || 'O+',
      },
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    // Send OTP via email or fallback to development console
    const transporter = getTransporter();
    if (transporter) {
      try {
        const emailHtml = `
          <div style="background-color: #0a0a0a; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; text-align: center; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid rgba(239, 68, 68, 0.2);">
            <div style="margin-bottom: 24px;">
              <span style="font-size: 28px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">
                Life<span style="font-style: italic; color: #a855f7;">Vault</span>
              </span>
            </div>
            <div style="background-color: #121212; border: 1px solid #262626; border-radius: 20px; padding: 32px; margin-bottom: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
              <h2 style="font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 12px; color: #ffffff;">Verify Your Email Address</h2>
              <p style="font-size: 14px; color: #a3a3a3; line-height: 1.5; margin-bottom: 32px;">Thank you for registering with LifeVault. Use the verification code below to complete your sign-up process. This code is valid for 5 minutes.</p>
              <div style="background-color: #171717; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 12px; padding: 16px 24px; display: inline-block; margin-bottom: 32px;">
                <span style="font-size: 36px; font-weight: 800; font-family: monospace; letter-spacing: 6px; color: #ef4444; text-shadow: 0 0 10px rgba(239, 68, 68, 0.2);">${otp}</span>
              </div>
              <p style="font-size: 12px; color: #737373; margin-bottom: 0; line-height: 1.5;">If you did not request this code, you can safely ignore this email.</p>
            </div>
            <div style="font-size: 11px; color: #525252;">
              &copy; 2026 LifeVault Emergency Response Network. All rights reserved.
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"LifeVault BBMS" <${process.env.SMTP_USER || 'no-reply@lifevault.org'}>`,
          to: email,
          subject: 'LifeVault Email Verification Code',
          text: `Your LifeVault verification code is: ${otp}. It will expire in 5 minutes.`,
          html: emailHtml,
        });
        console.log(`[SMTP] Verification email sent successfully to ${email}`);
      } catch (mailErr) {
        console.warn('[SMTP Warning] Failed to send email via SMTP:', mailErr.message);
        console.log(`\n--------------------------------------------------`);
        console.log(`🔑  [DEVELOPMENT MODE] Verification OTP for ${email}: ${otp}`);
        console.log(`--------------------------------------------------\n`);
      }
    } else {
      console.log(`\n--------------------------------------------------`);
      console.log(`🔑  [DEVELOPMENT MODE] (SMTP credentials not configured in backend/.env)`);
      console.log(`🔑  Verification OTP for ${email}: ${otp}`);
      console.log(`--------------------------------------------------\n`);
    }

    return res.status(200).json({
      success: true,
      message: 'Verification OTP sent to email',
      email,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// --- Verify OTP & Complete Signup ---
export async function verifyOTP(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP are required' });
    }

    const entry = otpStorage.get(email);
    if (!entry) {
      return res.status(400).json({ success: false, error: 'No verification request found for this email' });
    }

    if (entry.expiresAt < Date.now()) {
      otpStorage.delete(email);
      return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new one.' });
    }

    if (entry.otp !== otp) {
      return res.status(400).json({ success: false, error: 'Invalid verification OTP' });
    }

    // OTP is valid, perform registration
    const {
      username,
      password,
      DOB,
      pincode,
      bloodgroup,
      gender,
      name,
      phone,
      role,
      hospitalName,
      licenseId,
      city,
    } = entry.signupData;

    const computedUsername = username || email.split('@')[0];

    // Check again in case another user registered the email in the meantime
    const existingUser = await User.findOne({ $or: [{ email }, { username: computedUsername }] });
    if (existingUser) {
      otpStorage.delete(email);
      return res.status(409).json({ success: false, error: 'Email or Username already in use' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const assignedRole = role || (hospitalName || licenseId ? 'HOSPITAL' : 'DONOR');

    const user = await User.create({
      username: computedUsername,
      email,
      password: passwordHash,
      DOB: DOB ? new Date(DOB) : new Date('2000-01-01'),
      pincode: pincode || '10001',
      bloodgroup: bloodgroup || 'O+',
      gender: gender || 'OTHER',
      name: name || hospitalName || computedUsername,
      phone: phone || '+1-555-0100',
      role: assignedRole,
      status: 'ACTIVE',
    });

    // Create Hospital domain record if hospital signup
    if (assignedRole === 'HOSPITAL' || hospitalName) {
      try {
        await Hospital.create({
          hos_name: hospitalName || user.name,
          pincode: pincode || '10001',
          email: user.email,
          phone: user.phone,
        });
      } catch (_err) {
        // Non-fatal domain record creation error
      }
    }

    // Clean up temporary OTP storage
    otpStorage.delete(email);

    // Sign Access & Refresh Tokens
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      accessToken,
      token: accessToken,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        bloodgroup: user.bloodgroup,
        pincode: user.pincode,
        role: user.role,
        status: user.status,
      },
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
          accessToken,
          token: accessToken,
          user: { id: admin._id, username: admin.username, email: admin.email, role: 'ADMIN' },
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

    const role = staff ? staff.role : (user.role || 'USER');
    const accessToken = signAccessToken({ ...user.toObject(), role });
    const refreshToken = signRefreshToken(user);
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      role,
      accessToken,
      token: accessToken,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        bloodgroup: user.bloodgroup,
        pincode: user.pincode,
        role,
        staffDetails: staff || null,
      },
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
    const role = staff ? staff.role : (user.role || 'USER');
    const newAccessToken = signAccessToken({ ...user.toObject(), role });
    res.cookie('accessToken', newAccessToken, { ...baseCookieOptions, maxAge: 15 * 60 * 1000 });

    return res.status(200).json({ success: true, accessToken: newAccessToken, token: newAccessToken });
  } catch (_err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired refresh token' });
  }
}

// --- Logout ---
export async function logout(_req, res) {
  res.clearCookie('accessToken', baseCookieOptions);
  res.clearCookie('refreshToken', { ...baseCookieOptions, path: '/' });
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
      role: staff ? staff.role : (user.role || 'USER'),
      user,
      staff: staff || null,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export class AuthController {
  static signup = signup;
  static verifyOTP = verifyOTP;
  static login = login;
  static refresh = refresh;
  static logout = logout;
  static me = me;
}
