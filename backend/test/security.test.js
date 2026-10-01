const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const express = require("express");
const jwt = require("jsonwebtoken");

const authenticate = require("../src/middleware/authenticate");
const authRoutes = require("../src/routes/auth");
const userRoutes = require("../src/routes/users");
const caregiverRoutes = require("../src/routes/caregivers");
const supportRoutes = require("../src/routes/support");
const { readDate, readEmail, readPhone } = require("../src/validation");

const secret = "a-test-secret-that-is-at-least-32-characters-long";
let server;
let baseUrl;

function responseMock() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

before(async () => {
  process.env.JWT_SECRET = secret;
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  app.use("/api/users", authenticate, userRoutes);
  app.use("/api/caregivers", authenticate, caregiverRoutes);
  app.use("/api/support", authenticate, supportRoutes);
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test("protected API groups reject requests without a bearer token", async () => {
  const requests = [
    ["GET", "/api/auth/me"],
    ["GET", "/api/users/profile"],
    ["GET", "/api/users/notification-settings"],
    ["GET", "/api/users/accessibility-settings"],
    ["GET", "/api/users/emergency-contact"],
    ["GET", "/api/caregivers"],
    ["POST", "/api/support", { subject: "Question", description: "A long enough support message." }],
  ];

  for (const [method, path, body] of requests) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    assert.equal(response.status, 401, `${method} ${path} must require authentication`);
  }
});

test("authentication middleware rejects malformed and wrong-signature tokens", () => {
  for (const token of ["not-a-token", jwt.sign({}, "different-test-secret", { algorithm: "HS256" })]) {
    const req = { get: () => `Bearer ${token}` };
    const res = responseMock();
    let continued = false;
    authenticate(req, res, () => { continued = true; });
    assert.equal(res.statusCode, 401);
    assert.equal(continued, false);
  }
});

test("authentication middleware attaches the signed subject as the user identity", () => {
  const token = jwt.sign({}, secret, {
    algorithm: "HS256",
    issuer: "medicare-api",
    subject: "user-123",
    expiresIn: "1m",
  });
  const req = { get: () => `Bearer ${token}` };
  const res = responseMock();
  let continued = false;
  authenticate(req, res, () => { continued = true; });
  assert.equal(continued, true);
  assert.equal(req.userId, "user-123");
});

test("validators reject invalid email, phone, and date values", () => {
  assert.throws(() => readEmail("not-an-email"), /valid email/i);
  assert.throws(() => readPhone("12"), /valid phone/i);
  assert.throws(() => readDate("2024-02-31"), /valid date/i);
});