import { PutObjectCommandOutput } from '@aws-sdk/client-s3';
import { Job, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { ImageProcessingService, S3BucketService } from '../services';
import { v4 as uuidv4 } from 'uuid';

// to-do migrate interfaces and constants to a separate file
export enum JobType {
  ReduceQuality = 'reduceQuality',
  // add more job types here
}

interface JobData {
  url: string;
  metadata: Record<string, any>;
}

type UploadResult = {
  success: boolean;
  metadata?: Record<string, any>;
  error?: Error;
  fileName?: string;
};

export class JobWorker {
  private readonly queueName: string;
  private readonly redisConnection: Redis;
  private readonly imageProcessingService: ImageProcessingService;
  private readonly s3BucketService: S3BucketService;
  private jobWorker: Worker;

  constructor(
    queueName: string,
    redisConnection: Redis,
    imageProcessingService: ImageProcessingService,
    s3BucketService: S3BucketService
  ) {
    this.queueName = queueName;
    this.redisConnection = redisConnection;
    this.imageProcessingService = imageProcessingService;
    this.s3BucketService = s3BucketService;
  }

  /**
   * Starts the job worker.
   */
  async start() {
    this.jobWorker = new Worker(
      this.queueName,
      async (job: Job) => {
        await this.processJob(job);
      },
      {
        connection: this.redisConnection,
      }
    );
    console.log(
      `JobWorker <${this.jobWorker.id}> started for queue ${this.queueName}`
    );
  }

  /**
   * Stops the job worker.
   */
  async stop() {
    await this.jobWorker.close();
    console.log(
      `JobWorker <${this.jobWorker.id}> stopped for queue ${this.queueName}`
    );
  }

  /**
   * Processes a job.
   * @param job - The job to process.
   * @returns A promise that resolves to the result of processing the job.
   */
  async processJob(job: Job) {
    console.log(`Processing job <${job.id}> of type ${job.name}`);
    if (job.name === JobType.ReduceQuality) {
      const data = job.data.data as JobData[];
      let pArr: Promise<UploadResult>[] = [];
      data.forEach((d: JobData) => {
        pArr.push(this.processAndUploadSingleImage(d));
      });
      const result = await Promise.allSettled(pArr);
      console.log('Processed and uploaded images:', result);
      return result; // to asynchronously process all images
    }
  }

  /**
   * Processes and uploads a single image.
   * @param d - The job data containing the image URL and metadata.
   * @returns A promise that resolves to the upload result.
   */
  private async processAndUploadSingleImage(d: JobData): Promise<UploadResult> {
    return new Promise(async (resolve, reject) => {
      try {
        // 1. Generate new file name
        const fileName = `${d.metadata.SKU}-${uuidv4()}.jpg`;
        // 2. Download the image from the URL
        const image = await this.imageProcessingService.downloadImage(d.url);
        // 3. Reduce the quality of the image
        const lowQualityImage = await this.imageProcessingService.reduceQuality(
          image,
          50
        );
        // 4. Upload the processed image to S3
        const uploadResponse = await this.s3BucketService.uploadFile(
          lowQualityImage,
          fileName
        );

        resolve({
          success: true,
          metadata: d.metadata,
          fileName: fileName,
        });
      } catch (error) {
        console.error('Error processing and uploading image:', error);
        reject({
          success: false,
          metadata: d.metadata,
          error:
            error instanceof Error
              ? error
              : new Error('Unknown error occurred'),
          fileName: `${d.metadata.SKU}-${uuidv4()}.jpg`,
        });
      }
    });
  }
}
