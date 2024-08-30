import { NextFunction, Request, Response } from 'express';
import { S3BucketService } from '../services';
import { readFileSync, unlinkSync } from 'fs';
import { S3_BUCKET_URL, } from '../config';
import { RequestWithCSV } from "../midddleware"

export class JobController {

  async createNewJobController(
    req: RequestWithCSV,
    res: Response,
    next: NextFunction
  ) {
    try {
      console.log(req.file);

        await (new S3BucketService()).uploadFile(readFileSync(req.file.path), req.file.filename);
        unlinkSync(req.file.path);
        
        const s3FileUrl = `${S3_BUCKET_URL}${req.file.filename}`;
        const csvData = req.csv;



      return res.status(201).json({ message: 'Job created', s3FileUrl });
    } catch (error) {
      next(error);
    }
  }
}
