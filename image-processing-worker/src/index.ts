import dotenv from 'dotenv';
dotenv.config();
import { redisConnection } from './redis';
import { JobWorker } from './workers';
import { ImageProcessingService, S3BucketService } from './services';

redisConnection.on('connect', () => {
  console.log('Connected to Redis');
});

const imageProcessingService = new ImageProcessingService();
const s3BucketService = new S3BucketService();
const jobWorker = new JobWorker(
  'jobQueue',
  redisConnection,
  imageProcessingService,
  s3BucketService
);
jobWorker.start();
