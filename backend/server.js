const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

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

// Connect to MongoDB
const primaryUri = process.env.MONGO_URI || "mongodb+srv://medicare_admin:LyTdfo6vGwXFSOT8@cluster0.swmcvu7.mongodb.net/medicare?retryWrites=true&w=majority&appName=Cluster0";
const localUri = "mongodb://127.0.0.1:27017/medicare";

mongoose
  .connect(primaryUri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("🟢 MongoDB connected successfully (Atlas Cloud)!");
  })
  .catch((error) => {
    console.warn("⚠️ Cloud MongoDB Atlas connection failed/timed out:", error.message);
    console.log("🔄 Attempting fallback to local MongoDB...");
    mongoose
      .connect(localUri, { serverSelectionTimeoutMS: 3000 })
      .then(() => {
        console.log("🟢 MongoDB connected successfully (Local Database)!");
      })
      .catch((localErr) => {
        console.error("🔴 Local MongoDB also unavailable:", localErr.message);
        console.log("💡 Application will use in-memory state fallback for requests.");
      });
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});