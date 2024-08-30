import { Redis } from 'ioredis';
import { JobRepository } from '../database';
import { Job, Worker } from 'bullmq';

export class ResultWorker {
  private readonly queueName: string;
  private readonly redisConnection: Redis;
  private readonly jobRepository: JobRepository;
  private resultWorker: Worker;

  constructor(
    queueName: string,
    redisConnection: Redis,
    jobRepository: JobRepository
  ) {
    this.queueName = queueName;
    this.redisConnection = redisConnection;
    this.jobRepository = jobRepository;
  }

  async start() {
    this.resultWorker = new Worker(
      this.queueName,
      async (resultJob: Job) => {
        return await this.processJob(resultJob);
      },
      { connection: this.redisConnection }
    );

    console.log(
      `ResultWorker <${this.resultWorker.id}> started for queue ${this.queueName}`
    );
  }

  async stop() {
    await this.resultWorker.close();
    console.log(
      `ResultWorker <${this.resultWorker.id}> stopped for queue ${this.queueName}`
    );
  }

  async processJob(resultJob: Job) {
    console.log(
      `Processing resultJob <${resultJob.id}> of queue ${this.queueName}`
    );
    const job_id = resultJob.id;
    const jobtype = resultJob.name;
    console.log(`Job ID: ${job_id}, Job Type: ${jobtype}`);
    console.log(resultJob.data);

    // 1. Update job status in the database. 

    // 2. Generate a CSV file with the result data.

    // 3. Upload the CSV file to an S3 bucket.

    // 4. Send a POST request to the callback URL with the S3 file URL.
  }
}
