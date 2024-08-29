import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandOutput,
} from '@aws-sdk/client-s3';
import {
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_ACCESS_KEY_SECRET,
  S3_BUCKET_NAME,
} from '../config';
import { logError } from '../utils';

/**
 * S3BucketService handles file operations with AWS S3.
 */
export class S3BucketService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = this.createS3Client();
  }

  /**
   * Creates an S3 client instance with configured AWS credentials.
   * @returns {S3Client} Configured S3 client.
   */
  private createS3Client(): S3Client {
    return new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID || '',
        secretAccessKey: AWS_ACCESS_KEY_SECRET || '',
      },
    });
  }

  /**
   * Uploads a file to the specified S3 bucket.
   * @param filePath - The local file path to upload.
   * @param key - The destination key in the S3 bucket.
   * @returns {Promise<PutObjectCommandOutput>} The response from the S3 upload operation.
   * @throws Will throw an error if the upload fails.
   */
  async uploadFile(
    fileBuffer: Buffer,
    key: string,
  ): Promise<PutObjectCommandOutput> {
    if (!Buffer.isBuffer(fileBuffer)) {
      throw new Error('Invalid input: fileBuffer must be a Buffer');
    }

    try {
      const uploadParams = {
        Bucket: S3_BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
      };

      const command = new PutObjectCommand(uploadParams);
      const response = await this.s3Client.send(command);

      return response;
    } catch (error) {
      logError(error);
      throw error;
    }
  }
}
