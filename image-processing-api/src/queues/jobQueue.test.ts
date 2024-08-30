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
      id: 'asdf',
      jobtype: JobType.ReduceQuality,
      data: [
        {
          url: 'https://file-examples.com/storage/fed4cf5e5466cf5da9e984e/2017/10/file_example_JPG_100kB.jpg',
          metadata: {
            SKU: '12345',
          },
        },
        {
          url: 'https://file-examples.com/storage/fed4cf5e5466cf5da9e984e/2017/10/file_example_JPG_100kB.jpg',
          metadata: {
            SKU: '12345',
          },
        },
        {
          url: 'https://file-examples.com/storage/fed4cf5e5466cf5da9e984e/2017/10/file_example_JPG_100kB.jpg',
          metadata: {
            SKU: '22222',
          },
        },
      ],
    };

    const jobid = await jobQueue.addJob(jobPayload);
    expect(jobid).toBeDefined();
  });

  it('should throw an error for invalid job type', async () => {
    const jobPayload = {
      id: 'uuid-1234',
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
