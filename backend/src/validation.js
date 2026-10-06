function fail(message) {
  const error = new Error(message);
  error.statusCode = 400;
  throw error;
}

function readString(value, label, { required = true, maxLength = 300 } = {}) {
  if (value === undefined && !required) return undefined;
  if (typeof value !== "string") fail(`${label} must be text.`);
  const result = value.trim();
  if (required && !result) fail(`${label} is required.`);
  if (result.length > maxLength) fail(`${label} is too long.`);
  return result;
}

function readEmail(value, { required = true } = {}) {
  const email = readString(value, "Email", { required, maxLength: 254 });
  if (email === undefined || (!required && !email)) return email || "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("Enter a valid email address.");
  return email.toLowerCase();
}

function readPhone(value, { required = true } = {}) {
  const phone = readString(value, "Phone number", { required, maxLength: 30 });
  if (phone === undefined || (!required && !phone)) return phone || "";
  const digits = phone.replace(/\D/g, "");
  if (!/^\+?[\d().\s-]+$/.test(phone) || digits.length < 7 || digits.length > 15) {
    fail("Enter a valid phone number.");
  }
  return phone;
}

function readBoolean(value, label) {
  if (typeof value !== "boolean") fail(`${label} must be true or false.`);
  return value;
}

function readDate(value) {
  if (value === "") return "";
  const date = readString(value, "Date of birth", { maxLength: 10 });
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== date) {
    fail("Enter a valid date of birth.");
  }
  return date;
}

function readObjectId(value) {
  const mongoose = require("mongoose");
  if (!mongoose.isValidObjectId(value)) {
    const error = new Error("The requested record was not found.");
    error.statusCode = 404;
    throw error;
  }
  return value;
}

module.exports = { fail, readBoolean, readDate, readEmail, readObjectId, readPhone, readString };