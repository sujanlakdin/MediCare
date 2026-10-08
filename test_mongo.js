const mongoose = require("mongoose");
require("dotenv").config({ path: "./backend/.env" });

async function main() {
  try {
    console.log("Connecting...");
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected!");
    const docs = await mongoose.connection.db.collection("users").find({}).toArray();
    console.log("Raw users count:", docs.length);
    for (const d of docs) {
      console.log(`Email: "${d.email}", Role: "${d.role}", passwordHash: ${Boolean(d.passwordHash)}, password: ${Boolean(d.password)}`);
    }
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Conn Error:", err.message);
    process.exit(1);
  }
}

main();
