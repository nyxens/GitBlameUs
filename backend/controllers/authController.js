import { User } from '../models/index.js';

export class AuthController {
  static async login(req, res) {
    try {
      const { email } = req.body;
      let user = null;
      if (email) {
        user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            name: email.split('@')[0],
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
}

