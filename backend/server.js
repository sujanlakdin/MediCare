const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  if (dns.setDefaultResultOrder) dns.setDefaultResultOrder("ipv4first");
} catch {}

const origLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  origLookup(hostname, options, (err, address, family) => {
    if (err && hostname && hostname.includes("mongodb.net")) {
      dns.resolve4(hostname, (resErr, addresses) => {
        if (!resErr && addresses?.length) {
          return callback(null, addresses[0], 4);
        }
        callback(err, address, family);
      });
    } else {
      callback(err, address, family);
    }
  });
};

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

app.use((error, _req, res, _next) => {
  const status = error.statusCode || 500;
  let message = error.message || "An unexpected server error occurred.";

  if (error.code === "LIMIT_FILE_SIZE") message = "Please select a smaller image.";
  if (error.code === "LIMIT_UNEXPECTED_FILE") message = "Please select a valid image.";
  if (status >= 500) message = "An unexpected server error occurred.";

  if (status >= 500) console.error(error);
  res.status(status).json({ error: message });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    if (error.message && error.message.includes("ECONNREFUSED")) {
      console.warn("\n[Tip] MongoDB is not running on 127.0.0.1:27017.");
      console.warn("  1. If installed locally, start the service in an Admin terminal: `net start MongoDB` or run `mongod`");
      console.warn("  2. If using MongoDB Atlas (cloud), update MONGO_URI in `backend/.env`:\n     MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/medicare?retryWrites=true&w=majority\n");
    }
  });

// API Routes
const profileRoutes = require("./routes/profileRoutes");
const medicationRoutes = require("./routes/medicationRoutes");
const patientRoutes = require("./routes/patientRoutes");

app.use("/api/profile", authenticate, profileRoutes);
app.use("/api/medications", authenticate, medicationRoutes);
app.use("/api/patients", patientRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "MediCare Backend is running!",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});