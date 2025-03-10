var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createClient } from "redis";
const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});
redisClient.on("error", (err) => console.error("❌ Redis Error:", err));
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield redisClient.connect();
    console.log("✅ Connected to Redis");
}))();
export default redisClient;
