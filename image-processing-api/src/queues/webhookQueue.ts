import { Queue } from 'bullmq';
import { WebhookPayload } from '../constants';
import { Redis } from 'ioredis';

export class WebhookQueue {
  private readonly webhookQueue: Queue;
  constructor(redisConnection: Redis) {
    this.webhookQueue = new Queue('webhookQueue', {
      connection: redisConnection,
    });
  }

  async addwebhook(payload: WebhookPayload): Promise<string> {
    const webhook = await this.webhookQueue.add(
      'webhookRequest',
      {
        data: payload,
      },
      {
        jobId: payload.job_id,
        attempts: 10, // number of retries 
        backoff: {
          type: 'exponential',
          delay: 5000, // Initial delay of 5 second (5000ms)
        },
      }
    );
    return webhook.id;
  }
}
