import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Users from '../models/User.js';


const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    return res.status(200).json({
      success: true,
      token: 'mock-jwt-token-lifevault-2026',
      user: { email, role: 'ADMIN' },
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

const signup = async (req, res) => {
  try{
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    return res.status(200).json({
      success: true,
      token: 'mock-jwt-token-lifevault-2026',
      user: { email, role: 'USER' },
    });
  }
  catch(err){

  }
}


export default { login };