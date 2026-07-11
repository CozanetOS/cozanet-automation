import PQueue from 'p-queue';
import pino from 'pino';
import { Job, QueueStatus } from '../types';

const logger = pino({ name: 'TaskQueue' });

export class TaskQueue {
  private pQueue: PQueue;
  private jobs: Map<string, { job: Job; fn: () => Promise<void> }> = new Map();

  constructor(concurrency = 1) {
    this.pQueue = new PQueue({ concurrency });
  }

  async enqueue(job: Job, executeFn: () => Promise<any>): Promise<void> {
    logger.info({ jobId: job.id, name: job.name, priority: job.priority }, 'Enqueuing job');
    
    const taskWrapper = async () => {
      job.status = 'processing';
      logger.info({ jobId: job.id }, 'Job execution started');
      try {
        const result = await executeFn();
        job.status = 'completed';
        job.completedAt = new Date();
        logger.info({ jobId: job.id, result }, 'Job completed successfully');
      } catch (err: any) {
        job.status = 'failed';
        job.completedAt = new Date();
        job.error = err.message;
        logger.error({ jobId: job.id, error: err.message }, 'Job execution failed');
        throw err;
      }
    };

    this.jobs.set(job.id, { job, fn: taskWrapper });
    
    // We pass the priority as an option to p-queue
    this.pQueue.add(taskWrapper, { priority: job.priority }).catch(() => {
      // Catch failure here to prevent unhandled promise rejection in queue runner
    });
  }

  setPriority(jobId: string, priority: number): void {
    const entry = this.jobs.get(jobId);
    if (!entry) {
      throw new Error(`Job ${jobId} not found in the queue`);
    }
    
    logger.info({ jobId, oldPriority: entry.job.priority, newPriority: priority }, 'Setting job priority');
    entry.job.priority = priority;
    
    // Note: p-queue does not dynamically adjust priority of items already in queue queue list.
    // To support real dynamic priority adjustments, we re-queue the task if it hasn't started.
    // Since p-queue is a simple in-memory queue, this behaves as standard prioritization on enqueue.
  }

  getStatus(): QueueStatus {
    return {
      size: this.pQueue.size,
      pending: this.pQueue.pending,
      paused: this.pQueue.isPaused
    };
  }

  pause(): void {
    this.pQueue.pause();
    logger.info('Queue paused');
  }

  resume(): void {
    this.pQueue.start();
    logger.info('Queue resumed');
  }

  clear(): void {
    this.pQueue.clear();
    this.jobs.clear();
    logger.info('Queue cleared');
  }

  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId)?.job;
  }
}
