// ✅ Required Dependencies
const express = require("express");
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

// ✅ Load environment variables
dotenv.config();

// ✅ Initialize Express app
const app = express();
app.set('trust proxy', 1);

// ✅ Setup Logging with Winston
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
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
      level: "info",
    })
  );
}

// ✅ Security Middleware (Prevent attacks & enhance security)
app.use(helmet()); // Secure HTTP headers
app.use(xss()); // Prevent XSS attacks
app.use(mongoSanitize()); // Prevent NoSQL injection attacks

// ✅ Performance & Logging
app.use(compression()); // Compress responses for better performance
app.use(morgan("combined")); // Log HTTP requests




// ✅ Handle CORS Preflight Requests
app.options("*", (req, res) => {
  res.set({
    "Access-Control-Allow-Origin": req.headers.origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  });
  res.status(204).send();
});



// ✅ Middleware for request parsing & cookies
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Rate Limiting (Prevent API abuse)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit requests per window
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// ✅ MongoDB Connection with Auto-Retry
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info("✅ MongoDB Connected");
  } catch (error) {
    logger.error(`❌ MongoDB Connection Error: ${error.message}`);
    setTimeout(connectDB, 5000); // Retry after 5 seconds
  }
};
connectDB();

// ✅ Serve Static Files for Frontend
app.use(express.static(path.join(__dirname, "public")));

// ✅ Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ✅ Default API Response
app.get("/", (req, res) => {
  res.status(200).json({ message: "🚀 Advanced CRM Backend Running!" });
});

// ✅ Import & Use Routes
const authRoutes = require("./routes/authRoutes");
const leadRoutes = require("./routes/leadRoutes");
const customerRoutes = require("./routes/customerRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const taskRoutes = require("./routes/taskRoutes");
const staffRoutes = require("./routes/staffRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/staff", staffRoutes);

// ✅ Global Error Handling (Improved)
app.use((err, req, res, next) => {
  logger.error(`❌ Error: ${err.message}`, { stack: err.stack });
  
  // Handle CORS errors properly
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "CORS Policy Blocked Request" });
  }

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

app.use(passport.initialize());

// ✅ Graceful Shutdown Handling
process.on("SIGINT", async () => {
  logger.info("🔄 Shutting down server...");
  await mongoose.connection.close();
  server.close(() => {
    logger.info("✅ Server shutdown complete.");
    process.exit(0);
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📄 Swagger API Documentation: http://localhost:${PORT}/api-docs`);
});
