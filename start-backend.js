require('dotenv').config();

console.log('🚀 Starting Backend Server...\n');

// Check environment variables
console.log('📋 Environment Variables Check:');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Found' : '❌ Missing');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Found' : '❌ Missing');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Found' : '❌ Missing');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Found' : '❌ Missing');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Found' : '❌ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Found' : '❌ Missing');

// Check if .env file exists
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('\n✅ .env file found');
} else {
  console.log('\n❌ .env file not found');
}

console.log('\n🔧 Starting server...\n');

// Start the server
require('./server.js'); 