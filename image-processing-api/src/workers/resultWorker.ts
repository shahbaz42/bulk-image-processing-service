import { Redis } from 'ioredis';
import { JobRepository } from '../database';
import { Job, Worker } from 'bullmq';
import { JobStatus, JobType, ResultJobData } from '../constants';
import { CsvGenerationService } from '../services';
import { WebhookQueue } from '../queues';

export class ResultWorker {
  private readonly queueName: string;
  private readonly redisConnection: Redis;
  private readonly jobRepository: JobRepository;
  private readonly webhookQueue: WebhookQueue;
  private resultWorker: Worker;

  constructor(
    queueName: string,
    redisConnection: Redis,
    jobRepository: JobRepository,
    webhookQueue: WebhookQueue
  ) {
    this.queueName = queueName;
    this.redisConnection = redisConnection;
    this.jobRepository = jobRepository;
    this.webhookQueue = webhookQueue;
  }

  /**
   * Starts the result worker.
   *
   * @returns {Promise<void>} A promise that resolves when the result worker is started.
   */
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

  /**
   * Stops the result worker and logs a message indicating the worker has stopped.
   */
  async stop() {
    await this.resultWorker.close();
    console.log(
      `ResultWorker <${this.resultWorker.id}> stopped for queue ${this.queueName}`
    );
  }

  async processJob(resultJob: Job) {
    if (resultJob.name === JobType.ReduceQuality) {
      console.log(`ResultWorker <${this.resultWorker.id}> Processing result <${resultJob.id}>`)
      const jobDoc = await this.jobRepository.fetchJob(resultJob.id);

      // Generate the updated csv file, save to s3, and get the URL.
      const updatedCsvUrl = await CsvGenerationService.generateCsvUrl(
        resultJob.data.data as ResultJobData[],
        jobDoc.input_csv_url
      );

      // Update job status in the database.
      await this.jobRepository.markJobAsComplete(resultJob.id, updatedCsvUrl);

      // update processed data in the database.
      await this.jobRepository.saveProcessedData(resultJob.id, resultJob.data.data as ResultJobData[]);

      // if a webhook is provided, add the job to the webhook queue.
      if (jobDoc.webhook) {
        await this.webhookQueue.addwebhook({
          job_id: jobDoc.job_id,
          webhook: jobDoc.webhook,
          status: JobStatus.Completed,
          output_csv_url: updatedCsvUrl,
          input_csv_url: jobDoc.input_csv_url,
        });
      }

      return 'Job completed successfully';
    }
  }
}
