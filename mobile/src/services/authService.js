/**
 * Authentication Service (Member 1: Authentication Screens)
 * 
 * Provides mock asynchronous auth functions returning Promises with a short delay.
 * Includes TODO hooks for backend API endpoints and outlines the future database schema.
 * 
 * TODO: Connect real API / database
 * Future "users" table fields to support:
 * - id: String / UUID primary key
 * - full_name: String
 * - email: String (unique)
 * - phone: String (Sri Lankan format)
 * - password_hash: String (bcrypt)
 * - role: 'patient' | 'caregiver'
 * - created_at: Timestamp (ISO8601)
 */

// Simulated network latency helper
const delay = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory mock session store
let currentUser = {
  id: "usr_demo_101",
  full_name: "Chathura Rajapakse",
  email: "chathura.rajapakse@medicare.com",
  phone: "+94771234567",
  role: "patient",
  created_at: new Date().toISOString(),
};

let authToken = "demo-bearer-token-medicare";

export const authService = {
  /**
   * Get currently authenticated user session
   */
  getCurrentUser: () => currentUser,

  /**
   * Update in-memory user
   */
  setCurrentUser: (user) => {
    currentUser = { ...currentUser, ...user };
    return currentUser;
  },

  /**
   * Log in with Email or Phone and Password
   * Supports both login(id, password) and login({ id/email, password })
   * @param {string|object} idOrCredentials - Email or Phone string, or credentials object
   * @param {string} [password] - Account password
   */
  login: async (idOrCredentials, password) => {
    await delay(500);

    let identifier = "";
    let pwd = "";

    if (typeof idOrCredentials === "object" && idOrCredentials !== null) {
      identifier = (idOrCredentials.id || idOrCredentials.email || "").trim();
      pwd = idOrCredentials.password || "";
    } else {
      identifier = (idOrCredentials || "").trim();
      pwd = password || "";
    }

    // TODO: Connect real API / database endpoint: POST /api/auth/login
    // Payload: { identifier, password: pwd }

    // Mock validation check
    if (!identifier || !pwd) {
      throw new Error("Please enter both your identifier and password.");
    }

    if (pwd.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    // Demo success
    currentUser = {
      id: "usr_" + Date.now(),
      full_name: identifier.includes("@")
        ? identifier.split("@")[0].replace(".", " ")
        : "MediCare User",
      email: identifier.includes("@") ? identifier : "user@medicare.com",
      phone: !identifier.includes("@") ? identifier : "+94771234567",
      role: "patient",
      created_at: new Date().toISOString(),
    };
    authToken = "demo-token-" + Date.now();

    return {
      success: true,
      message: "Signed in successfully.",
      user: currentUser,
      token: authToken,
    };
  },

  /**
   * Register a new user
   * @param {object} params
   * @param {string} params.name - Full name
   * @param {string} params.email - Email ID
   * @param {string} params.password - Account password
   * @param {string} params.role - 'patient' | 'caregiver'
   */
  register: async ({ name, fullName, email, password, role = "patient" }) => {
    await delay(600);

    const displayName = (name || fullName || "").trim();
    const userEmail = (email || "").trim().toLowerCase();

    // TODO: Connect real API / database endpoint: POST /api/auth/register
    // Future database table schema insertion:
    // INSERT INTO users (id, full_name, email, password_hash, role, created_at)
    // VALUES (uuid(), displayName, userEmail, hash(password), role, NOW())

    if (!displayName || displayName.length < 2) {
      throw new Error("Full name must be at least 2 characters.");
    }
    if (!userEmail) {
      throw new Error("A valid email address is required.");
    }
    if (!password || password.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }

    currentUser = {
      id: "usr_" + Date.now(),
      full_name: displayName,
      email: userEmail,
      phone: "+94771234567",
      role: role === "caregiver" ? "caregiver" : "patient",
      created_at: new Date().toISOString(),
    };
    authToken = "demo-token-" + Date.now();

    return {
      success: true,
      message: "Registration successful. Welcome to MediCare!",
      user: currentUser,
      token: authToken,
    };
  },

  /**
   * Send password reset OTP code to email or phone
   * @param {string} id - Email or Phone number
   */
  sendResetCode: async (id) => {
    await delay(500);

    // TODO: Connect real API / database endpoint: POST /api/auth/send-reset-code
    // Generates 6-digit OTP, stores temporary hash with 10-minute expiry, and dispatches SMS/email.

    const identifier = (id || "").trim();
    if (!identifier) {
      throw new Error("Please enter your email or phone number.");
    }

    return {
      success: true,
      destination: identifier,
      message: `Reset code sent to ${identifier}.`,
      demoCode: "123456", // Temporary testing code before backend integration
    };
  },

  /**
   * Verify 6-digit OTP code
   * @param {string} id - Email or phone
   * @param {string} code - 6-digit code
   */
  verifyOtp: async (id, code) => {
    await delay(450);

    // TODO: Connect real API / database endpoint: POST /api/auth/verify-otp
    // Compares incoming OTP with database record and returns a signed reset token.

    const trimmedCode = (code || "").trim();
    if (trimmedCode === "123456") {
      return {
        success: true,
        resetToken: "temp-reset-token-" + Date.now(),
        message: "Code verified successfully.",
      };
    }

    throw new Error("That code is not correct. Check it and try again.");
  },

  /**
   * Reset Password with new password
   * @param {string} id - Email or phone
   * @param {string} newPassword - New password
   */
  resetPassword: async (id, newPassword) => {
    await delay(500);

    // TODO: Connect real API / database endpoint: POST /api/auth/reset-password
    // Updates users table: UPDATE users SET password_hash = hash(newPassword) WHERE email = id OR phone = id

    if (!newPassword || newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters long.");
    }

    return {
      success: true,
      message: "Password updated successfully.",
    };
  },

  /**
   * Compatibility alias for older screen calls
   */
  forgotPassword: async (email) => {
    return authService.sendResetCode(email);
  },

  /**
   * Demo one-tap elderly sign in
   */
  loginAsDemoElderly: async () => {
    await delay(200);
    return {
      success: true,
      user: currentUser,
      token: authToken,
    };
  },

  /**
   * Logout and clear local session
   */
  logout: async () => {
    await delay(150);
    authToken = null;
    return { success: true };
  },
};

export default authService;
