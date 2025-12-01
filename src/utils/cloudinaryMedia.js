import crypto from 'node:crypto';
import cloudinary, { cloudinaryConfigured, cloudinaryFolder } from './cloudinaryClient.js';

const DEFAULT_URL_OPTIONS = { secure: true };

export function buildPostImageKey(postId, originalName = 'post.jpg') {
  const safeName = originalName.replace(/[^a-zA-Z0-9.\-_/]/g, '_');
  const suffix = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
  return `${cloudinaryFolder.replace(/\/$/, '')}/post_${postId}_${suffix}_${safeName}`;
}

export async function uploadBufferToCloudinary(key, buffer, contentType) {
  if (!cloudinaryConfigured) {
    throw new Error('Cloudinary is not configured');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: key,
        resource_type: 'image',
        overwrite: true,
        format: contentType?.split('/')?.pop(),
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
}

export function createImageUrl(publicId) {
  if (!publicId || !cloudinaryConfigured) {
    return null;
  }

  return cloudinary.url(publicId, DEFAULT_URL_OPTIONS);
}

export async function deleteFromCloudinary(publicId) {
  if (!publicId || !cloudinaryConfigured) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (err) {
    console.warn('Failed to delete Cloudinary asset', publicId, err.message);
  }
}
