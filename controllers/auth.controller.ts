import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import User from "../models/user.model";
import Role from "../models/role.model";
import Company from "../models/company.model"; // Import Company model
import { sendEmail, sendSMS } from "../services/notificationService";
import redisClient from "../config/redis";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;
const TOKEN_EXPIRY = "1h";
const REFRESH_EXPIRY = "7d";
const OTP_EXPIRY = 300; // 5 minutes

/**
 * 🚀 Dynamic User Registration (Staff & Customers)
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    console.log("🔍 Checking if user exists:", email);

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // ✅ Create User
    const user = await User.create({
      name,
      email,
      password,
      phone,
      emailVerified: false,
      phoneVerified: false,
    });

    console.log("✅ User Registered:", { email });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("🔥 Registration Error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

/**
 * 📧 Verify Email
 */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const storedOTP = await redisClient.get(`email_otp:${email}`);

    if (!storedOTP || storedOTP !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { emailVerified: true },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found." });

    await redisClient.del(`email_otp:${email}`);

    res.json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log("🔍 Login Request:", { email });

    // ✅ Find user
    const user = await User.findOne({ email }).populate("roles");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    console.log("✅ User found:", user.email);

    // ✅ Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    console.log("✅ Password is correct");

    // ✅ Extract roles
    const userRoles = user.roles.map((role: any) => role.name);

    // ✅ Generate JWT Token with roles
    const token = jwt.sign({ userId: user._id, email: user.email, roles: userRoles }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    console.log("✅ Login successful:", email);

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email, roles: userRoles },
    });
  } catch (error) {
    console.error("🔥 Login error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};




/**
 * 🔄 Refresh JWT Token
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(403).json({ message: "Refresh token required." });

    jwt.verify(refreshToken, REFRESH_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid refresh token." });

      const userId = (decoded as { userId: string }).userId;

      const newAccessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });

      res.json({ message: "Token refreshed", accessToken: newAccessToken });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};



/**
 * 🔐 Logout: Revoke Token & Blacklist Access Token
 */
export const logoutUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(400).json({ message: "Token required" });
      return;
    }

    // 🔥 Store token in blacklist for 24 hours
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    await redisClient.setEx(`blacklist_${decoded.userId}_${token}`, 86400, "blacklisted");

    // ❌ Remove refresh token from Redis
    await redisClient.del(`refresh_token:${req.user.userId}`);

    res.status(200).json({ message: "Logout successful. Token revoked." });
  } catch (error) {
    next(error); // ✅ Pass the error to Express error handler
  }
};
