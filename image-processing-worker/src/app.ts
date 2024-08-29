import express, {Request, Response} from 'express';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { ErrorHandler } from './utils';

const app = express();
app.use(rateLimit({ // rate limit
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests
}));
app.use(morgan('dev')); // logging
app.use(express.json());

app.get('/health', (req: Request, res: Response) => { // for AWS EB health check
    res.status(200).send('ok');
});

app.use(ErrorHandler);
export default app;
