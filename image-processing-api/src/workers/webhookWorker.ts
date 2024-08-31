import { Redis } from 'ioredis';
import { WebhookQueue } from '../queues';
import { JobRepository } from '../database';
import { WebhookPayload } from '../constants';
import { Job, Worker } from 'bullmq';
import axios from 'axios';

export class WebhookWorker {
  private readonly queueName: string;
  private readonly redisConnection: Redis;
  private readonly jobRepository: JobRepository;
  private webhookWorker: Worker;

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
    this.webhookWorker = new Worker(
      this.queueName,
      async (webhookJob: Job) => {
        await this.processJob(webhookJob);
      },
      { connection: this.redisConnection }
    );

    console.log(
      `WebhookWorker <${this.webhookWorker.id}> started for queue ${this.queueName}`
    );
  }

  async stop() {
    await this.webhookWorker.close();
    console.log(
      `WebhookWorker <${this.webhookWorker.id}> stopped for queue ${this.queueName}`
    );
  }

  async processJob(payload: Job) {
    await this.sendWebhook(payload.data.data);
    await this.jobRepository.setWebhookSent(payload.data.data.job_id);
    return "webhook sent";
  }

  async sendWebhook(payload: WebhookPayload): Promise<any> {
    const url = payload.webhook;
    const data = {
      job_id: payload.job_id,
      status: payload.status,
      input_csv_url: payload.input_csv_url,
      output_csv_url: payload.output_csv_url,
    };

    return axios.post(url, data);
  }
}
