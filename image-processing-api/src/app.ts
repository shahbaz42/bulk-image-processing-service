import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { ErrorHandler } from './utils';
import { redisConnection } from './redis';
import { jobRouter } from './router';

const app = express();

redisConnection.on('connect', () => {
  console.log('Connected to Redis');
});

app.use(
  rateLimit({
    // rate limit
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests
  })
);
app.use(morgan('dev')); // logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req: Request, res: Response) => {
  // for AWS EB health check
  res.status(200).send('ok');
});

app.use('/jobs', jobRouter);

app.use(ErrorHandler);
export default app;
