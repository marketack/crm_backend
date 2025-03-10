import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import User from "../models/user.model";
import redisClient from "../config/redis";
import jwt, { JwtPayload } from "jsonwebtoken";

// ✅ Ensure JWT Secrets are Set
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!JWT_SECRET || !REFRESH_TOKEN_SECRET) {
  console.error("❌ ERROR: JWT_SECRET or REFRESH_TOKEN_SECRET is missing!");
  process.exit(1);
}

const TOKEN_EXPIRY = "1h";
const REFRESH_EXPIRY = "7d";

/**
 * 🚀 Register User (With Secure Password Handling)
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;
    console.log("🔍 Checking if user exists:", email);

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // ✅ Create User (Password is hashed in the schema pre-save middleware)
    console.log("🔍 Creating User...");
    const user = new User({ name, email, password, phone, emailVerified: false, phoneVerified: false });

    await user.save();
    console.log("✅ User Registered:", email);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("🔥 Registration Error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

/**
 * 📧 Verify Email with OTP
 */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const storedOTP = await redisClient.get(`email_otp:${email}`);

    if (!storedOTP || storedOTP !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    const user = await User.findOneAndUpdate({ email }, { emailVerified: true }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found." });

    await redisClient.del(`email_otp:${email}`);
    res.json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * 🔑 Login User (Secure Authentication)
 */
/**
 * 🔑 Login User (Secure Authentication)
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password, keepMeSignedIn } = req.body;
    console.log("🔍 Login Attempt:", email);

    // ✅ Find user in DB
    const user = await User.findOne({ email }).populate<{ role: { _id: string; name: string } }>("role", "name");
    if (!user) {
      console.log("❌ User Not Found:", email);
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // ✅ Validate Password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("❌ Incorrect Password for:", email);
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // ✅ Get user role
    const userRole = user.role && typeof user.role === "object" && "name" in user.role ? user.role.name : "customer";

    // ✅ Generate Access & Refresh Tokens
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email, role: userRole },
      JWT_SECRET!,
      { expiresIn: "2d" }
    );
    const refreshToken = jwt.sign(
      { userId: user._id },
      REFRESH_TOKEN_SECRET!,
      { expiresIn: "30d" }
    );

    // ✅ Store refresh token in HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: keepMeSignedIn ? 30 * 24 * 60 * 60 * 1000 : undefined, // 30 days if checked
    });

    console.log("✅ Login Successful:", email);

    // ✅ Send refreshToken in response body (IMPORTANT FIX)
    res.status(200).json({
      message: "Login successful",
      token: accessToken,
      refreshToken, // ✅ Added refresh token in response
      user: { id: user._id, email: user.email, role: userRole },
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

    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid refresh token." });

      const userId = (decoded as { userId: string }).userId;
      const newAccessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

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
    const token = req.headers.authorization?.split(" ")[1]; // Get Access Token
    if (!token) {
      res.status(400).json({ message: "Token required" });
      return;
    }

    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      await redisClient.setEx(`blacklist_${decoded.userId}_${token}`, 86400, "blacklisted");
    } catch (error) {
      console.warn("⚠️ Token is already expired or invalid.");
    }

    // ✅ Clear refresh token from cookies
    res.clearCookie("refreshToken");

    console.log("✅ User logged out successfully");
    res.status(200).json({ message: "Logout successful. Token revoked." });
  } catch (error) {
    console.error("🔥 Logout error:", error);
    next(error);
  }
};
