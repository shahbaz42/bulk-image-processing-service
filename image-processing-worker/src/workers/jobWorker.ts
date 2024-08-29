import { Job, Worker } from 'bullmq';
import { Redis } from 'ioredis';

export class JobWorker {
  private readonly queueName: string;
  private readonly redisConnection: Redis;
  private jobWorker: Worker;

  constructor(queueName: string, redisConnection: Redis) {
    this.queueName = queueName;
    this.redisConnection = redisConnection;
  }

  async start() {
    this.jobWorker = new Worker(
      this.queueName,
      async (job: Job) => {
        await this.processJob(job);
      },
      {
        connection: this.redisConnection,
      },
    );
    console.log(
      `JobWorker <${this.jobWorker.id}> started for queue ${this.queueName}`,
    );
  }

  async stop() {
    await this.jobWorker.close();
    console.log(
      `JobWorker <${this.jobWorker.id}> stopped for queue ${this.queueName}`,
    );
  }

  async processJob(job: Job) {
    console.log(`Processing job ${job.id}`);
  }
}
