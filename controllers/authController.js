const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

// Register a new user
exports.register = async (req, res) => {
  const { firstName, lastName, username, email, phoneNumber, password } = req.body;

  // Validate all required fields
  if (!firstName || !lastName || !username || !email || !phoneNumber || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      phoneNumber,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};


// Email verification
exports.verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.otp.code !== otp || user.otp.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isEmailVerified = true;
    user.otp = undefined; // Clear OTP
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during email verification' });
  }
};

exports.login = async (req, res) => {
  const { loginIdentifier, password } = req.body;

  try {
    // Validate environment variables
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new Error("JWT secrets are not defined. Please check your environment variables.");
    }

    // Find user or device by email/username/serialNumber
    const user = await User.findOne({
      $or: [{ email: loginIdentifier }, { username: loginIdentifier }, { serialNumber: loginIdentifier }],
    });

    if (!user) {
      return res.status(404).json({ message: "User or Device not found" });
    }

    // Check password only for human users
    if (password && user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    }

    // Generate JWT
    const accessToken = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username || "device",
        email: user.email || "device@domain.com",
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: error.message || "Server error during login" });
  }
};



// Password reset
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otpCode = crypto.randomBytes(3).toString('hex');
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.otp = { code: otpCode, expiresAt: otpExpires };
    await user.save();

    const emailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Password Reset Code',
      html: `<h3>Reset Your Password</h3>
             <p>Use this code to reset your password:</p>
             <h2>${otpCode}</h2>
             <p>This code expires in 10 minutes.</p>`,
    };

    await sendEmail(emailOptions);

    res.status(200).json({ message: 'Password reset code sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};




// Token Refresh
exports.refreshToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token is required.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Generate a new token
    const newToken = jwt.sign(
      { serialNumber: decoded.serialNumber, deviceId: decoded.deviceId },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({ token: newToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
});