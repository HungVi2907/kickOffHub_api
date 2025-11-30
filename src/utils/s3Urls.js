import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'node:crypto';
import { s3Client, s3Config } from './s3Client.js';

const DEFAULT_URL_EXPIRES = 60 * 60; // 1 hour

export function buildPostImageKey(postId, originalName) {
  const safeName = originalName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const randomSuffix = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
  return `posts/${postId}/${randomSuffix}-${safeName}`;
}

export async function uploadBufferToS3(key, buffer, contentType) {
  if (!s3Config.bucket) {
    throw new Error('S3_BUCKET is not configured');
  }

  const command = new PutObjectCommand({
    Bucket: s3Config.bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);
  return key;
}

export async function createPresignedGetUrl(key, expiresIn = DEFAULT_URL_EXPIRES) {
  if (!key) {
    return null;
  }

  if (s3Config.publicUrlBase) {
    return `${s3Config.publicUrlBase.replace(/\/$/, '')}/${key}`;
  }

  if (!s3Config.bucket) {
    return null;
  }

  const command = new GetObjectCommand({
    Bucket: s3Config.bucket,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

export async function deleteObjectFromS3(key) {
  if (!key || !s3Config.bucket) {
    return;
  }

  const command = new DeleteObjectCommand({
    Bucket: s3Config.bucket,
    Key: key,
  });

  try {
    await s3Client.send(command);
  } catch (err) {
    console.warn('Failed to delete S3 object', key, err.message);
  }
}
