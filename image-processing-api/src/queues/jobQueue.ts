import { Redis } from 'ioredis';
import { Queue } from 'bullmq';
import { JobPayload, JobType } from '../constants';

export class JobQueue {
  private readonly jobQueue: Queue;

  constructor(redisConnection: Redis) {
    this.jobQueue = new Queue('jobQueue', { connection: redisConnection });
  }

  async addJob(payload: JobPayload): Promise<string> {
    if (!Object.values(JobType).includes(payload.jobtype)) {
      throw new Error(`Invalid job type: ${payload.jobtype}`);
    }

    const job = await this.jobQueue.add(
      payload.jobtype,
      {
        data: payload.data,
      },
      {
        jobId: payload.id,
      }
    );

    return job.id;
  }
}
