/**
 * IntelliViz Pro v2.0 - Database Connection Handler
 * Uses Mongoose to connect to MongoDB Atlas / Local Instance
 */

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Modern Mongoose v8 defaults apply automatically
    });

    console.log(`===========================================`);
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
    console.log(`📁 Database Name: ${conn.connection.name}`);
    console.log(`===========================================`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit process with failure code if DB connection fails
    process.exit(1);
  }
};

module.exports = connectDB;
