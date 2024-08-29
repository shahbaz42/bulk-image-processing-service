import { Redis } from 'ioredis';
import { JobQueue, JobType } from './jobQueue'; // Adjust the import based on your file structure

const mockRedisConnection = new Redis();

describe('JobQueue', () => {
  let jobQueue: JobQueue;

  beforeAll(() => {
    jobQueue = new JobQueue(mockRedisConnection);
  });

  it('should add a valid job to the queue', async () => {
    const jobPayload = {
      jobtype: JobType.ReduceQuality,
      data: [
        {
          url: 'https://www.example.com/img1.png',
          metadata: {
            SKU: '12345',
          },
        },
      ],
    };

    const jobid = await jobQueue.addJob(jobPayload);
    expect(jobid).toBeDefined();
  });

  it('should throw an error for invalid job type', async () => {
    const jobPayload = {
      jobid: 'uuid-1234',
      jobtype: 'invalidJobType' as JobType,
      data: [
        {
          url: 'https://www.example.com/img1.png',
          metadata: {
            SKU: '12345',
          },
        },
      ],
    };

    await expect(jobQueue.addJob(jobPayload)).rejects.toThrow(Error);
  });
});
