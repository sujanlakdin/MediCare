const express = require("express");
const SupportRequest = require("../models/SupportRequest");
const { readString } = require("../validation");

const router = express.Router();

router.post("/", async (req, res) => {
  const subject = readString(req.body.subject, "Subject", { maxLength: 120 });
  const description = readString(req.body.description, "Description", { maxLength: 4000 });
  const request = await SupportRequest.create({ userId: req.userId, subject, description });
  res.status(201).json({ id: request._id.toString(), message: "Support request received." });
});

module.exports = router;