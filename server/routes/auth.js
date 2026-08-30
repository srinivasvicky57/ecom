const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { generateToken, authMiddleware } = require('../middleware/auth');

// Email transporter (configured once)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_APP_PASSWORD
  }
});

// POST /api/auth/signup — Register new user
router.post('/signup', async (req, res) => {
  try {
    const { name, phone, email, password, dateOfBirth, gender } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user (userId auto-generated, password auto-hashed)
    const user = new User({ name, phone, email, password });
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;
    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login — Login existing user
router.post('/login', async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    // Find user by email or phone
    const user = await User.findOne({
      $or: [{ email: emailOrPhone.toLowerCase() }, { phone: emailOrPhone }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email/phone or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email/phone or password' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/forgot-password — Send OTP to email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    console.log(`[Forgot Password] OTP for ${email}: ${otp}`);

    // Send OTP email
    await transporter.sendMail({
      from: `"MS Vastravarna" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'MS Vastravarna - Password Reset OTP',
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:30px 24px;background:#faf7f2;border-radius:12px">
        <div style="text-align:center;margin-bottom:20px">
          <h2 style="color:#8B1A1A;margin:0 0 4px">MS Vastravarna</h2>
          <p style="color:#6B4F3F;font-size:13px;margin:0">Password Reset Request</p>
        </div>
        <div style="background:#fff;border-radius:8px;padding:24px;text-align:center;border:1px solid #e8ddd0">
          <p style="color:#2D1810;font-size:14px;margin:0 0 16px">Your One-Time Password is:</p>
          <div style="background:linear-gradient(135deg,#8B1A1A,#a02020);border-radius:8px;padding:16px;display:inline-block">
            <span style="font-size:32px;font-weight:700;letter-spacing:10px;color:#fff">${otp}</span>
          </div>
          <p style="color:#6B4F3F;font-size:13px;margin:16px 0 0">This code expires in <b>10 minutes</b></p>
        </div>
        <p style="color:#999;font-size:11px;text-align:center;margin:16px 0 0">If you didn't request this, you can safely ignore this email.</p>
      </div>`
    });

    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/verify-otp — Verify the OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.resetOtp || !user.resetOtpExpiry) {
      return res.status(400).json({ message: 'No OTP request found. Please request a new OTP.' });
    }

    if (new Date() > user.resetOtpExpiry) {
      user.resetOtp = null;
      user.resetOtpExpiry = null;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/reset-password — Reset password after OTP verification
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Re-verify OTP for security
    if (!user.resetOtp || user.resetOtp !== otp || new Date() > user.resetOtpExpiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please start over.' });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now login with your new password.' });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- All routes below require authentication ---

// GET /api/auth/profile — Get current user's profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        addresses: user.addresses || []
      }
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/auth/profile — Update current user's profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, dateOfBirth, gender } = req.body;
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (gender !== undefined) user.gender = gender;

    await user.save();

    res.json({
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// POST /api/auth/addresses — Add new address
router.post('/addresses', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, mobile, pincode, state, address, landmark, district, isDefault } = req.body;

    // If this is default, unset all others
    if (isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }
    // If first address, auto-set as default
    const shouldDefault = isDefault || user.addresses.length === 0;

    user.addresses.push({ name, mobile, pincode, state, address, landmark, district, isDefault: shouldDefault });
    await user.save();

    res.status(201).json({ addresses: user.addresses });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Add address error:', err);
    res.status(500).json({ message: 'Failed to add address' });
  }
});

// PUT /api/auth/addresses/:addressId — Update address
router.put('/addresses/:addressId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const addr = user.addresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ message: 'Address not found' });

    const { name, mobile, pincode, state, address, landmark, district, isDefault } = req.body;

    if (isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }

    addr.name = name;
    addr.mobile = mobile;
    addr.pincode = pincode;
    addr.state = state;
    addr.address = address;
    addr.landmark = landmark;
    addr.district = district;
    addr.isDefault = isDefault || false;

    await user.save();
    res.json({ addresses: user.addresses });
  } catch (err) {
    console.error('Update address error:', err);
    res.status(500).json({ message: 'Failed to update address' });
  }
});

// DELETE /api/auth/addresses/:addressId — Delete address
router.delete('/addresses/:addressId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const addr = user.addresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ message: 'Address not found' });

    const wasDefault = addr.isDefault;
    addr.deleteOne();

    // If deleted address was default and others remain, set first as default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json({ addresses: user.addresses });
  } catch (err) {
    console.error('Delete address error:', err);
    res.status(500).json({ message: 'Failed to delete address' });
  }
});

// GET /api/auth/admin/analytics — Admin analytics (total users, gender distribution)
router.get('/admin/analytics', authMiddleware, async (req, res) => {
  try {
    // Verify admin
    const admin = await User.findOne({ userId: req.user.userId });
    if (!admin || !admin.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const totalUsers = await User.countDocuments();
    const genderCounts = await User.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    // Normalize gender data
    const gender = { Male: 0, Female: 0, Other: 0, 'Not specified': 0 };
    genderCounts.forEach(g => {
      if (g._id === 'Male' || g._id === 'Female' || g._id === 'Other') {
        gender[g._id] = g.count;
      } else {
        gender['Not specified'] += g.count;
      }
    });

    // Active users (active within last 15 minutes)
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);
    const activeUsers = await User.countDocuments({ lastActive: { $gte: fifteenMinAgo } });

    res.json({ totalUsers, activeUsers, gender });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: 'Failed to load analytics' });
  }
});

// GET /api/auth/admin/birthdays — Upcoming customer birthdays
router.get('/admin/birthdays', authMiddleware, async (req, res) => {
  try {
    const admin = await User.findOne({ userId: req.user.userId });
    if (!admin || !admin.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Fetch all users that have a dateOfBirth set
    const users = await User.find(
      { dateOfBirth: { $ne: null } },
      'name phone dateOfBirth userId'
    ).lean();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();

    const enriched = users.map(u => {
      const dob = new Date(u.dateOfBirth);
      // Use UTC month/date from stored DOB to avoid timezone shifts
      const dobMonth = dob.getUTCMonth();
      const dobDate = dob.getUTCDate();
      // Next birthday this year or next year
      let nextBirthday = new Date(currentYear, dobMonth, dobDate);
      nextBirthday.setHours(0, 0, 0, 0);
      if (nextBirthday < today) {
        nextBirthday = new Date(currentYear + 1, dobMonth, dobDate);
        nextBirthday.setHours(0, 0, 0, 0);
      }
      const daysUntil = Math.round((nextBirthday - today) / (1000 * 60 * 60 * 24));
      return {
        userId: u.userId,
        name: u.name,
        phone: u.phone,
        dateOfBirth: u.dateOfBirth,
        daysUntil
      };
    });

    // Sort by closest birthday first
    enriched.sort((a, b) => a.daysUntil - b.daysUntil);

    res.json({ birthdays: enriched });
  } catch (err) {
    console.error('Birthdays error:', err);
    res.status(500).json({ message: 'Failed to load birthdays' });
  }
});

module.exports = router;
