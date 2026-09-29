const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

const authRoutes = require("./routes/authRoutes");

app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/medicare";

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "MediCare Backend is running!",
    endpoints: {
      auth: "/api/auth/login, /api/auth/register, /api/auth/me",
    },
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});