import { Request } from 'express';

/* Job Model related Constants */
export enum JobStatus {
  Queued = 'queued',
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed',
}

export enum JobType {
  ReduceQuality = 'reduceQuality',
}

export interface JobData {
  url: string;
  metadata: Record<string, any>; // Flexible type for metadata object
}

export interface IJob {
  job_id: string;
  webhook?: string;
  status: JobStatus;
  job_type: JobType;
  data: JobData[];
  input_csv_url: string;
  output_csv_url?: string;
}

export interface JobDocument extends Document {
  job_id: string;
  webhook?: string;
  status: JobStatus;
  job_type: JobType;
  data: JobData[];
  input_csv_url: string;
  output_csv_url?: string;
}

/* Middleware related related Constants */

export interface ICsvData {
  'S. No.': string;
  'Product Name': string;
  'Input Image Urls': string;
}

export interface RequestWithCSV extends Request {
  csv: ICsvData[];
}

/* Queue related related Constants */

export interface JobPayload {
  id: string;
  jobtype: JobType;
  data: JobData[];
}

/* Error handler related constants */
export interface APIError extends Error {
  status?: number;
}

/* Result queue related constants */
export enum PromiseStatus {
  Fulfilled = 'fulfilled',
  Rejected = 'rejected',
}

export interface ResultJobDataValue {
  success: boolean,
  metadata: Record<string, any>,
  url: string,
}

export interface RejectedResultJobDataValue {
  success: boolean,
  metadata: Record<string, any>,
  error: any,
  fileName: string,
}

export interface ResultJobData {
  status: PromiseStatus,
  value?: ResultJobDataValue,
  reason?: RejectedResultJobDataValue,
}

export interface IResultJob {
  jobtype: JobType,
  job_id: string,
  data: ResultJobData[],
}

/* webhook related constants */

export interface WebhookPayload {
  job_id: string;
  webhook: string;
  status: JobStatus;
  input_csv_url: string;
  output_csv_url?: string;
}
