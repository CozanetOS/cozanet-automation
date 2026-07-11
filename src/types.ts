export interface Job {
  id: string;
  name: string;
  type: string;
  payload: any;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'paused';
  priority: number;
  scheduledAt?: Date;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface WorkflowStep {
  id: string;
  engineId: string;
  action: string;
  input: any;
  output?: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
}

export interface WorkflowResult {
  workflowId: string;
  status: 'completed' | 'failed';
  steps: WorkflowStep[];
  error?: string;
}

export interface ScheduledJob {
  id: string;
  name: string;
  cronExpr: string;
  active: boolean;
}

export interface QueueStatus {
  size: number;
  pending: number;
  paused: boolean;
}
