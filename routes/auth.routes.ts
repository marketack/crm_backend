import express from "express";
import asyncHandler from "express-async-handler"; // Handles async errors
import { 
  registerUser, verifyEmail, loginUser, refreshToken, logoutUser 
} from "../controllers/auth.controller";
import { verifyJWT } from "../middleware/authMiddleware";

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization
 */

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with email and phone OTP verification.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully. Please verify your email & phone.
 */
router.post("/register", asyncHandler(async (req, res) => {
    await registerUser(req, res);
  }));
/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verify email OTP
 *     description: Allows a user to verify their email using OTP.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully.
 */
router.post("/verify-email", asyncHandler(async (req, res) => {
    await verifyEmail(req, res);
  }));
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email and password.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful.
 */
router.post("/login", asyncHandler(async (req, res) => {
    await loginUser(req, res);
}));
/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Refresh the JWT token using a refresh token.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully.
 */
router.post("/refresh-token", asyncHandler(async (req, res) => {
    await refreshToken(req, res);
  }));
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Logs out the user and revokes the JWT token.
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully.
 */
router.post("/logout", verifyJWT,asyncHandler(async (req, res, next) => {
    await logoutUser(req, res, next);
}));

export default router;
