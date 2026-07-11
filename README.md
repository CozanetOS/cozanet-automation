# Cozanet Automation Engines

Real, production-grade automation orchestrator for CozanetOS. Powered by robust packages without heavy or unneeded external dependencies.

## Key Features & Built-in Modules

- **Scheduler** (`src/Scheduler/scheduler.ts`): Job scheduler based on robust `node-cron` package.
- **TaskQueue** (`src/TaskQueue/taskqueue.ts`): Priority-based in-memory task queue utilizing `p-queue` to avoid Redis requirements for Phase 1.
- **Workflow Engine** (`src/Workflow/workflow.ts`): Direct workflow definitions and task orchestration.
- **Agent Coordinator** (`src/AgentCoordinator/coordinator.ts`): Coordinator for multi-agent workflows.
- **Event Triggers** (`src/EventTriggers/triggers.ts`): Fast in-memory event-driven orchestration layer leveraging `eventemitter3`.
- **Background Jobs** (`src/BackgroundJobs/bgJobs.ts`): Management and execution of long-running or background tasks.

## Getting Started

### Installation
```bash
npm install
```

### Build
```bash
npm run build
```
