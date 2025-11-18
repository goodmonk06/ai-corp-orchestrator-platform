import { z } from 'zod';

export const AgentConversationMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant', 'agent']),
  content: z.string(),
  timestamp: z.date(),
  metadata: z.record(z.any()).optional(),
});

export type AgentConversationMessage = z.infer<typeof AgentConversationMessageSchema>;

export const AgentConversationSchema = z.object({
  id: z.string(),
  agentInstanceId: z.string(),
  workflowRunId: z.string().optional(),
  organizationId: z.string(),
  messages: z.array(AgentConversationMessageSchema),
  context: z.record(z.any()).optional(),
  summary: z.string().optional(),
  tokensUsed: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AgentConversation = z.infer<typeof AgentConversationSchema>;

export const CreateAgentConversationSchema = z.object({
  agentInstanceId: z.string(),
  workflowRunId: z.string().optional(),
  organizationId: z.string(),
  messages: z.array(AgentConversationMessageSchema),
  context: z.record(z.any()).optional(),
});

export type CreateAgentConversation = z.infer<typeof CreateAgentConversationSchema>;
