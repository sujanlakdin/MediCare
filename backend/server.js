const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
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
app.use(express.json({ limit: "32kb" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", authenticate, userRoutes);
app.use("/api/caregivers", authenticate, caregiverRoutes);
app.use("/api/support", authenticate, supportRoutes);

app.use((error, _req, res, _next) => {
  const status = error.statusCode || 500;
  const message = status >= 500 ? "An unexpected server error occurred." : error.message;
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
  });

app.get("/", (req, res) => {
  res.json({
    message: "MediCare Backend is running!"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});