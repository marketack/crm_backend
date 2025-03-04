import { Request, Response, NextFunction } from "express";
import redisClient from "../config/redis";

const WINDOW_TIME = 60 * 15; // 15 minutes
const MAX_ATTEMPTS = 5;

/**
 * 🛑 Rate Limiting Middleware
 */
export const loginRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.headers["x-forwarded-for"];
  const redisKey = `login_attempts:${ip}`;

  const attempts = await redisClient.get(redisKey);
  if (attempts && parseInt(attempts) >= MAX_ATTEMPTS) {
    return res.status(429).json({ message: "Too many login attempts. Try again later." });
  }

  next();
};

/**
 * 🚀 Track Login Attempts in Redis
 */
export const trackLoginAttempt = async (req: Request) => {
  const ip = req.ip || req.headers["x-forwarded-for"];
  const redisKey = `login_attempts:${ip}`;

  await redisClient.incr(redisKey);
  await redisClient.expire(redisKey, WINDOW_TIME);
};

/**
 * ✅ Reset Login Attempts
 */
export const resetLoginAttempts = async (req: Request) => {
  const ip = req.ip || req.headers["x-forwarded-for"];
  const redisKey = `login_attempts:${ip}`;
  await redisClient.del(redisKey);
};
