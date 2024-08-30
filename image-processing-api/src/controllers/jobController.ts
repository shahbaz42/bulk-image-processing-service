import { NextFunction, Request, Response } from 'express';
import { S3BucketService } from '../services';
import { readFileSync, unlinkSync } from 'fs';
import { S3_BUCKET_URL } from '../config';
import { Job, JobRepository } from '../database';
import { JobQueue } from '../queues';
import { redisConnection } from '../redis';
import { transformCsvDataToJobData } from '../utils';
import { v4 as uuidv4 } from 'uuid';
import { JobStatus, RequestWithCSV, JobType } from '../constants';

export class JobController {
  async createNewJobController(
    req: RequestWithCSV,
    res: Response,
    next: NextFunction
  ) {
    try {
      await new S3BucketService().uploadFile(
        readFileSync(req.file.path),
        req.file.filename
      );
      unlinkSync(req.file.path);

      const s3FileUrl = `${S3_BUCKET_URL}${req.file.filename}`;
      const csvData = req.csv;
      const id = uuidv4();
      const jobData = transformCsvDataToJobData(csvData);

      const jobQueue = new JobQueue(redisConnection);
      const job_id = await jobQueue.addJob({
        id,
        jobtype: JobType.ReduceQuality,
        data: jobData,
      });

      const jobRepository = new JobRepository(Job);
      await jobRepository.createJob({
        job_id: id,
        callback_url: req.body.callback_url,
        status: JobStatus.Queued,
        job_type: JobType.ReduceQuality,
        data: jobData,
        input_csv_url: s3FileUrl,
      });

      return res.status(201).json({ message: 'Job created', job_id });
    } catch (error) {
      next(error);
    }
  }

  async fetchJobStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const job_id = req.query.job_id as string;
      const jobRepository = new JobRepository(Job);
      const job = await jobRepository.fetchJob(job_id);

      return res.status(201).json({
        message: 'Job status fetched',
        data: {
          job_id: job.job_id,
          status: job.status,
          input_csv_url: job.input_csv_url,
          output_csv_url: job.output_csv_url,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
