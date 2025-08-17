const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authMiddleware = require('../middleware/auth');
const router = express.Router();
const jwtExpiry = '7d'; // 7 days expiry

router.post('/register', async (req, res) => {
  try {
    let { firstName, lastName, email, password, role } = req.body;
    if (!firstName || !email || !password || !role) {
      return res.status(400).json({ error: 'All required fields must be filled.' });
    }
    role = role.toLowerCase().trim(); // Ensure role is always lowercase
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ firstName, lastName, email, password: hashedPassword, role });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role, firstName: user.firstName, email: user.email },
      process.env.JWT_SECRET || 'supersecret',
      { expiresIn: jwtExpiry }
    );

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: {
        _id: user._id, // Changed from id to _id
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
    try {
    let { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'All required fields must be filled.' });
    }
    role = role.toLowerCase().trim(); // Ensure role is always lowercase
    const user = await User.findOne({ email, role });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, role: user.role, firstName: user.firstName, email: user.email },
      process.env.JWT_SECRET || 'supersecret',
      { expiresIn: jwtExpiry }
        );

    res.json({
      message: 'Login successful!',
      token,
      user: {
        _id: user._id, // Changed from id to _id
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
    }
});

// Profile route for persistent login
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // req.user is set by authMiddleware if token is valid
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({
      success: true,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        resumeUrl: user.resumeUrl,
        resumePublicId: user.resumePublicId
      }
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// Update profile route
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { firstName, lastName } = req.body;

    // Validate input
    if (!firstName) {
      return res.status(400).json({ error: 'First name is required' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        resumeUrl: updatedUser.resumeUrl
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user info from token
router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.userId).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// PATCH /api/auth/profile
router.patch('/profile', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const update = req.body;
  const user = await User.findByIdAndUpdate(userId, update, { new: true });
  res.json(user);
});

module.exports = router;