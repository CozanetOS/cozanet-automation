import cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';
import pino from 'pino';
import { ScheduledJob } from '../types';

const logger = pino({ name: 'Scheduler' });

export class Scheduler {
  private tasks: Map<string, { job: ScheduledJob; task: cron.ScheduledTask; handler: () => Promise<void> }> = new Map();

  schedule(name: string, cronExpr: string, handler: () => Promise<void>): string {
    if (!cron.validate(cronExpr)) {
      throw new Error(`Invalid cron expression: ${cronExpr}`);
    }

    const id = uuidv4();
    const task = cron.schedule(cronExpr, async () => {
      logger.info({ id, name }, 'Executing scheduled job');
      try {
        await handler();
        logger.info({ id, name }, 'Scheduled job completed successfully');
      } catch (err: any) {
        logger.error({ id, name, error: err.message }, 'Scheduled job execution failed');
      }
    });

    const job: ScheduledJob = { id, name, cronExpr, active: true };
    this.tasks.set(id, { job, task, handler });
    logger.info({ id, name, cronExpr }, 'Job scheduled successfully');
    return id;
  }

  unschedule(id: string): void {
    const entry = this.tasks.get(id);
    if (!entry) {
      logger.warn({ id }, 'Job not found for unscheduling');
      return;
    }
    entry.task.stop();
    this.tasks.delete(id);
    logger.info({ id, name: entry.job.name }, 'Job unscheduled successfully');
  }

  listScheduled(): ScheduledJob[] {
    return Array.from(this.tasks.values()).map(entry => entry.job);
  }

  pauseAll(): void {
    for (const [id, entry] of this.tasks.entries()) {
      if (entry.job.active) {
        entry.task.stop();
        entry.job.active = false;
        logger.info({ id, name: entry.job.name }, 'Job paused');
      }
    }
  }

  resumeAll(): void {
    for (const [id, entry] of this.tasks.entries()) {
      if (!entry.job.active) {
        entry.task.start();
        entry.job.active = true;
        logger.info({ id, name: entry.job.name }, 'Job resumed');
      }
    }
  }
}
