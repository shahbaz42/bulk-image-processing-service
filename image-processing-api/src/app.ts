import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { ErrorHandler } from './utils';
import { redisConnection } from './redis';
import { jobRouter } from './router';
import { connectToDatabase } from './database';
import { JobQueue, WebhookQueue } from './queues';
import { ResultWorker, WebhookWorker } from './workers';
import { JobRepository, Job } from './database';

const app = express();

// Connecting Database
connectToDatabase().then(() => {
  console.log('Connected to MongoDB');
});

// Connecting Redis
redisConnection.on('connect', () => {
  console.log('Connected to Redis');
});

// Starting Job Queue Listener to process completed jobs
const jobQueue = new JobQueue(redisConnection);
jobQueue.startListener();

// Starting Result Worker to process job results
const jobRepository = new JobRepository(Job);
const webhookQueue = new WebhookQueue(redisConnection);
const resultWorker = new ResultWorker(
  'resultQueue',
  redisConnection,
  jobRepository,
  webhookQueue
);
resultWorker.start();

// starting webhook worker
const webhookWorker = new WebhookWorker(
  'webhookQueue',
  redisConnection,
  jobRepository
);
webhookWorker.start();

// rate limit
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests
  })
);

// Logging and parsing
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.status(200).send('Server is running.');
})

// for AWS EB health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).send('ok');
});

// API router
app.use('/jobs', jobRouter);

// Error handling
app.use(ErrorHandler);

export default app;
