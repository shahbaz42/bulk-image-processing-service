import { Job } from '../models';
import {
  JobDocument,
  IJob,
  JobStatus,
  ResultJobData,
  PromiseStatus,
} from '../../constants';

export class JobRepository {
  constructor(private jobModel: typeof Job) {}

  /**
   * Creates a new job in the database.
   *
   * @param data - The data for the job.
   * @returns A promise that resolves to the created job document.
   */
  async createJob(data: IJob): Promise<JobDocument> {
    return this.jobModel.create(data);
  }

  /**
   * Fetches a job by its ID.
   * @param id - The ID of the job to fetch.
   * @returns A Promise that resolves to the fetched JobDocument.
   */
  async fetchJob(id: string): Promise<JobDocument> {
    return this.jobModel.findOne({
      job_id: id,
    });
  }

  /**
   * Updates the status of a job in the database.
   * @param job_id - The ID of the job to update.
   * @param status - The new status of the job.
   * @returns A Promise that resolves to the updated JobDocument.
   */
  async markJobAsComplete(
    job_id: string,
    output_csv_url: string
  ): Promise<JobDocument> {
    return this.jobModel.findOneAndUpdate(
      { job_id: job_id },
      { output_csv_url, status: JobStatus.Completed },
      { new: true } // Return the updated document
    );
  }

  /**
   * Saves the processed data for a job.
   * @param job_id - The ID of the job.
   * @param data - An array of ResultJobData objects representing the processed data.
   * @returns A Promise that resolves to the updated JobDocument.
   */
  async saveProcessedData(
    job_id: string,
    data: ResultJobData[]
  ): Promise<JobDocument> {
    const processed_data = [];

    for (const obj of data) {
      if (obj.status === PromiseStatus.Fulfilled) {
        processed_data.push({
          url: obj.value.url,
          metadata: obj.value.metadata,
        });
      } else {
        processed_data.push({
          url: obj.reason.fileName,
          metadata: obj.reason.metadata,
        });
      }
    }

    return this.jobModel.findOneAndUpdate(
      { job_id: job_id },
      { processed_data },
      { new: true }
    );
  }

  /**
   * Sets the webhook_sent flag to true for a specific job.
   * @param job_id - The ID of the job.
   * @returns A promise that resolves to the updated JobDocument.
   */
  async setWebhookSent(job_id: string): Promise<JobDocument> {
    return this.jobModel.findOneAndUpdate(
      { job_id },
      { webhook_sent: true },
      { new: true }
    );
  }
}
