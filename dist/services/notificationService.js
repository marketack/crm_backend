var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import nodemailer from "nodemailer";
import twilio from "twilio";
import { Server } from "socket.io";
import mongoose, { Schema } from "mongoose";
import dotenv from "dotenv";
dotenv.config(); // ✅ Load environment variables
const NotificationSchema = new Schema({
    userId: { type: String, required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
});
const Notification = mongoose.model("Notification", NotificationSchema);
// ✅ WebSocket Server (Export for `server.ts`)
export let io = null;
export const initWebSocket = (server) => {
    io = new Server(server, {
        cors: { origin: "*" },
    });
    io.on("connection", (socket) => {
        console.log("🔌 New WebSocket connection");
        socket.on("disconnect", () => {
            console.log("🔌 WebSocket disconnected");
        });
    });
    console.log("✅ WebSocket Server Initialized");
};
// ✅ Nodemailer Email Setup
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
// ✅ Twilio SMS Setup
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
/**
 * 📩 Send Email
 */
export const sendEmail = (to, subject, html) => __awaiter(void 0, void 0, void 0, function* () {
    if (!process.env.EMAIL_USER) {
        console.error("❌ Email service is not configured.");
        return;
    }
    try {
        yield transporter.sendMail({
            from: `"No Reply" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log(`📩 Email sent to ${to}`);
    }
    catch (error) {
        console.error("❌ Error sending email:", error);
    }
});
/**
 * 📱 Send SMS
 */
export const sendSMS = (to, message) => __awaiter(void 0, void 0, void 0, function* () {
    if (!process.env.TWILIO_PHONE_NUMBER) {
        console.error("❌ Twilio phone number is missing.");
        return;
    }
    try {
        yield twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to,
        });
        console.log(`📲 SMS sent to ${to}`);
    }
    catch (error) {
        console.error("❌ Error sending SMS:", error);
    }
});
/**
 * 🔔 Create and Send Notification (WebSocket + Save to DB)
 */
export const sendNotification = (userId, type, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Save notification to MongoDB
        const notification = new Notification({ userId, type, message });
        yield notification.save();
        // Emit notification via WebSocket
        if (io) {
            io.emit(`notification:${userId}`, { type, message });
            console.log(`🔔 Notification sent to user ${userId}: ${message}`);
        }
        else {
            console.warn("⚠️ WebSocket is not initialized.");
        }
    }
    catch (error) {
        console.error("❌ Error creating notification:", error);
    }
});
/**
 * 🚀 Send Verification Email with OTP
 */
export const sendVerificationEmail = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const html = `<p>Your verification code is <b>${otp}</b>. It will expire in 5 minutes.</p>`;
    return sendEmail(email, "Verify Your Account", html);
});
/**
 * 🔑 Send Password Reset Email
 */
export const sendPasswordResetEmail = (email, resetLink) => __awaiter(void 0, void 0, void 0, function* () {
    const html = `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`;
    return sendEmail(email, "Reset Your Password", html);
});
/**
 * 📲 Send OTP via SMS
 */
export const sendOTPBySMS = (phone, otp) => __awaiter(void 0, void 0, void 0, function* () {
    return sendSMS(phone, `Your verification code is ${otp}. It will expire in 5 minutes.`);
});
/**
 * 🚨 Send Admin Alert for Suspicious Login
 */
export const sendAdminAlert = (adminEmail, userId, location) => __awaiter(void 0, void 0, void 0, function* () {
    const html = `<p>🚨 Suspicious login detected for user ID <b>${userId}</b> from <b>${location}</b>.</p>`;
    return sendEmail(adminEmail, "⚠️ Security Alert: Suspicious Login", html);
});
