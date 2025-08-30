const cloudinary = require('cloudinary').v2;

// Prefer explicit credentials; only fall back to CLOUDINARY_URL if present and valid
const hasExplicitCreds = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
const hasUrl = typeof process.env.CLOUDINARY_URL === 'string' && process.env.CLOUDINARY_URL.trim().startsWith('cloudinary://');

if (hasExplicitCreds || !hasUrl) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
} else {
  cloudinary.config({ secure: true });
}

// Verify configuration
if (!hasExplicitCreds && !hasUrl) {
  console.warn('⚠️ Cloudinary configuration incomplete. Set CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET or a valid CLOUDINARY_URL.');
}

module.exports = cloudinary;
