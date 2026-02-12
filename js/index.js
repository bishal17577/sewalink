const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');
const FormData = require('form-data');

admin.initializeApp();

// ========== IMGBB CONFIG ==========
const IMGBB_API_KEY = 'YOUR_IMGBB_API_KEY'; // Get from imgbb.com
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

// ========== UPLOAD IMAGE TO IMGBB ==========
exports.uploadImageToImgBB = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to upload images'
    );
  }

  const { imageBase64, fileName, folder } = data;
  
  if (!imageBase64) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'No image provided'
    );
  }

  try {
    // Prepare form data
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', imageBase64);
    formData.append('name', fileName || `sewalink-${Date.now()}`);
    
    // Upload to ImgBB
    const response = await fetch(IMGBB_UPLOAD_URL, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || 'Upload failed');
    }

    // Return image data
    return {
      success: true,
      url: result.data.url,
      display_url: result.data.display_url,
      delete_url: result.data.delete_url,
      delete_hash: result.data.delete_hash,
      thumb: result.data.thumb?.url || null
    };

  } catch (error) {
    console.error('ImgBB upload error:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Failed to upload image'
    );
  }
});

// ========== DELETE IMAGE FROM IMGBB ==========
exports.deleteImageFromImgBB = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to delete images'
    );
  }

  const { delete_hash, delete_url } = data;
  
  if (!delete_hash && !delete_url) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'No delete identifier provided'
    );
  }

  try {
    // ImgBB doesn't have a direct delete API, but delete_url works
    // We'll just return success and let the client hit the delete_url
    // Or we can hit it here
    if (delete_url) {
      await fetch(delete_url);
    }

    return { success: true };

  } catch (error) {
    console.error('ImgBB delete error:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Failed to delete image'
    );
  }
});