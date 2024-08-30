import mongoose, { Schema, Document } from 'mongoose';

// Define the enums for status and job_type
export enum JobStatus {
    Queued = 'queued',
    Processing = 'processing',
    Completed = 'completed',
    Failed = 'failed'
}

export enum JobType {
    ReduceQuality = 'reduceQuality'
}

// Define the interface for the Data sub-document
export interface JobData {
    url: string;
    metadata: Record<string, any>; // Flexible type for metadata object
}

export interface IJob {
    job_id: string;
    callback_url?: string;
    status: JobStatus;
    job_type: JobType;
    data: JobData[];
    input_csv_url: string;
    output_csv_url?: string;
}

// Define the main Job interface extending mongoose.Document
export interface JobDocument extends Document {
    job_id: string;
    callback_url?: string;
    status: JobStatus;
    job_type: JobType;
    data: JobData[];
    input_csv_url: string;
    output_csv_url?: string;
}

// Define the Mongoose schema
const DataSchema: Schema = new Schema({
    url: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} }
});

const JobSchema: Schema = new Schema({
    job_id: { type: String, required: true, unique: true },
    callback_url: { type: String, required: false },
    status: { type: String, enum: Object.values(JobStatus), required: true },
    job_type: { type: String, enum: Object.values(JobType), required: true },
    data: { type: [DataSchema], required: true },
    input_csv_url: { type: String, required: true },
    output_csv_url: { type: String, required: false }
});

JobSchema.index({ id: 1 }, { unique: true, name: "primary_index" });

// Create and export the Job model
export const Job = mongoose.model<JobDocument>('Job', JobSchema);