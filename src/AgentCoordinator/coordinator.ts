import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';
import { Job } from '../types';

const logger = pino({ name: 'AgentCoordinator' });

interface AgentTask {
  id: string;
  job: Job;
  agentId: string;
  status: 'assigned' | 'running' | 'completed' | 'failed' | 'cancelled';
  promiseResolve?: (value: any) => void;
  promiseReject?: (reason: any) => void;
  result?: any;
  error?: string;
}

export class AgentCoordinator {
  private activeTasks: Map<string, AgentTask> = new Map();

  async assign(task: Job, agentIds: string[]): Promise<void> {
    logger.info({ jobId: task.id, agentsCount: agentIds.length }, 'Assigning task to agents');
    
    // Logic: Split and assign work to agent swarm
    for (const agentId of agentIds) {
      const taskId = uuidv4();
      const agentTask: AgentTask = {
        id: taskId,
        job: task,
        agentId,
        status: 'assigned'
      };
      
      this.activeTasks.set(taskId, agentTask);
      logger.info({ taskId, jobId: task.id, agentId }, 'Assigned task slice to agent');
      
      // Simulate non-blocking run kickoff
      this.runAgentTask(taskId);
    }
  }

  private async runAgentTask(taskId: string): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (!task) return;

    task.status = 'running';
    logger.info({ taskId, agentId: task.agentId }, 'Agent task running');

    try {
      // Simulated agent execution logic
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
      
      if (task.status === 'cancelled') return;

      task.status = 'completed';
      task.result = { success: true, processedBy: task.agentId };
      logger.info({ taskId, agentId: task.agentId }, 'Agent task completed');
      
      if (task.promiseResolve) {
        task.promiseResolve(task.result);
      }
    } catch (err: any) {
      if (task.status === 'cancelled') return;

      task.status = 'failed';
      task.error = err.message;
      logger.error({ taskId, agentId: task.agentId, error: err.message }, 'Agent task failed');
      
      if (task.promiseReject) {
        task.promiseReject(err);
      }
    }
  }

  async waitForAll(taskIds: string[]): Promise<any[]> {
    logger.info({ taskIds }, 'Waiting for a batch of agent tasks to complete');
    
    const promises = taskIds.map(id => {
      const task = this.activeTasks.get(id);
      if (!task) {
        return Promise.reject(new Error(`Task ${id} not found`));
      }
      if (task.status === 'completed') {
        return Promise.resolve(task.result);
      }
      if (task.status === 'failed') {
        return Promise.reject(new Error(task.error));
      }
      if (task.status === 'cancelled') {
        return Promise.reject(new Error('Task was cancelled'));
      }

      return new Promise((resolve, reject) => {
        task.promiseResolve = resolve;
        task.promiseReject = reject;
      });
    });

    return Promise.all(promises);
  }

  cancelTask(taskId: string): void {
    const task = this.activeTasks.get(taskId);
    if (task && (task.status === 'assigned' || task.status === 'running')) {
      task.status = 'cancelled';
      logger.info({ taskId }, 'Task cancelled');
      if (task.promiseReject) {
        task.promiseReject(new Error('Task cancelled'));
      }
    }
  }

  getActiveTasks() {
    return Array.from(this.activeTasks.values());
  }
}
