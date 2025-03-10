var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
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
import dashboardRoutes from "./routes/dashboard.routes";
import departmentRoutes from "./routes/department.routes";
import employeeRoutes from "./routes/employee.routes";
import leadRoutes from "./routes/lead.routes";
import dealRoutes from "./routes/deal.routes";
import taskRoutes from "./routes/task.routes";
import projectRoutes from "./routes/project.routes";
import invoiceRoutes from "./routes/invoice.routes";
import transactionRoutes from "./routes/transaction.routes";
import fileRoutes from "./routes/file.routes";
import commentRoutes from "./routes/comment.routes";
import logsRoutes from "./routes/logs.routes";
import ticketRoutes from "./routes/ticket.routes";
import feedbackRoutes from "./routes/feedback.routes";
import contactsRoutes from "./routes/contacts.routes";
import badgesRoutes from "./routes/badges.routes";
import { verifyJWT } from "./middleware/authMiddleware";
// Load environment variables
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
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",")
        : ["http://localhost:3000"],
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Origin,X-Requested-With,Content-Type,Accept,Authorization",
}));
app.use(helmet());
app.use(hpp());
app.use(morgan("dev"));
app.use(express.json());
app.use(apiLimiter);
// HTTP Server & WebSocket Setup
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: { origin: ((_a = process.env.ALLOWED_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(",")) || "*" },
});
// Store active WebSocket connections
const clients = {};
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
            if (clients[userId] === socket)
                delete clients[userId];
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
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/badges", badgesRoutes);
// Database Connection with Retry Logic
const connectToDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");
    }
    catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        setTimeout(connectToDatabase, 5000); // Retry after 5 seconds
    }
});
connectToDatabase();
// Start Server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Server running at: http://localhost:${PORT}`);
    console.log(`📖 Swagger API Docs: http://localhost:${PORT}/api/docs`);
    console.log(`📜 Swagger JSON: http://localhost:${PORT}/api/docs/json`);
});
// Function to Send Notifications via WebSocket
export const sendNotification = (userId, notification) => {
    if (clients[userId]) {
        clients[userId].emit("notification", notification);
    }
};
