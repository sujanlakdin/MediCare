const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const medicationRoutes = require("./routes/medicationRoutes");

app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/medicare";

mongoose
  .connect(mongoURI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/medications", medicationRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "MediCare Backend is running!",
    endpoints: {
      auth: "/api/auth/login, /api/auth/register, /api/auth/me",
      patients: "/api/patients",
      medications: "/api/medications",
    },
    dbStatus: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});