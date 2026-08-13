import { User } from '../models/index.js';

export async function login(req, res) {
  try {
    const { email } = req.body;
    let user = null;
    if (email) {
      user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          name: email ? email.split('@')[0] : 'User',
          email,
          role: 'ADMIN',
        });
      }
    }
    return res.status(200).json({
      success: true,
      token: 'mock-jwt-token-lifevault-2026',
      user: user || { email, role: 'ADMIN' },
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export class AuthController {
  static login = login;
}

