import { Job } from 'bullmq';
import { prisma } from '../lib/prisma';
import { createLogger, createLLMClient, VectorKnowledgeClient, AutomationRecipeClient } from '@ai-corp/shared';

const logger = createLogger('workflow-processor');
const llmClient = createLLMClient();
const vectorClient = new VectorKnowledgeClient();
const recipeClient = new AutomationRecipeClient();

interface WorkflowJobData {
  runId: string;
  workflowId: string;
  organizationId: string;
  initialContext?: Record<string, any>;
}

interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  agentProfileId?: string;
  action: 'LLM_CALL' | 'TOOL_CALL' | 'HUMAN_REVIEW' | 'CONDITIONAL' | 'PARALLEL';
  config: Record<string, any>;
  nextStepId?: string;
  onError: 'STOP' | 'CONTINUE' | 'RETRY';
}

export async function processWorkflow(job: Job<WorkflowJobData>) {
  const { runId, workflowId, organizationId, initialContext = {} } = job.data;

  logger.info({ runId, workflowId }, 'Starting workflow execution');

  try {
    // Update run status
    await prisma.workflowRun.update({
      where: { id: runId },
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
        logs: {
          type: 'START',
          timestamp: new Date(),
          message: 'Workflow execution started',
        },
      },
    });

    // Fetch workflow
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const steps = workflow.steps as WorkflowStep[];
    let context = { ...initialContext };
    let currentStepId = steps[0]?.id;

    // Execute steps sequentially
    while (currentStepId) {
      const step = steps.find((s) => s.id === currentStepId);
      if (!step) break;

      logger.info({ stepId: step.id, stepName: step.name }, 'Executing step');

      try {
        // Update current step
        await prisma.workflowRun.update({
          where: { id: runId },
          data: { currentStepId: step.id },
        });

        // Execute step
        const stepResult = await executeStep(step, context, organizationId);
        context = { ...context, ...stepResult };

        // Log step completion
        await addLog(runId, {
          type: 'STEP_COMPLETED',
          stepId: step.id,
          stepName: step.name,
          timestamp: new Date(),
          result: stepResult,
        });

        currentStepId = step.nextStepId;
      } catch (error: any) {
        logger.error({ error, stepId: step.id }, 'Step execution failed');

        await addLog(runId, {
          type: 'STEP_ERROR',
          stepId: step.id,
          stepName: step.name,
          timestamp: new Date(),
          error: error.message,
        });

        if (step.onError === 'STOP') {
          throw error;
        } else if (step.onError === 'RETRY') {
          // Retry logic could be added here
          throw error;
        }
        // CONTINUE: move to next step
        currentStepId = step.nextStepId;
      }
    }

    // Mark as completed
    await prisma.workflowRun.update({
      where: { id: runId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        result: context,
      },
    });

    logger.info({ runId }, 'Workflow execution completed');
    return context;
  } catch (error: any) {
    logger.error({ error, runId }, 'Workflow execution failed');

    await prisma.workflowRun.update({
      where: { id: runId },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        error: error.message,
      },
    });

    throw error;
  }
}

async function executeStep(
  step: WorkflowStep,
  context: Record<string, any>,
  organizationId: string
): Promise<Record<string, any>> {
  switch (step.action) {
    case 'LLM_CALL':
      return executeLLMCall(step, context, organizationId);
    case 'TOOL_CALL':
      return executeToolCall(step, context);
    case 'HUMAN_REVIEW':
      return executeHumanReview(step, context);
    case 'CONDITIONAL':
      return executeConditional(step, context);
    case 'PARALLEL':
      return executeParallel(step, context, organizationId);
    default:
      throw new Error(`Unknown action type: ${step.action}`);
  }
}

async function executeLLMCall(
  step: WorkflowStep,
  context: Record<string, any>,
  organizationId: string
): Promise<Record<string, any>> {
  const { prompt, agentProfileId } = step.config;

  let agentConfig = {};
  if (step.agentProfileId || agentProfileId) {
    const profile = await prisma.agentProfile.findFirst({
      where: {
        id: step.agentProfileId || agentProfileId,
        organizationId,
      },
    });

    if (profile) {
      agentConfig = {
        model: profile.model,
        temperature: profile.temperature,
        maxTokens: profile.maxTokens,
        systemPrompt: profile.systemPrompt,
      };
    }
  }

  // Replace variables in prompt
  const processedPrompt = replaceVariables(prompt, context);

  const response = await llmClient.complete(processedPrompt, agentConfig);

  return {
    [`${step.id}_response`]: response.content,
    [`${step.id}_usage`]: response.usage,
  };
}

async function executeToolCall(
  step: WorkflowStep,
  context: Record<string, any>
): Promise<Record<string, any>> {
  const { toolName, params } = step.config;

  // Built-in tools
  if (toolName === 'vector_search') {
    const result = await vectorClient.search(params.query, params.limit);
    return { [`${step.id}_result`]: result };
  } else if (toolName === 'automation_recipe') {
    const result = await recipeClient.executeRecipe(params.recipeId, params.params);
    return { [`${step.id}_result`]: result };
  }

  // Custom tool execution would go here
  throw new Error(`Unknown tool: ${toolName}`);
}

async function executeHumanReview(
  step: WorkflowStep,
  context: Record<string, any>
): Promise<Record<string, any>> {
  // In a real implementation, this would create a notification/task for human review
  // For now, we'll just log it
  logger.info({ step, context }, 'Human review required');
  return {
    [`${step.id}_status`]: 'PENDING_REVIEW',
    [`${step.id}_context`]: context,
  };
}

async function executeConditional(
  step: WorkflowStep,
  context: Record<string, any>
): Promise<Record<string, any>> {
  const { condition, trueValue, falseValue } = step.config;

  // Simple condition evaluation (in production, use a proper expression evaluator)
  const result = evaluateCondition(condition, context);

  return {
    [`${step.id}_result`]: result ? trueValue : falseValue,
    [`${step.id}_condition_met`]: result,
  };
}

async function executeParallel(
  step: WorkflowStep,
  context: Record<string, any>,
  organizationId: string
): Promise<Record<string, any>> {
  const { steps: parallelSteps } = step.config;

  // Execute all steps in parallel
  const results = await Promise.all(
    parallelSteps.map((s: WorkflowStep) => executeStep(s, context, organizationId))
  );

  // Merge all results
  return results.reduce((acc, result) => ({ ...acc, ...result }), {});
}

function replaceVariables(template: string, context: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return context[key] !== undefined ? String(context[key]) : match;
  });
}

function evaluateCondition(condition: string, context: Record<string, any>): boolean {
  // Simple condition evaluation
  // In production, use a proper expression evaluator library
  try {
    const func = new Function(...Object.keys(context), `return ${condition}`);
    return func(...Object.values(context));
  } catch {
    return false;
  }
}

async function addLog(runId: string, log: Record<string, any>) {
  const run = await prisma.workflowRun.findUnique({
    where: { id: runId },
    select: { logs: true },
  });

  const logs = (run?.logs as any[]) || [];
  logs.push(log);

  await prisma.workflowRun.update({
    where: { id: runId },
    data: { logs },
  });
}
