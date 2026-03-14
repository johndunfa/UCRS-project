const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Enhanced connection options for better reliability
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Connection pool settings
      maxPoolSize: 10,
      minPoolSize: 2,
      
      // Timeout settings
      serverSelectionTimeoutMS: 30000, // Increase from 5000 to 30000
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      
      // Retry settings
      retryWrites: true,
      retryReads: true,
      
      // Keep connection alive
      keepAlive: true,
      keepAliveInitialDelay: 300000,
      
      // SSL/TLS settings (important for Atlas)
      ssl: true,
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false
    });

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('Please check:');
    console.error('1. Your IP is whitelisted in MongoDB Atlas');
    console.error('2. The username and password are correct');
    console.error('3. The database name is specified in the URI');
    console.error('4. Your network connection is stable');
    
    // Don't exit immediately, retry connection
    console.log('⏳ Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;