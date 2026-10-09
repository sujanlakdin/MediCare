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
require("dotenv").config({ path: "./backend/.env" });

async function debugUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
    console.log("Connected to MongoDB");

    // Fetch raw documents from 'users' collection directly
    const rawUsers = await mongoose.connection.db.collection("users").find({}).toArray();
    console.log(`Found ${rawUsers.length} raw user documents in 'users' collection:`);
    for (const u of rawUsers) {
      console.log({
        _id: u._id,
        email: u.email,
        role: u.role,
        fullName: u.fullName,
        hasPasswordHash: Boolean(u.passwordHash),
        hasPassword: Boolean(u.password),
        hasSalt: Boolean(u.salt),
        keys: Object.keys(u)
      });
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Debug Error:", err);
    process.exit(1);
  }
}

debugUsers();
