import { z } from 'zod';

export const JobTypeSchema = z.enum([
  'WORKFLOW_RUN',
  'AGENT_TASK',
  'DATA_SYNC',
  'NOTIFICATION',
  'CLEANUP',
]);

export const JobStatusSchema = z.enum([
  'QUEUED',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'RETRYING',
]);

export const JobSchema = z.object({
  id: z.string(),
  type: JobTypeSchema,
  status: JobStatusSchema,
  organizationId: z.string(),
  payload: z.record(z.any()),
  result: z.record(z.any()).optional(),
  error: z.string().optional(),
  attempts: z.number().default(0),
  maxAttempts: z.number().default(3),
  scheduledFor: z.date().optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Job = z.infer<typeof JobSchema>;
