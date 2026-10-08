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

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: "./backend/.env" });

async function main() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
    console.log("MongoDB Connected!");

    const User = require("./backend/src/models/User");

    const caregiverEmails = [
      "sujanlakdin2004@gmail.com",
      "sujanlakdin@gmail.com",
      "sujanlakdin@2004.com"
    ];

    const passwordHash = await bcrypt.hash("Sujan@2004", 12);

    for (const email of caregiverEmails) {
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          fullName: "Sujan Lakdin",
          email,
          passwordHash,
          role: "caregiver",
          phone: "+94 77 123 4567"
        });
        console.log(`[SUCCESS] Created new Caregiver user: ${email}`);
      } else {
        user.passwordHash = passwordHash;
        user.role = "caregiver";
        await user.save();
        console.log(`[SUCCESS] Updated existing user to Caregiver: ${email}`);
      }
    }

    const allUsers = await User.find({}, "fullName email role");
    console.log("\nAll registered users in DB:");
    console.log(allUsers);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

main();
