var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import redisClient from "../config/redis";
const WINDOW_TIME = 60 * 15; // 15 minutes
const MAX_ATTEMPTS = 5;
/**
 * 🛑 Rate Limiting Middleware
 */
export const loginRateLimiter = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const ip = req.ip || req.headers["x-forwarded-for"];
    const redisKey = `login_attempts:${ip}`;
    const attempts = yield redisClient.get(redisKey);
    if (attempts && parseInt(attempts) >= MAX_ATTEMPTS) {
        return res.status(429).json({ message: "Too many login attempts. Try again later." });
    }
    next();
});
/**
 * 🚀 Track Login Attempts in Redis
 */
export const trackLoginAttempt = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const ip = req.ip || req.headers["x-forwarded-for"];
    const redisKey = `login_attempts:${ip}`;
    yield redisClient.incr(redisKey);
    yield redisClient.expire(redisKey, WINDOW_TIME);
});
/**
 * ✅ Reset Login Attempts
 */
export const resetLoginAttempts = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const ip = req.ip || req.headers["x-forwarded-for"];
    const redisKey = `login_attempts:${ip}`;
    yield redisClient.del(redisKey);
});
