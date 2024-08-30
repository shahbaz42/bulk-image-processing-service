import { Queue } from 'bullmq';
import { IResultJob } from '../constants';
import { Redis } from 'ioredis';

export class ResultQueue {
  private readonly jobQueue: Queue;
  constructor(redisConnection: Redis) {
    this.jobQueue = new Queue('resultQueue', { connection: redisConnection });
  }

  async addJob(payload: IResultJob): Promise<string> {
    const job = await this.jobQueue.add(
      payload.jobtype,
      {
        data: payload.data,
      },
      {
        jobId: payload.job_id,
      }
    );
    return job.id;
  }
}
