import 'dotenv/config';
import { Worker } from 'bullmq';
import { redis } from './lib/redis';
import { processWorkflow } from './processors/workflow-processor';
import { processAgentTask } from './processors/agent-processor';
import { createLogger } from '@ai-corp/shared';

const logger = createLogger('worker');

const CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '5');

// Workflow worker
const workflowWorker = new Worker('workflow-runs', async (job) => {
  return processWorkflow(job);
}, {
  connection: redis,
  concurrency: CONCURRENCY,
  limiter: {
    max: 10,
    duration: 1000,
  },
});

workflowWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Workflow job completed');
});

workflowWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, error: err.message }, 'Workflow job failed');
});

// Agent task worker
const agentWorker = new Worker('agent-tasks', async (job) => {
  return processAgentTask(job);
}, {
  connection: redis,
  concurrency: CONCURRENCY * 2, // Agents can run more concurrently
});

agentWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Agent job completed');
});

agentWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, error: err.message }, 'Agent job failed');
});

// Notification worker (placeholder)
const notificationWorker = new Worker('notifications', async (job) => {
  logger.info({ data: job.data }, 'Processing notification');
  // Implement notification logic here
  return { sent: true };
}, {
  connection: redis,
  concurrency: 10,
});

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down workers...');
  await Promise.all([
    workflowWorker.close(),
    agentWorker.close(),
    notificationWorker.close(),
  ]);
  await redis.quit();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

logger.info('🚀 Workers started');
logger.info(`   - Workflow worker (concurrency: ${CONCURRENCY})`);
logger.info(`   - Agent worker (concurrency: ${CONCURRENCY * 2})`);
logger.info(`   - Notification worker (concurrency: 10)`);
