import { z } from 'zod';

export const MetricSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  value: z.number(),
  labels: z.record(z.string()).optional(),
  timestamp: z.date(),
  createdAt: z.date(),
});

export type Metric = z.infer<typeof MetricSchema>;

export const CreateMetricSchema = z.object({
  organizationId: z.string(),
  name: z.string().min(1),
  value: z.number(),
  labels: z.record(z.string()).optional(),
  timestamp: z.date().optional(),
});

export type CreateMetric = z.infer<typeof CreateMetricSchema>;

export const MetricQuerySchema = z.object({
  organizationId: z.string(),
  name: z.string().optional(),
  labels: z.record(z.string()).optional(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  limit: z.number().min(1).max(10000).default(1000),
});

export type MetricQuery = z.infer<typeof MetricQuerySchema>;
