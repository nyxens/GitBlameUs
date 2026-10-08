// controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, Admin, Staff, Hospital, Donor } from '../models/index.js';
import { sendVerificationOtpEmail, sendPasswordResetOtpEmail } from './emailController.js';

const SALT_ROUNDS = 12;
const getAccessTokenSecret = () =>
  process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'super-secret-lifevault-access-key-2026';
const getRefreshTokenSecret = () =>
  process.env.REFRESH_TOKEN_SECRET || process.env.JWT_REFRESH_SECRET || 'super-secret-lifevault-refresh-key-2026';
const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';
const isProd = process.env.NODE_ENV === 'production';

const baseCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/',
};

const otpStorage = new Map();
const passwordResetOtpStorage = new Map();

function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id || user.id, id: user._id || user.id, email: user.email, role: user.role || 'USER' },
    getAccessTokenSecret(),
    { expiresIn: ACCESS_TOKEN_EXPIRES }
  );
}

function signRefreshToken(user) {
  return jwt.sign({ sub: user._id || user.id, id: user._id || user.id }, getRefreshTokenSecret(), {
    expiresIn: REFRESH_TOKEN_EXPIRES,
  });
}

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('accessToken', accessToken, {
    ...baseCookieOptions,
    maxAge: 15 * 60 * 1000,
    path: '/',
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

    // Send OTP via email (falls back to the development console when SMTP is unavailable)
    await sendVerificationOtpEmail(email, otp);

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
        const accessToken = signAccessToken({ ...admin.toObject(), role: 'ADMIN' });
        const refreshToken = signRefreshToken(admin);
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
        phone: user.phone,
        bloodgroup: user.bloodgroup,
        gender: user.gender,
        pincode: user.pincode,
        DOB: user.DOB,
        emergencyContactName: user.emergencyContactName,
        emergencyContactPhone: user.emergencyContactPhone,
        emergencyContactRelation: user.emergencyContactRelation,
        medicalConditions: user.medicalConditions,
        donationPrecautions: user.donationPrecautions,
        isAvailableForDonation: user.isAvailableForDonation !== undefined ? user.isAvailableForDonation : true,
        privacyShowOnRegistry: user.privacyShowOnRegistry !== undefined ? user.privacyShowOnRegistry : true,
        privacyAllowNearbyContact: user.privacyAllowNearbyContact !== undefined ? user.privacyAllowNearbyContact : true,
        privacyMaskPhone: user.privacyMaskPhone !== undefined ? user.privacyMaskPhone : false,
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
    const token = req.cookies?.refreshToken || req.body?.refreshToken || req.headers?.['x-refresh-token'];
    if (!token) {
      return res.status(401).json({ success: false, error: 'No refresh token provided' });
    }

    const decoded = jwt.verify(token, getRefreshTokenSecret());
    const userId = decoded.sub;

    const admin = await Admin.findById(userId);
    if (admin) {
      const newAccessToken = signAccessToken({ ...admin.toObject(), role: 'ADMIN' });
      res.cookie('accessToken', newAccessToken, { ...baseCookieOptions, maxAge: 15 * 60 * 1000, path: '/' });
      res.setHeader('x-access-token', newAccessToken);
      return res.status(200).json({ success: true, accessToken: newAccessToken, token: newAccessToken, role: 'ADMIN' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User no longer exists' });
    }

    const staff = await Staff.findOne({ u_id: user._id });
    const role = staff ? staff.role : (user.role || 'USER');
    const newAccessToken = signAccessToken({ ...user.toObject(), role });
    res.cookie('accessToken', newAccessToken, { ...baseCookieOptions, maxAge: 15 * 60 * 1000, path: '/' });
    res.setHeader('x-access-token', newAccessToken);

    return res.status(200).json({ success: true, accessToken: newAccessToken, token: newAccessToken, role });
  } catch (_err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired refresh token' });
  }
}

// --- Logout ---
export async function logout(_req, res) {
  res.clearCookie('accessToken', { ...baseCookieOptions, path: '/' });
  res.clearCookie('refreshToken', { ...baseCookieOptions, path: '/' });
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}

// --- Current User Profile ---
export async function me(req, res) {
  try {
    const userId = req.user?.sub || req.user?.id || req.user?._id;
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

// --- Update Current User Profile ---
export async function updateProfile(req, res) {
  try {
    const userId = req.user?.sub || req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized. User ID required.' });
    }

    const {
      name,
      phone,
      bloodgroup,
      gender,
      pincode,
      DOB,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      medicalConditions,
      donationPrecautions,
      isAvailableForDonation,
      privacyShowOnRegistry,
      privacyAllowNearbyContact,
      privacyMaskPhone,
      password,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (bloodgroup !== undefined) user.bloodgroup = bloodgroup;
    if (gender !== undefined) user.gender = gender;
    if (pincode !== undefined) user.pincode = pincode;
    if (DOB !== undefined && DOB) user.DOB = new Date(DOB);
    if (emergencyContactName !== undefined) user.emergencyContactName = emergencyContactName;
    if (emergencyContactPhone !== undefined) user.emergencyContactPhone = emergencyContactPhone;
    if (emergencyContactRelation !== undefined) user.emergencyContactRelation = emergencyContactRelation;
    if (medicalConditions !== undefined) user.medicalConditions = medicalConditions;
    if (donationPrecautions !== undefined) user.donationPrecautions = donationPrecautions;
    if (isAvailableForDonation !== undefined) user.isAvailableForDonation = Boolean(isAvailableForDonation);
    if (privacyShowOnRegistry !== undefined) user.privacyShowOnRegistry = Boolean(privacyShowOnRegistry);
    if (privacyAllowNearbyContact !== undefined) user.privacyAllowNearbyContact = Boolean(privacyAllowNearbyContact);
    if (privacyMaskPhone !== undefined) user.privacyMaskPhone = Boolean(privacyMaskPhone);

    if (password && password.trim().length >= 6) {
      user.password = await bcrypt.hash(password.trim(), SALT_ROUNDS);
    }

    await user.save();

    const staff = await Staff.findOne({ u_id: user._id });
    const role = staff ? staff.role : (user.role || 'USER');

    const updatedUser = {
      id: user._id,
      _id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      bloodgroup: user.bloodgroup,
      gender: user.gender,
      pincode: user.pincode,
      DOB: user.DOB,
      emergencyContactName: user.emergencyContactName,
      emergencyContactPhone: user.emergencyContactPhone,
      emergencyContactRelation: user.emergencyContactRelation,
      medicalConditions: user.medicalConditions,
      donationPrecautions: user.donationPrecautions,
      isAvailableForDonation: user.isAvailableForDonation,
      privacyShowOnRegistry: user.privacyShowOnRegistry,
      privacyAllowNearbyContact: user.privacyAllowNearbyContact,
      privacyMaskPhone: user.privacyMaskPhone,
      role,
      status: user.status,
      createdAt: user.createdAt,
    };

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
      role,
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

// --- Forgot Password (Send OTP to verify user identity) ---
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, error: 'Email address is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user or admin exists
    const user = await User.findOne({ email: normalizedEmail });
    const admin = !user ? await Admin.findOne({ email: normalizedEmail }) : null;

    if (!user && !admin) {
      return res.status(404).json({
        success: false,
        error: 'No account found with this email address. Please check your email or register.',
      });
    }

    if (user && user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        error: 'This account is suspended. Please contact support.',
      });
    }

    // Generate a 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in-memory with a 10-minute expiration
    passwordResetOtpStorage.set(normalizedEmail, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0,
      verified: false,
    });

    // Send OTP via email (falls back to the development console when SMTP is unavailable)
    await sendPasswordResetOtpEmail(normalizedEmail, otp);

    return res.status(200).json({
      success: true,
      message: 'Password reset verification code sent to your email',
      email: normalizedEmail,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// --- Verify Password Reset OTP ---
export async function verifyResetOTP(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and verification OTP are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const entry = passwordResetOtpStorage.get(normalizedEmail);

    if (!entry) {
      return res.status(400).json({
        success: false,
        error: 'No password reset request found for this email. Please request a new code.',
      });
    }

    if (entry.expiresAt < Date.now()) {
      passwordResetOtpStorage.delete(normalizedEmail);
      return res.status(400).json({
        success: false,
        error: 'Verification code has expired. Please request a new one.',
      });
    }

    if (entry.otp !== String(otp).trim()) {
      entry.attempts = (entry.attempts || 0) + 1;
      if (entry.attempts >= 5) {
        passwordResetOtpStorage.delete(normalizedEmail);
        return res.status(400).json({
          success: false,
          error: 'Too many incorrect attempts. Please request a new verification code.',
        });
      }
      return res.status(400).json({ success: false, error: 'Invalid verification code' });
    }

    // Mark as verified and issue a short-lived reset token (15 mins)
    const resetToken = jwt.sign(
      { email: normalizedEmail, purpose: 'PASSWORD_RESET' },
      getAccessTokenSecret(),
      { expiresIn: '15m' }
    );

    entry.verified = true;
    entry.resetToken = resetToken;

    return res.status(200).json({
      success: true,
      message: 'Identity verified successfully',
      resetToken,
      email: normalizedEmail,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// --- Reset Password ---
export async function resetPassword(req, res) {
  try {
    const { email, resetToken, otp, newPassword, password } = req.body;
    const pwd = newPassword || password;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email address is required' });
    }

    if (!pwd || typeof pwd !== 'string' || pwd.trim().length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let isAuthorized = false;

    // Verify authorization via resetToken or via valid OTP entry
    if (resetToken) {
      try {
        const decoded = jwt.verify(resetToken, getAccessTokenSecret());
        if (decoded.email === normalizedEmail && decoded.purpose === 'PASSWORD_RESET') {
          isAuthorized = true;
        }
      } catch (_tokenErr) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired password reset session. Please verify your OTP again.',
        });
      }
    } else if (otp) {
      const entry = passwordResetOtpStorage.get(normalizedEmail);
      if (entry && entry.otp === String(otp).trim() && entry.expiresAt >= Date.now()) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(401).json({
        success: false,
        error: 'Verification required before resetting password. Please verify the OTP sent to your email.',
      });
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(pwd.trim(), SALT_ROUNDS);
    let updated = false;

    const user = await User.findOne({ email: normalizedEmail });
    if (user) {
      user.password = passwordHash;
      await user.save();
      updated = true;
    } else {
      const admin = await Admin.findOne({ email: normalizedEmail });
      if (admin) {
        admin.password = passwordHash;
        await admin.save();
        updated = true;
      }
    }

    if (!updated) {
      return res.status(404).json({ success: false, error: 'User account not found' });
    }

    // Clean up reset storage
    passwordResetOtpStorage.delete(normalizedEmail);

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
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
  static updateProfile = updateProfile;
  static forgotPassword = forgotPassword;
  static verifyResetOTP = verifyResetOTP;
  static resetPassword = resetPassword;
}
