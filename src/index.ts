import { Scheduler } from './Scheduler/scheduler';
import { TaskQueue } from './TaskQueue/taskqueue';
import { WorkflowEngine } from './Workflow/workflow';
import { AgentCoordinator } from './AgentCoordinator/coordinator';
import { EventTriggers } from './EventTriggers/triggers';
import { BackgroundJobsManager } from './BackgroundJobs/bgJobs';
import * as Types from './types';

export {
  Scheduler,
  TaskQueue,
  WorkflowEngine,
  AgentCoordinator,
  EventTriggers,
  BackgroundJobsManager,
  Types
};

import pino from 'pino';
const logger = pino({ name: 'CozanetAutomation' });
logger.info('Cozanet Automation Engines successfully initialized.');
