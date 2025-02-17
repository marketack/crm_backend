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
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new Error("JWT secrets are not defined. Check your environment variables.");
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: loginIdentifier }, { username: loginIdentifier }]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check password if user exists
    if (password && user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    }

    // Generate Access & Refresh Tokens
    const accessToken = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: "15m" });

    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

    // Store Refresh Token in HttpOnly Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // Use `true` in production (requires HTTPS)
      sameSite: "Strict",
    });

    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error during login" });
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



exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken; // Retrieve from HttpOnly cookie

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh Token not found. Please log in again." });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Generate new Access Token
    const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: "15m" });

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    res.status(403).json({ message: "Invalid or expired refresh token. Please log in again." });
  }
};
exports.logout = (req, res) => {
  console.log("🔄 Clearing refreshToken cookie...");

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // ✅ Use HTTPS in production
    sameSite: "Strict",
  });

  console.log("✅ Refresh token cleared!");

  res.status(200).json({ message: "Logged out successfully" });
};
