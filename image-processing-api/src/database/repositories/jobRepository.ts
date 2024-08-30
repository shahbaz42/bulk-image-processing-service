import { Job } from '../models';
import { JobDocument, IJob, JobStatus } from '../../constants';

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
  async MarkJobAsComplete(
    job_id: string,
    output_csv_url: string
  ): Promise<JobDocument> {
    return this.jobModel.findOneAndUpdate(
      { job_id: job_id },
      { output_csv_url, status: JobStatus.Completed },
      { new: true } // Return the updated document
    );
  }
}
