const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

console.log('🔍 Checking MongoDB Connection String...');
console.log('===========================================');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI is not defined in .env file!');
  process.exit(1);
}

// Show the connection string (hiding password for security)
const maskedUri = uri.replace(/\/\/.*@/, '//*****@');
console.log('📡 Connection String (masked):', maskedUri);
console.log('📏 Length:', uri.length);

console.log('\n===========================================');

// Try to connect (REMOVED deprecated options)
console.log('\n🔄 Attempting to connect...');

mongoose.connect(uri)
.then(() => {
  console.log('✅ CONNECTION SUCCESSFUL!');
  console.log(`📦 Database: ${mongoose.connection.name}`);
  console.log(`🔗 Host: ${mongoose.connection.host}`);
  process.exit(0);
})
.catch((error) => {
  console.log('❌ CONNECTION FAILED!');
  console.log(`Error: ${error.message}`);
  process.exit(1);
});