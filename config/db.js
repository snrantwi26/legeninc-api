const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Supports standard MongoDB URI strings automatically populated by Railway's plugins
    const connURI = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!connURI) {
      throw new Error('Database connection string (MONGO_URI/MONGODB_URI) is missing in environment variables.');
    }
    
    const conn = await mongoose.connect(connURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;