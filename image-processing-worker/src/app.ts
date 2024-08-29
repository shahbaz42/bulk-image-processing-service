import express, {Request, Response} from 'express';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { ErrorHandler } from './utils';
import { redisConnection } from './redis';
import { JobWorker } from './workers';

// import { ImageProcessingService, S3BucketService } from './services';
// import { Readable } from 'stream';
// import { ReadStream } from 'fs';


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

redisConnection.on('connect', () => {
    console.log('Connected to Redis');
});

const jobWorker = new JobWorker('jobQueue', redisConnection);
jobWorker.start();

// async function main(){
//     const imageProcessingService = new ImageProcessingService();
//     const response = await imageProcessingService.downloadImage('https://file-examples.com/storage/fed4cf5e5466cf5da9e984e/2017/10/file_example_JPG_100kB.jpg');
    
//     const lowQualityImage = await imageProcessingService.reduceQuality(response, 50);
    
//     console.log("lowQuality", lowQualityImage);

//     // save to file
//     const readStream = new Readable();
//     readStream.push(lowQualityImage);
//     readStream.push(null);
//     readStream.pipe(require('fs').createWriteStream('test.png'));



//     const s3BucketService = new S3BucketService();
//     const uploadResponse = await s3BucketService.uploadFile(lowQualityImage, 'test.jpg');
//     console.log(uploadResponse);
// }

// main();

app.use(ErrorHandler);
export default app;
