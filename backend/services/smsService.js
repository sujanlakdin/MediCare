const twilio = require("twilio");

/**
 * Normalizes phone numbers to standard E.164 format required by Twilio.
 * Supports Sri Lankan local formats (e.g., 0771234567, 771234567)
 * and international formats (+94 77 123 4567, +1234567890).
 */
function formatE164(phone) {
  if (!phone) return "";

  const trimmed = phone.toString().trim();
  // Strip spaces, dashes, parentheses
  const cleaned = trimmed.replace(/[\s\-()]/g, "");

  // Already valid E.164 with '+'
  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  // Double zero international prefix: e.g. 0094771234567 -> +94771234567
  if (cleaned.startsWith("00")) {
    return "+" + cleaned.slice(2);
  }

  // Local Sri Lankan format: e.g. 0771234567 (10 digits starting with 0) -> +94771234567
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    return "+94" + cleaned.slice(1);
  }

  // 9 digits without leading 0 (e.g., 771234567) -> +94771234567
  if (cleaned.length === 9) {
    return "+94" + cleaned;
  }

  // Starts with 94 country code without '+': e.g. 94771234567 -> +94771234567
  if (cleaned.startsWith("94") && cleaned.length >= 11) {
    return "+" + cleaned;
  }

  // Fallback: prepend '+'
  return "+" + cleaned;
}

/**
 * Check if Twilio configuration is present in environment variables.
 */
function isTwilioConfigured() {
  const sid = (process.env.TWILIO_ACCOUNT_SID || "").trim();
  const token = (process.env.TWILIO_AUTH_TOKEN || "").trim();
  const phone = (process.env.TWILIO_PHONE_NUMBER || "").trim();

  return Boolean(
    sid &&
    token &&
    phone &&
    !sid.includes("your_") &&
    !token.includes("your_") &&
    !phone.includes("your_")
  );
}

/**
 * Send an OTP code via SMS using Twilio.
 * Falls back to server console logging if credentials are missing or sending fails.
 *
 * @param {string} toPhone - The recipient phone number
 * @param {string} otp - The 6-digit OTP verification code
 * @returns {Promise<{success: boolean, fallback?: boolean, sid?: string, error?: string}>}
 */
async function sendOtpSms(toPhone, otp) {
  const formattedPhone = formatE164(toPhone);
  const accountSid = (process.env.TWILIO_ACCOUNT_SID || "").trim();
  const authToken = (process.env.TWILIO_AUTH_TOKEN || "").trim();
  const twilioPhone = (process.env.TWILIO_PHONE_NUMBER || "").trim();

  // If Twilio credentials are not configured, smoothly log and fallback
  if (!isTwilioConfigured()) {
    console.log("--------------------------------------------------");
    console.log("[Twilio SMS] Twilio credentials not configured in .env");
    console.log("[Twilio SMS Fallback] Recipient:", formattedPhone || toPhone);
    console.log("[Twilio SMS Fallback] 6-digit OTP:", otp);
    console.log("[Twilio SMS Fallback] Status: Logged to server console (Simulation Mode)");
    console.log("--------------------------------------------------");
    return {
      success: false,
      fallback: true,
      mode: "console",
      message: "Twilio not configured. OTP logged to server console.",
    };
  }

  try {
    const client = twilio(accountSid, authToken);
    const messageBody = `[MediCare] Your verification code is: ${otp}. Valid for 5 minutes. Please do not share this code with anyone.`;

    console.log(`[Twilio SMS] Sending SMS to ${formattedPhone} via Twilio (${twilioPhone})...`);

    const message = await client.messages.create({
      body: messageBody,
      from: twilioPhone,
      to: formattedPhone,
    });

    console.log("--------------------------------------------------");
    console.log(`[Twilio SMS] Successfully sent SMS to ${formattedPhone}`);
    console.log(`[Twilio SMS] Message SID: ${message.sid}`);
    console.log(`[Twilio SMS] Status: ${message.status}`);
    console.log("--------------------------------------------------");

    return {
      success: true,
      sid: message.sid,
      status: message.status,
      to: formattedPhone,
    };
  } catch (error) {
    console.error("--------------------------------------------------");
    console.error(`[Twilio SMS Error] Failed to send SMS via Twilio to ${formattedPhone || toPhone}`);
    console.error(`[Twilio SMS Error Details]: ${error.message} (Code: ${error.code || "N/A"})`);
    console.warn(`[Twilio SMS Fallback] Server OTP: ${otp} for phone ${toPhone}`);
    console.error("--------------------------------------------------");

    // Smooth fallback: do not throw, return fallback info
    return {
      success: false,
      fallback: true,
      error: error.message,
      errorCode: error.code,
      message: "Failed to send SMS via Twilio. Falling back to console OTP.",
    };
  }
}

module.exports = {
  sendOtpSms,
  formatE164,
  isTwilioConfigured,
};
