var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import asyncHandler from "express-async-handler"; // Handles async errors
import { registerUser, verifyEmail, loginUser, refreshToken, logoutUser } from "../controllers/auth.controller";
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
router.post("/register", asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield registerUser(req, res);
})));
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
router.post("/verify-email", asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield verifyEmail(req, res);
})));
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
router.post("/login", asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield loginUser(req, res);
})));
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
router.post("/refresh-token", asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield refreshToken(req, res);
})));
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
router.post("/logout", verifyJWT, asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield logoutUser(req, res, next);
})));
export default router;
