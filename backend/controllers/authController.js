import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getConfig } from '../config/env.js';

/**
 * Handles new user registration based on User model schema.
 * Returns newly created user details with access and refresh tokens.
 */
export async function signup(req, res) {
  try {
    const { name, email, password, phone, bloodGroup, pincode, dob, gender } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required for registration',
      });
    }

    // Hash user password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: `USER-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name || 'User',
      email,
      phone: phone || '',
      bloodGroup: bloodGroup || 'O+',
      pincode: pincode || '',
      dob: dob || '',
      gender: gender || 'UNSPECIFIED',
      status: 'ACTIVE',
    };

    const { jwtSecret, jwtRefreshSecret } = getConfig();

    const accessToken = jwt.sign(
      { id: newUser.id, email: newUser.email, role: 'USER' },
      jwtSecret,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: newUser.id, email: newUser.email, role: 'USER', tokenType: 'refresh' },
      jwtRefreshSecret,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      accessToken,
      refreshToken,
      user: newUser,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const { jwtSecret, jwtRefreshSecret } = getConfig();

    const accessToken = jwt.sign(
      { email, role: 'USER' },
      jwtSecret,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { email, role: 'USER', tokenType: 'refresh' },
      jwtRefreshSecret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        email,
        role: 'USER',
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Handles token refresh requests to issue a new access token.
 */
export async function refreshToken(req, res) {
  try {
    const token = req.body.refreshToken || req.headers['x-refresh-token'];

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required',
      });
    }

    const { jwtSecret, jwtRefreshSecret } = getConfig();
    const decoded = jwt.verify(token, jwtRefreshSecret);

    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role || 'USER' },
      jwtSecret,
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role || 'USER', tokenType: 'refresh' },
      jwtRefreshSecret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired refresh token',
    });
  }
}

export default { signup, login, refreshToken };