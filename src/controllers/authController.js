const bcrypt = require('bcryptjs');
const db = require('../config/db');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role, phone_number, license_number } = req.body;

  try {
    const userExists = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // SQLite: No RETURNING *, so we insert and then fetch or use lastID
    const result = await db.query(
      'INSERT INTO users (name, email, password_hash, role, phone_number) VALUES (?, ?, ?, ?, ?)',
      [name, email, passwordHash, role, phone_number]
    );

    const userId = result.lastID;
    
    // Fetch the created user
    const newUser = await db.query('SELECT id, name, email, role, phone_number FROM users WHERE id = ?', [userId]);
    const user = newUser.rows[0];

    // If driver, create driver profile
    if (role === 'driver') {
        await db.query(
            'INSERT INTO drivers (user_id, license_number, status) VALUES (?, ?, ?)',
            [user.id, license_number, 'pending']
        );
    }

    // Generate Token
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      ...user,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = result.rows[0];

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Mock Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
    // Mock implementation - always returns success
    const { phone_number, otp } = req.body;
    
    if (otp === '123456') {
        res.status(200).json({ message: 'OTP Verified successfully' });
    } else {
        res.status(400).json({ message: 'Invalid OTP' });
    }
}

module.exports = {
  registerUser,
  loginUser,
  verifyOtp
};
