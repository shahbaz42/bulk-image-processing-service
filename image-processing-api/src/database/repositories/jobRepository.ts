import { Job, JobDocument, IJob } from '../models';

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
}
