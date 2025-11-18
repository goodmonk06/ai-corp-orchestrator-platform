import { z } from 'zod';

export const WorkflowStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  agentProfileId: z.string().optional(),
  action: z.enum(['LLM_CALL', 'TOOL_CALL', 'HUMAN_REVIEW', 'CONDITIONAL', 'PARALLEL']),
  config: z.record(z.any()),
  nextStepId: z.string().optional(),
  onError: z.enum(['STOP', 'CONTINUE', 'RETRY']).default('STOP'),
});

export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;

export const WorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  organizationId: z.string(),
  steps: z.array(WorkflowStepSchema),
  isActive: z.boolean(),
  trigger: z.enum(['MANUAL', 'SCHEDULED', 'EVENT']).default('MANUAL'),
  schedule: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Workflow = z.infer<typeof WorkflowSchema>;

export const CreateWorkflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  organizationId: z.string(),
  steps: z.array(WorkflowStepSchema),
  trigger: z.enum(['MANUAL', 'SCHEDULED', 'EVENT']).default('MANUAL'),
  schedule: z.string().optional(),
});

export type CreateWorkflow = z.infer<typeof CreateWorkflowSchema>;

export const WorkflowRunStatusSchema = z.enum([
  'PENDING',
  'RUNNING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
]);

export const WorkflowRunSchema = z.object({
  id: z.string(),
  workflowId: z.string(),
  status: WorkflowRunStatusSchema,
  currentStepId: z.string().optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  result: z.record(z.any()).optional(),
  error: z.string().optional(),
  logs: z.array(z.record(z.any())).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WorkflowRun = z.infer<typeof WorkflowRunSchema>;
