import { v4 as uuidv4 } from 'uuid';
import pino from 'pino';
import { Workflow, WorkflowStep, WorkflowResult } from '../types';

const logger = pino({ name: 'WorkflowEngine' });

export class WorkflowEngine {
  readonly id = 'automation:workflow';
  private workflows: Map<string, Workflow> = new Map();
  private stepExecutors: Map<string, (input: any) => Promise<any>> = new Map();

  registerStepExecutor(action: string, executor: (input: any) => Promise<any>): void {
    this.stepExecutors.set(action, executor);
  }

  createWorkflow(name: string, steps: WorkflowStep[]): Workflow {
    const workflow: Workflow = {
      id: uuidv4(),
      name,
      steps: steps.map(step => ({ ...step, status: 'pending' })),
      status: 'pending'
    };
    this.workflows.set(workflow.id, workflow);
    logger.info({ workflowId: workflow.id, name }, 'Workflow created');
    return workflow;
  }

  getWorkflow(id: string): Workflow {
    const workflow = this.workflows.get(id);
    if (!workflow) {
      throw new Error(`Workflow ${id} not found`);
    }
    return workflow;
  }

  pauseWorkflow(id: string): void {
    const workflow = this.getWorkflow(id);
    if (workflow.status === 'running') {
      workflow.status = 'paused';
      logger.info({ workflowId: id }, 'Workflow paused');
    }
  }

  async executeWorkflow(workflowId: string): Promise<WorkflowResult> {
    const workflow = this.getWorkflow(workflowId);
    if (workflow.status === 'running') {
      throw new Error(`Workflow ${workflowId} is already running`);
    }

    workflow.status = 'running';
    logger.info({ workflowId }, 'Starting workflow execution');

    for (const step of workflow.steps) {
      if (workflow.status === 'paused') {
        logger.info({ workflowId, stepId: step.id }, 'Workflow execution paused mid-stream');
        return { workflowId, status: 'failed', steps: workflow.steps, error: 'Workflow paused' };
      }

      step.status = 'running';
      logger.info({ workflowId, stepId: step.id, action: step.action }, 'Executing step');

      const executor = this.stepExecutors.get(step.action);
      if (!executor) {
        step.status = 'failed';
        workflow.status = 'failed';
        const errorMsg = `No executor registered for step action: ${step.action}`;
        logger.error({ workflowId, stepId: step.id, action: step.action }, errorMsg);
        return { workflowId, status: 'failed', steps: workflow.steps, error: errorMsg };
      }

      try {
        const output = await executor(step.input);
        step.status = 'completed';
        step.output = output;
        logger.info({ workflowId, stepId: step.id }, 'Step completed successfully');
      } catch (err: any) {
        step.status = 'failed';
        workflow.status = 'failed';
        logger.error({ workflowId, stepId: step.id, error: err.message }, 'Step failed');
        return { workflowId, status: 'failed', steps: workflow.steps, error: err.message };
      }
    }

    workflow.status = 'completed';
    logger.info({ workflowId }, 'Workflow executed successfully');
    return { workflowId, status: 'completed', steps: workflow.steps };
  }
}
