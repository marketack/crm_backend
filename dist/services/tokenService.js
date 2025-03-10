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
/**
 * 🔄 Store Refresh Token in Redis
 */
export const storeRefreshToken = (userId, token) => __awaiter(void 0, void 0, void 0, function* () {
    const key = `refresh_token:${userId}`;
    yield redisClient.setEx(key, 60 * 60 * 24 * 7, token); // Expires in 7 days
});
/**
 * 🔍 Verify Refresh Token
 */
export const verifyRefreshToken = (userId, token) => __awaiter(void 0, void 0, void 0, function* () {
    const key = `refresh_token:${userId}`;
    const storedToken = yield redisClient.get(key);
    return storedToken === token;
});
/**
 * ❌ Revoke Refresh Token
 */
export const revokeRefreshToken = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const key = `refresh_token:${userId}`;
    yield redisClient.del(key);
});
