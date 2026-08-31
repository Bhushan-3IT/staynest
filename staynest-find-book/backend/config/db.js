const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Get connection string
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      console.error('❌ MONGODB_URI is not defined in .env file');
      process.exit(1);
    }

    console.log('📡 Connecting to MongoDB Atlas...');
    
    // REMOVED: useNewUrlParser and useUnifiedTopology (deprecated in newer Mongoose)
    const conn = await mongoose.connect(uri);
    
    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`📦 Database: ${conn.connection.name}`);
    console.log(`🔗 Host: ${conn.connection.host}`);
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:');
    console.error(`   ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;