import mongoose from "mongoose";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

const connectPostgreSQL = async () => {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: parseInt(process.env.PG_PORT as string, 10),
  });

  try {
    await pool.query("SELECT NOW()");
    console.log("✅ PostgreSQL Connected");
  } catch (error) {
    console.error("❌ PostgreSQL Connection Error:", error);
    process.exit(1);
  }

  return pool;
};

export { connectMongoDB, connectPostgreSQL };
