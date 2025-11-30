import { S3Client } from '@aws-sdk/client-s3';

const region = process.env.S3_REGION || process.env.AWS_REGION;

if (!region) {
  console.warn('S3 region is not configured. Set S3_REGION or AWS_REGION in the environment.');
}

export const s3Client = new S3Client({
  region,
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined,
});

export const s3Config = {
  bucket: process.env.S3_BUCKET,
  publicUrlBase: process.env.S3_PUBLIC_URL_BASE,
};
