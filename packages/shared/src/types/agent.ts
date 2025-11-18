import { z } from 'zod';

export const AgentRoleSchema = z.enum([
  'CEO',
  'CFO',
  'CTO',
  'CMO',
  'HR',
  'PM',
  'DEVELOPER',
  'DESIGNER',
  'ANALYST',
  'CUSTOM',
]);
export type AgentRole = z.infer<typeof AgentRoleSchema>;

export const AgentProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: AgentRoleSchema,
  organizationId: z.string(),
  personality: z.string().optional(),
  systemPrompt: z.string(),
  allowedTools: z.array(z.string()).optional(),
  model: z.string().default('gpt-4-turbo-preview'),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().default(2000),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AgentProfile = z.infer<typeof AgentProfileSchema>;

export const CreateAgentProfileSchema = z.object({
  name: z.string().min(1),
  role: AgentRoleSchema,
  organizationId: z.string(),
  personality: z.string().optional(),
  systemPrompt: z.string(),
  allowedTools: z.array(z.string()).optional(),
  model: z.string().default('gpt-4-turbo-preview'),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().default(2000),
});

export type CreateAgentProfile = z.infer<typeof CreateAgentProfileSchema>;

export const AgentInstanceSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  workflowRunId: z.string().optional(),
  context: z.record(z.any()).optional(),
  state: z.enum(['IDLE', 'THINKING', 'ACTING', 'WAITING', 'COMPLETED', 'ERROR']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AgentInstance = z.infer<typeof AgentInstanceSchema>;
