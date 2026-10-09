const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  if (dns.setDefaultResultOrder) dns.setDefaultResultOrder("ipv4first");
} catch (dnsErr) {
  console.warn("⚠️ DNS setup notice:", dnsErr.message);
}

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

// Avoid 10s buffering hangs when database is disconnected or connecting
mongoose.set("bufferCommands", false);

const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/users");
const caregiverRoutes = require("./src/routes/caregivers");
const supportRoutes = require("./src/routes/support");
const authenticate = require("./src/middleware/authenticate");

const app = express();
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be set to a secret with at least 32 characters.");
}

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", authenticate, userRoutes);
app.use("/api/caregivers", authenticate, caregiverRoutes);
app.use("/api/support", authenticate, supportRoutes);

// Additional API Routes
const profileRoutes = require("./routes/profileRoutes");
const medicationRoutes = require("./routes/medicationRoutes");
const patientRoutes = require("./routes/patientRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const doseLogRoutes = require("./routes/doseLogRoutes");
const noteRoutes = require("./routes/noteRoutes");

app.use("/api/profile", authenticate, profileRoutes);
app.use("/api/medications", authenticate, medicationRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/reminders", authenticate, reminderRoutes);
app.use("/api/dose-logs", authenticate, doseLogRoutes);
app.use("/api/notes", noteRoutes);

// Error Handling Middleware (must be after all routes)
app.use((error, _req, res, _next) => {
  const status = error.statusCode || 500;
  let message = error.message || "An unexpected server error occurred.";

  if (error.code === "LIMIT_FILE_SIZE") message = "Please select a smaller image.";
  if (error.code === "LIMIT_UNEXPECTED_FILE") message = "Please select a valid image.";
  if (status >= 500) message = "An unexpected server error occurred.";

  if (status >= 500) console.error(error);
  res.status(status).json({ error: message });
});

app.get("/", (req, res) => {
  res.json({
    message: "MediCare Backend is running!",
  });
});

// Database Connection with SRV and Standard Connection String Fallback
const primaryUri =
  process.env.MONGO_URI ||
  "mongodb+srv://medicare_admin:LyTdfo6vGwXFSOT8@cluster0.swmcvu7.mongodb.net/medicare?retryWrites=true&w=majority&appName=Cluster0";

const standardAtlasUri =
  process.env.MONGO_STANDARD_URI ||
  "mongodb://medicare_admin:LyTdfo6vGwXFSOT8@ac-wenatff-shard-00-00.swmcvu7.mongodb.net:27017,ac-wenatff-shard-00-01.swmcvu7.mongodb.net:27017,ac-wenatff-shard-00-02.swmcvu7.mongodb.net:27017/medicare?ssl=true&replicaSet=atlas-ems5v0-shard-0&authSource=admin&retryWrites=true&w=majority";

const localUri = process.env.MONGO_LOCAL_URI || "mongodb://127.0.0.1:27017/medicare";

const mongoOptions = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4,
};

async function connectToDatabase() {
  // Try 1: Primary URI (SRV or custom configured)
  try {
    console.log("🔄 Connecting to MongoDB (Primary URI)...");
    await mongoose.connect(primaryUri, mongoOptions);
    console.log("🟢 MongoDB connected successfully (Atlas Cloud via SRV)!");
    return;
  } catch (error) {
    console.warn("⚠️ Cloud MongoDB Atlas (SRV) connection failed:", error.message);
  }

  // Try 2: Standard replica set connection string format (bypasses SRV lookup if querySrv failed)
  if (standardAtlasUri && standardAtlasUri !== primaryUri) {
    try {
      console.log("🔄 Attempting fallback to standard Atlas replica set URI...");
      await mongoose.connect(standardAtlasUri, mongoOptions);
      console.log("🟢 MongoDB connected successfully (Atlas Cloud via Standard Replica Set)!");
      return;
    } catch (standardErr) {
      console.warn("⚠️ Cloud MongoDB Atlas standard URI connection failed:", standardErr.message);
    }
  }

  // Try 3: Local MongoDB
  try {
    console.log("🔄 Attempting fallback to local MongoDB...");
    await mongoose.connect(localUri, { ...mongoOptions, serverSelectionTimeoutMS: 3000 });
    console.log("🟢 MongoDB connected successfully (Local Database)!");
    return;
  } catch (localErr) {
    console.warn("🔴 Local MongoDB also unavailable:", localErr.message);
  }

  // Graceful In-Memory fallback mode
  console.log("💡 Application will use in-memory state fallback for requests.");
}

connectToDatabase();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});