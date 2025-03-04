import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import hpp from "hpp"; // Prevent HTTP parameter pollution
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import cmsRoutes from "./routes/cms.routes";
import notificationRoutes from "./routes/notification.routes";
import courseRoutes from "./routes/courses.routes";
import subscriptionRoutes from "./routes/subscription.routes";
import saasRoutes from "./routes/saas.routes";
import userRoutes from "./routes/user.routes";
import compnayRoutes from "./routes/company.routes";


import protectedRoutes from "./routes/protected.routes";
import { verifyJWT } from "./middleware/authMiddleware";
import https from "https";
import fs from "fs";

// Load SSL Certificates
const sslOptions = {
  key: fs.readFileSync("./ssl/server.key"),
  cert: fs.readFileSync("./ssl/server.cert"),
};


// Load environment variabless
dotenv.config();

// Express App
const app = express();

// Security: Rate limiting (100 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "⚠️ Too many requests from this IP, please try again later.",
});

// Middleware
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : ["http://localhost:3000", "https://localhost:3000"],
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Origin,X-Requested-With,Content-Type,Accept,Authorization",
  })
);

app.use(helmet());
app.use(hpp());
app.use(morgan("dev"));
app.use(express.json());
app.use(apiLimiter);

// HTTP Server & WebSocket Setup
const server = https.createServer(sslOptions, app);
const io = new SocketIOServer(server, {
  cors: { origin: process.env.ALLOWED_ORIGINS?.split(",") || "*" },
});

// Store active WebSocket connections
const clients: { [userId: string]: any } = {};

// Handle WebSocket Connections
io.on("connection", (socket) => {
  console.log("🔌 New WebSocket client connected:", socket.id);

  socket.on("authenticate", (userId) => {
    clients[userId] = socket;
    console.log(`✅ WebSocket: User ${userId} authenticated`);
  });

  socket.on("disconnect", () => {
    console.log("❌ WebSocket client disconnected", socket.id);
    Object.keys(clients).forEach((userId) => {
      if (clients[userId] === socket) delete clients[userId];
    });
  });
});

// Swagger Setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CRM API",
      version: "1.0.0",
      description: "CRM Backend API with Authentication & WebSockets",
    },
    servers: [
      {
        url: `http://${process.env.HOST || "localhost"}:${process.env.PORT || 5000}/api`,
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ["./routes/*.ts"],
};

// Generate Swagger Docs
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// ✅ Fix: Ensure Swagger UI is served correctly
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ✅ JSON Route for Debugging
app.get("/api/docs/json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerDocs);
});


// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", verifyJWT, adminRoutes);
app.use("/api/notifications", verifyJWT, notificationRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/saas", saasRoutes);
app.use("/api/user", userRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/company", compnayRoutes);


// Database Connection with Retry Logic
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    setTimeout(connectToDatabase, 5000); // Retry after 5 seconds
  }
};
connectToDatabase();

// Start Server

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running at: https://localhost:${PORT}`);
  console.log(`📖 Swagger API Docs: https://localhost:${PORT}/api/docs`);
  console.log(`📜 Swagger JSON: https://localhost:${PORT}/api/docs/json`);
});

// Function to Send Notifications via WebSocket
export const sendNotification = (userId: string, notification: any) => {
  if (clients[userId]) {
    clients[userId].emit("notification", notification);
  }
};
