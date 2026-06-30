const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary if environment variables are set
const isConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('Cloudinary Media Storage service initialized successfully.');
} else {
  console.log('Cloudinary credentials missing in .env. Operating in local storage fallback mode.');
}

/**
 * Uploads a local file to Cloudinary and unlinks it from disk.
 * Returns the secure URL and metadata, or null if Cloudinary is not configured.
 */
const uploadMedia = async (localFilePath) => {
  if (!isConfigured) {
    return null;
  }

  try {
    const absolutePath = path.isAbsolute(localFilePath)
      ? localFilePath
      : path.join(__dirname, '..', localFilePath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Local file not found for Cloudinary upload: ${absolutePath}`);
    }

    console.log(`Uploading file to Cloudinary: ${absolutePath}`);
    
    // Upload file. Audio/Video requires resource_type: 'video'
    const result = await cloudinary.uploader.upload(absolutePath, {
      resource_type: 'video',
      folder: 'meetmind_meetings'
    });

    console.log(`Cloudinary upload complete. Secure URL: ${result.secure_url}`);

    // Proactively remove the local temporary file from disk to save space
    try {
      fs.unlinkSync(absolutePath);
      console.log(`Temporary local file cleaned up: ${absolutePath}`);
    } catch (err) {
      console.error('Failed to clean up temporary local file:', err);
    }

    return {
      secureUrl: result.secure_url,
      publicId: result.public_id,
      duration: result.duration ? Math.round(result.duration) : 0
    };
  } catch (error) {
    console.error('Failed to upload file to Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  uploadMedia,
  isConfigured: () => !!isConfigured
};
