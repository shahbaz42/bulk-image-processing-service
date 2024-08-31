import { Redis } from 'ioredis';
import { Job, Queue, QueueEvents } from 'bullmq';
import { JobPayload, JobType, ResultJobData } from '../constants';
import { ResultQueue } from './resultQueue';

export class JobQueue {
  private readonly jobQueue: Queue;
  private readonly redisConnection: Redis;

  constructor(redisConnection: Redis) {
    this.redisConnection = redisConnection;
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

  async startListener() {
    console.log('Started jobQueue listener');
    const queueEvents = new QueueEvents('jobQueue', {
      connection: this.redisConnection,
    });
    queueEvents.on('completed', async (job) => {
      this.createNewResultJob(job.jobId, job.returnvalue as any);
    });
  }

  async createNewResultJob(jobId: string, data: ResultJobData[]) {
    const resultQueue = new ResultQueue(this.redisConnection);
    await resultQueue.addJob({
      jobtype: JobType.ReduceQuality,
      job_id: jobId,
      data,
    });
  }
}
