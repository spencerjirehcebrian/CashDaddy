
import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'minio';
import { config } from '../../config/index.js';

export async function uploadToMinio(file: Express.Multer.File): Promise<string> {
  const minioClient = new Client({
    endPoint: config.MINIO_ENDPOINT as string,
    port: Number(config.MINIO_PORT),
    useSSL: config.MINIO_USE_SSL === 'true',
    accessKey: config.MINIO_ACCESS_KEY as string,
    secretKey: config.MINIO_SECRET_KEY as string
  });

  const fileName = `${Date.now()}${path.extname(file.originalname)}`;

  try {
    let fileStream: Buffer | fs.ReadStream;
    let fileSize: number;

    if (file.buffer) {
      fileStream = Buffer.from(file.buffer);
      fileSize = file.buffer.length;
    } else if (file.path) {
      fileStream = fs.createReadStream(file.path);
      const stats = fs.statSync(file.path);
      fileSize = stats.size;
    } else {
      throw new Error('Invalid file object');
    }

    if (!config.MINIO_BUCKET_NAME) {
      throw new Error('MINIO_BUCKET_NAME is not defined');
    }

    await minioClient.putObject(config.MINIO_BUCKET_NAME, fileName, fileStream, fileSize);

    const fileUrl = await minioClient.presignedGetObject(
      config.MINIO_BUCKET_NAME,
      fileName,
      24 * 60 * 60 // URL expiration time in seconds (24 hours in this case)
    );

    // Clean up temporary file if it exists
    if (file.path) {
      fs.unlinkSync(file.path);
    }

    return fileUrl;
  } catch (error: unknown) {
    console.error('Error uploading file to MinIO:', error);
    if (error instanceof Error) {
      throw new Error('Failed to upload file: ' + error.message);
    } else {
      throw new Error('Failed to upload file: An unknown error occurred');
    }
  }
}
