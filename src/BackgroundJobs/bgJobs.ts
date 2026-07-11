import { v4 as uuidv4 } from 'uuid';
import pino from 'pino';
import { Job } from '../types';

const logger = pino({ name: 'BackgroundJobs' });

export class BackgroundJobsManager {
  private activeJobs: Map<string, Job> = new Map();

  async startJob(name: string, type: string, payload: any, processFn: () => Promise<any>): Promise<Job> {
    const job: Job = {
      id: uuidv4(),
      name,
      type,
      payload,
      status: 'pending',
      priority: 0,
      createdAt: new Date()
    };

    this.activeJobs.set(job.id, job);
    logger.info({ jobId: job.id, name, type }, 'Starting background job');

    // Run in background non-blocking
    this.executeJob(job, processFn);

    return job;
  }

  private async executeJob(job: Job, processFn: () => Promise<any>): Promise<void> {
    job.status = 'processing';
    try {
      const result = await processFn();
      job.status = 'completed';
      job.completedAt = new Date();
      logger.info({ jobId: job.id, result }, 'Background job completed');
    } catch (err: any) {
      job.status = 'failed';
      job.completedAt = new Date();
      job.error = err.message;
      logger.error({ jobId: job.id, error: err.message }, 'Background job failed');
    }
  }

  getJob(id: string): Job | undefined {
    return this.activeJobs.get(id);
  }

  listJobs(): Job[] {
    return Array.from(this.activeJobs.values());
  }
}
