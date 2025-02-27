import redisClient from "../config/redis";

/**
 * 🔄 Store Refresh Token in Redis
 */
export const storeRefreshToken = async (userId: string, token: string) => {
  const key = `refresh_token:${userId}`;
  await redisClient.setEx(key, 60 * 60 * 24 * 7, token); // Expires in 7 days
};

/**
 * 🔍 Verify Refresh Token
 */
export const verifyRefreshToken = async (userId: string, token: string) => {
  const key = `refresh_token:${userId}`;
  const storedToken = await redisClient.get(key);
  return storedToken === token;
};

/**
 * ❌ Revoke Refresh Token
 */
export const revokeRefreshToken = async (userId: string) => {
  const key = `refresh_token:${userId}`;
  await redisClient.del(key);
};
