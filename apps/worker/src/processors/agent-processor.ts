import { Job } from 'bullmq';
import { prisma } from '../lib/prisma';
import { createLogger, createLLMClient } from '@ai-corp/shared';

const logger = createLogger('agent-processor');
const llmClient = createLLMClient();

interface AgentJobData {
  agentProfileId: string;
  task: string;
  context?: Record<string, any>;
  organizationId: string;
}

export async function processAgentTask(job: Job<AgentJobData>) {
  const { agentProfileId, task, context = {}, organizationId } = job.data;

  logger.info({ agentProfileId, task }, 'Processing agent task');

  try {
    // Fetch agent profile
    const profile = await prisma.agentProfile.findFirst({
      where: {
        id: agentProfileId,
        organizationId,
      },
    });

    if (!profile) {
      throw new Error('Agent profile not found');
    }

    // Create agent instance
    const instance = await prisma.agentInstance.create({
      data: {
        profileId: agentProfileId,
        context,
        state: 'THINKING',
      },
    });

    // Execute task with LLM
    const response = await llmClient.complete(task, {
      model: profile.model,
      temperature: profile.temperature,
      maxTokens: profile.maxTokens,
      systemPrompt: profile.systemPrompt,
    });

    // Update instance state
    await prisma.agentInstance.update({
      where: { id: instance.id },
      data: {
        state: 'COMPLETED',
        context: {
          ...context,
          response: response.content,
          usage: response.usage,
        },
      },
    });

    logger.info({ agentProfileId, instanceId: instance.id }, 'Agent task completed');

    return {
      instanceId: instance.id,
      response: response.content,
      usage: response.usage,
    };
  } catch (error: any) {
    logger.error({ error, agentProfileId }, 'Agent task failed');
    throw error;
  }
}
