const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const dotenv = require("dotenv");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swaggerConfig");
const winston = require("winston");
const expressWinston = require("express-winston");
const passport = require("./config/passport");


// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Security Middlewares
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

// Performance & Logging
app.use(compression());
app.use(morgan("combined"));

// Winston Logging Configuration
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({ format: winston.format.simple() }));
}

// Middleware for structured request logging (Ignoring Swagger Logs)
app.use(
  expressWinston.logger({
    winstonInstance: logger,
    ignoreRoute: function (req, res) {
      return req.url.startsWith("/api-docs"); // Ignore Swagger logs
    },
  })
);

// CORS Configuration
const allowedOrigins = [
  "https://crmore.com",
  "https://app.crmore.com",
  "http://localhost:3000",
  "http://localhost:3001",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Body Parsing
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => logger.info("✅ MongoDB Connected"))
  .catch((err) => logger.error("❌ MongoDB Connection Error:", err));

// Serve Static Files for Frontend
app.use(express.static(path.join(__dirname, "public")));

// Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Default API Response
app.get("/", (req, res) => {
  res.status(200).json({ message: "🚀 Advanced CRM Backend Running!" });
});

// Import Routes
const authRoutes = require("./routes/authRoutes");
const leadRoutes = require("./routes/leadRoutes");
const customerRoutes = require("./routes/customerRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes"); // Import dashboard routes

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes); 
app.use("/api/dashboard", dashboardRoutes); // Add Dashboard API route

// Global Error Handling
app.use((err, req, res, next) => {
  logger.error(`❌ Error: ${err.message}`);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});
app.use(passport.initialize());

// Graceful Shutdown Handling
process.on("SIGINT", async () => {
  logger.info("🔄 Shutting down server...");
  await mongoose.connection.close();
  server.close(() => {
    logger.info("✅ Server shutdown complete.");
    process.exit(0);
  });
});

// Start Server with Proper Shutdown Handling
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📄 Swagger API Documentation: http://localhost:${PORT}/api-docs`);
});
