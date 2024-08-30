import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { ErrorHandler } from './utils';
import { redisConnection } from './redis';
import { jobRouter } from './router';
import { connectToDatabase } from './database';

const app = express();

connectToDatabase().then(() => {
  console.log('Connected to MongoDB');
});

redisConnection.on('connect', () => {
  console.log('Connected to Redis');
});

// rate limit
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests
  })
);
app.use(morgan('dev')); // logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// for AWS EB health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).send('ok');
});

app.use('/jobs', jobRouter);

app.use(ErrorHandler);
export default app;
