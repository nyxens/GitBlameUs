export class AuthController {
  static async login(req, res) {
    try {
      const { email } = req.body;
      return res.status(200).json({
        success: true,
        token: 'mock-jwt-token-lifevault-2026',
        user: { email, role: 'ADMIN' },
      });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }
}
