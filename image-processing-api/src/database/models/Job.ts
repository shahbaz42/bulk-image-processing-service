import mongoose, { Schema, Document } from 'mongoose';
import {JobStatus, JobType, JobDocument} from '../../constants'

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
    processed_data: { type: [DataSchema], required: false },
    input_csv_url: { type: String, required: true },
    output_csv_url: { type: String, required: false }
});

// Create and export the Job model
export const Job = mongoose.model<JobDocument>('Job', JobSchema);