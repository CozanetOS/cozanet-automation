# CozanetOS Automation: Multi-Agent Workflows & Task Orchestration

An integral component of **CozanetOS**—the AI-native operating system designed for frictionless human-agent collaboration.

---

## Overview

CozanetOS Automation is the orchestrator, scheduler, and background job engine powering automated operations on CozanetOS. It drives long-running tasks, schedules complex workflows, coordinates multiple specialized agents, manages event-driven triggers, and guarantees transactionally safe execution with dead-letter queue recovery.

---

## Core Capabilities

- **Scheduled Tasks (Cron)**: Set up and execute highly scalable recurring operations using a resilient, cluster-friendly cron expression scheduler.
- **Workflow Automation**: Define complex multi-step routines using intuitive visual graphs or direct code definitions with state tracking.
- **Background Jobs Engine**: Offload heavy computational, parsing, or sync workloads to isolated background worker processes with robust retry mechanics.
- **Agent Delegation**: Coordinate multiple specialized AI agents, mapping out subtasks, validating output, and synthesizing final results.
- **Event Triggers**: Respond instantaneously to system events such as file alterations, database records updating, incoming API calls, or email receptions.
- **Resilient Queue Management**: Advanced job distribution backing FIFO, priority prioritization, delay options, and automatic concurrency limiting.
- **Recurring System Reports**: Schedule periodic daily briefings, metrics summaries, weekly usage statements, and system health status dispatches.
- **Long-Running Tasks Support**: Run long tasks (spanning multiple hours or days) with structured task progress updates, checkpoints, and resuming support.
- **Real-time Progress Tracking**: Monitor active workflows with step-by-step progress, duration stats, and active payload inspection via an integrated dashboard.
- **Workflow Templates**: Jumpstart automation using prebuilt patterns for continuous integration, web scraping, data synchronization, and support ticketing.
- **Conditional Logic**: Express complex workflow branching utilizing rich if/else conditions, switch statements, and loop iterators.
- **Parallel Step Execution**: Boost performance by executing non-dependent workflow nodes in parallel with aggregate join resolutions.
- **Error Handling & Fallbacks**: Configure custom retry policies, exponential backoffs, fallback actions, and dead-letter queues (DLQ).
- **Webhook Triggers**: Receive external webhooks secure-signed with customizable HMAC verification to initiate custom automation pipelines.
- **Full Audit Logging**: Record step inputs, outputs, timestamps, logs, and token usages, enabling full playback, forensic auditing, and performance analysis.

---

## Architecture & Components

The cozanet-automation architecture is built for absolute reliability and horizontal scalability:
1. **Automation Broker**: The centralized task dispatcher that evaluates event triggers and reads workflow graphs.
2. **Task Queue Coordinator**: A persistent, Redis-backed priority queue managing delayed, active, and failed task lists.
3. **Execution Workers**: Isolated, stateless runtime containers executing specific workflow steps, agents, or system scripts.
4. **State Storage & Audit Db**: Keeps track of runtime state snapshots, execution histories, and logs for every automation instance.

---

## API & Interface Overview

Here is an example of interacting with this module programmatically:

```typescript
import { Workflow, EventTrigger } from '@cozanetos/automation';

// Define a new automation workflow programmatically
const fileProcessWorkflow = new Workflow('process-uploaded-pdf');

fileProcessWorkflow
  .on(EventTrigger.FILE_CREATED, { pattern: '/uploads/*.pdf' })
  .step('ocr', async (ctx) => {
    return await ctx.agents.ocrReader.extractText(ctx.event.filePath);
  })
  .step('summarize', async (ctx) => {
    return await ctx.agents.summarizer.generateSummary(ctx.steps.ocr.output);
  })
  .step('notify', async (ctx) => {
    await ctx.notifications.sendSlack({
      channel: '#docs',
      text: `New summary ready: ${ctx.steps.summarize.output}`
    });
  });

fileProcessWorkflow.register();
```

---

## Integration with Other CozanetOS Modules

This module is designed to interact seamlessly with other core layers of the CozanetOS ecosystem:

- **cozanet-core**: Integrates with the core OS filesystem, security domains, and central SQLite/Postgres datastores.
- **cozanet-agents**: Operates as the brain delegating and supervising agents assigned to specific automation steps.
- **cozanet-communication**: Dispatches notifications via Slack, Discord, Email, or SMS upon workflow updates or failures.
- **cozanet-monitoring**: Tracks execution timings, errors, queue backlogs, and memory overhead across automation clusters.

---

## Quick-Start Notes

To begin using **cozanet-automation** inside your CozanetOS development environment:

### 1. Installation
Add the module to your application:
```bash
npm install @cozanetos/automation
# or
yarn add @cozanetos/automation
```

### 2. Configuration
Ensure your environment variables are configured in your `.env` file or registered inside your CozanetOS dashboard:
```env
COZANET_ENV=development
# Add module-specific configuration as required
```

### 3. Initialize & Run
Import the core module and start the process:
```javascript
import { Initialize } from '@cozanetos/automation';

Initialize().then(() => {
  console.log('cozanet-automation initialized successfully within CozanetOS.');
});
```

---

## License & Support
Part of the CozanetOS open platform suite. For security disclosures, active status monitors, or developer support, please visit the central CozanetOS portal.
