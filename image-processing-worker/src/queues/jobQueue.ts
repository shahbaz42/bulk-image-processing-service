import { Redis } from 'ioredis';
import { Job, Queue, Worker } from 'bullmq';

// to-do migrate interfaces and constants to a separate file
export enum JobType {
  ReduceQuality = 'reduceQuality',
  // add more job types here
}

interface JobData {
  url: string;
  metadata: Record<string, any>;
}

interface JobPayload {
  jobtype: JobType;
  data: JobData[];
}

export class JobQueue {
  private readonly jobQueue: Queue;

  constructor(redisConnection: Redis) {
    this.jobQueue = new Queue('jobQueue', { connection: redisConnection });
  }

  async addJob(payload: JobPayload): Promise<string> {
    if (!Object.values(JobType).includes(payload.jobtype)) {
      throw new Error(`Invalid job type: ${payload.jobtype}`);
    }

    const job = await this.jobQueue.add(payload.jobtype, {
      data: payload.data,
    });

    return job.id;
  }
}
